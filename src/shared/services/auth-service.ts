/**
 * 认证服务 - REST API 版本
 * 使用 Firebase REST API 替代 SDK，符合 Manifest V3 规范
 * 
 * 负责：
 * 1. Google 登录/登出
 * 2. 用户状态管理
 * 3. 认证状态持久化
 * 4. Token 自动刷新
 */

import { FirebaseRestAuth, type FirebaseSignInResponse } from './firebase-rest-auth'
import { firebaseConfig } from '../config/firebase'
import { User, AuthState, AuthError, AuthErrorType } from '../types/auth'
import { migrateLocalDataToCloud, isMigrated } from './data-migration'
import { syncService } from './sync-service'

/**
 * 认证服务类
 */
class AuthServiceRest {
  private firebaseAuth: FirebaseRestAuth
  private authStateListeners: Set<(state: AuthState) => void> = new Set()
  private tokenRefreshTimer: number | null = null
  private cachedAuthState: AuthState = {
    isSignedIn: false,
    user: null,
    lastUpdated: Date.now(),
  }

  constructor() {
    this.firebaseAuth = new FirebaseRestAuth(firebaseConfig.apiKey)
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    console.log('[AuthService] Initializing REST API version...')
    
    // 加载保存的认证状态
    const savedState = await this.loadAuthState()
    this.cachedAuthState = savedState
    
    if (savedState.isSignedIn && savedState.user) {
      // 验证 token 是否有效
      if (this.firebaseAuth.isTokenValid(savedState.user.idToken!)) {
        console.log('[AuthService] Restored valid auth state')
        this.notifyListeners(savedState)
        this.scheduleTokenRefresh(savedState.user.idToken!)
      } else {
        // Token 过期，尝试刷新
        console.log('[AuthService] Token expired, refreshing...')
        try {
          await this.refreshToken(savedState.user.refreshToken!)
        } catch (error) {
          console.error('[AuthService] Token refresh failed:', error)
          await this.signOut()
        }
      }
    }
  }

  /**
   * 使用 Google 登录
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // 使用 launchWebAuthFlow 获取 ID token
      const idToken = await this.launchWebAuthFlow()

      // 使用 Firebase REST API 登录
      const firebaseUser = await this.firebaseAuth.signInWithGoogle(idToken)

      const user = this.buildUser(firebaseUser)

      // 保存认证状态
      const authState: AuthState = {
        isSignedIn: true,
        user,
        lastUpdated: Date.now(),
        accessToken: firebaseUser.idToken,
      }

      await this.saveAuthState(authState)
      this.cachedAuthState = authState
      this.notifyListeners(authState)

      // 设置 token 刷新
      this.scheduleTokenRefresh(firebaseUser.idToken)

      // 处理登录后操作
      await this.handlePostLogin(firebaseUser.localId)

      console.log('[AuthService] Sign in successful:', user.email)
      return user
    } catch (error) {
      console.error('[AuthService] Sign in failed:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * 使用 launchWebAuthFlow 获取 Google ID token
   */
  private async launchWebAuthFlow(): Promise<string> {
    const redirectUrl = chrome.identity.getRedirectURL()
    const clientId = '681396856351-la69jc71l4b3msoop2ckuo6jt5ao2q3t.apps.googleusercontent.com'
    
    // 构建 OAuth2 URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'id_token')
    authUrl.searchParams.set('redirect_uri', redirectUrl)
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('nonce', this.generateNonce())

    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl.toString(),
          interactive: true,
        },
        (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(
              this.createError(
                AuthErrorType.USER_CANCELLED,
                chrome.runtime.lastError.message || 'Authentication failed'
              )
            )
            return
          }

          if (!responseUrl) {
            reject(this.createError(AuthErrorType.UNKNOWN, 'No response URL'))
            return
          }

          // 从 URL fragment 中提取 id_token
          const url = new URL(responseUrl)
          const params = new URLSearchParams(url.hash.substring(1))
          const idToken = params.get('id_token')

          if (!idToken) {
            reject(this.createError(AuthErrorType.UNKNOWN, 'No ID token in response'))
            return
          }

          resolve(idToken)
        }
      )
    })
  }

  /**
   * 生成随机 nonce
   */
  private generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 构建用户对象
   */
  private buildUser(firebaseUser: FirebaseSignInResponse): User {
    return {
      uid: firebaseUser.localId,
      displayName: firebaseUser.displayName || firebaseUser.email,
      email: firebaseUser.email,
      photoURL: null,
      emailVerified: firebaseUser.registered,
      idToken: firebaseUser.idToken,
      refreshToken: firebaseUser.refreshToken,
    }
  }

  /**
   * 刷新 Token
   */
  private async refreshToken(refreshToken: string): Promise<void> {
    try {
      const response = await this.firebaseAuth.refreshToken(refreshToken)
      
      const savedState = await this.loadAuthState()
      if (savedState.user) {
        savedState.user.idToken = response.id_token
        savedState.user.refreshToken = response.refresh_token
        savedState.accessToken = response.id_token
        savedState.lastUpdated = Date.now()

        await this.saveAuthState(savedState)
        this.cachedAuthState = savedState
        this.notifyListeners(savedState)

        // 重新设置刷新定时器
        this.scheduleTokenRefresh(response.id_token)

        console.log('[AuthService] Token refreshed successfully')
      }
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error)
      throw error
    }
  }

  /**
   * 设置 Token 自动刷新
   * Firebase token 有效期为 1 小时，我们在 50 分钟后刷新
   */
  private scheduleTokenRefresh(idToken: string): void {
    // 清除现有定时器
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer)
    }

    // 解析 token 获取过期时间
    try {
      const payloadBase64 = idToken.split('.')[1]
      const payloadJson = globalThis.atob(payloadBase64)
      const payload = JSON.parse(payloadJson)
      const expiresAt = payload.exp * 1000 // 转换为毫秒
      const now = Date.now()
      const refreshIn = expiresAt - now - 10 * 60 * 1000 // 提前 10 分钟刷新

      if (refreshIn > 0) {
        this.tokenRefreshTimer = window.setTimeout(async () => {
          const state = await this.loadAuthState()
          if (state.user?.refreshToken) {
            try {
              await this.refreshToken(state.user.refreshToken)
            } catch (error) {
              console.error('[AuthService] Auto refresh failed:', error)
              await this.signOut()
            }
          }
        }, refreshIn)

        console.log(`[AuthService] Token refresh scheduled in ${Math.round(refreshIn / 1000 / 60)} minutes`)
      }
    } catch (error) {
      console.error('[AuthService] Failed to schedule token refresh:', error)
    }
  }

  /**
   * 退出登录
   */
  async signOut(): Promise<void> {
    try {
      // 清除刷新定时器
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer)
        this.tokenRefreshTimer = null
      }

      // 清除本地状态
      await this.clearAuthState()

      const authState: AuthState = {
        isSignedIn: false,
        user: null,
        lastUpdated: Date.now(),
      }

      this.cachedAuthState = authState
      this.notifyListeners(authState)

      console.log('[AuthService] Sign out successful')
    } catch (error) {
      console.error('[AuthService] Sign out failed:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * 获取当前用户（同步方法）
   */
  getCurrentUser(): User | null {
    return this.cachedAuthState.user
  }

  /**
   * 检查是否已登录（同步方法）
   */
  isSignedIn(): boolean {
    return this.cachedAuthState.isSignedIn && this.cachedAuthState.user !== null
  }

  /**
   * 获取认证状态
   */
  async getAuthState(): Promise<AuthState> {
    const state = await this.loadAuthState()
    
    // 检查 token 是否有效
    if (state.isSignedIn && state.user?.idToken) {
      if (!this.firebaseAuth.isTokenValid(state.user.idToken)) {
        // Token 过期，尝试刷新
        if (state.user.refreshToken) {
          try {
            await this.refreshToken(state.user.refreshToken)
            return await this.loadAuthState()
          } catch (error) {
            console.error('[AuthService] Token refresh failed:', error)
            await this.signOut()
            return { isSignedIn: false, user: null, lastUpdated: Date.now() }
          }
        }
      }
    }

    return state
  }

  /**
   * 更新用户显示名称
   */
  async updateDisplayName(displayName: string): Promise<void> {
    const state = await this.loadAuthState()
    
    if (!state.isSignedIn || !state.user?.idToken) {
      throw new Error('Not signed in')
    }

    await this.firebaseAuth.updateProfile({
      idToken: state.user.idToken,
      displayName,
    })

    state.user.displayName = displayName
    await this.saveAuthState(state)
    this.cachedAuthState = state
    this.notifyListeners(state)

    console.log('[AuthService] Display name updated:', displayName)
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    this.authStateListeners.add(callback)

    // 立即调用一次回调，传递当前状态
    this.loadAuthState().then((state) => {
      callback(state)
    })

    // 返回取消监听的函数
    return () => {
      this.authStateListeners.delete(callback)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(state: AuthState): void {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(state)
      } catch (error) {
        console.error('[AuthService] Listener error:', error)
      }
    })
  }

  /**
   * 保存认证状态到 Chrome Storage
   */
  private async saveAuthState(state: AuthState): Promise<void> {
    try {
      await chrome.storage.local.set({ authState: state })
      console.log('[AuthService] Auth state saved')
    } catch (error) {
      console.error('[AuthService] Failed to save auth state:', error)
    }
  }

  /**
   * 从 Chrome Storage 加载认证状态（公开方法）
   */
  async loadAuthState(): Promise<AuthState> {
    try {
      const result = await chrome.storage.local.get('authState')
      if (result.authState) {
        const state = result.authState as AuthState
        this.cachedAuthState = state
        return state
      }
    } catch (error) {
      console.error('[AuthService] Failed to load auth state:', error)
    }

    // 返回默认状态
    const defaultState: AuthState = {
      isSignedIn: false,
      user: null,
      lastUpdated: Date.now(),
    }
    this.cachedAuthState = defaultState
    return defaultState
  }

  /**
   * 清除认证状态
   */
  private async clearAuthState(): Promise<void> {
    try {
      await chrome.storage.local.remove('authState')
      console.log('[AuthService] Auth state cleared')
    } catch (error) {
      console.error('[AuthService] Failed to clear auth state:', error)
    }
  }

  /**
   * 创建认证错误
   */
  private createError(type: AuthErrorType, message: string, originalError?: unknown): AuthError {
    return {
      type,
      message,
      originalError,
    }
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(error: unknown): AuthError {
    if (typeof error === 'object' && error !== null && 'type' in error) {
      return error as AuthError
    }

    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('cancelled') || message.includes('canceled')) {
      return this.createError(AuthErrorType.USER_CANCELLED, message, error)
    }

    if (message.includes('network')) {
      return this.createError(AuthErrorType.NETWORK_ERROR, message, error)
    }

    return this.createError(AuthErrorType.UNKNOWN, message, error)
  }

  /**
   * 处理登录后的操作
   */
  private async handlePostLogin(uid: string): Promise<void> {
    try {
      // 获取当前用户的 idToken
      const user = this.getCurrentUser()
      if (!user || !user.idToken) {
        console.error('[AuthService] No idToken available for post-login operations')
        return
      }

      // 检查是否已迁移
      const migrated = await isMigrated()
      
      if (!migrated) {
        console.log('[AuthService] First login detected, migrating data...')
        const result = await migrateLocalDataToCloud(uid, user.idToken)
        
        if (result.success) {
          console.log('[AuthService] Data migration completed:', result.migratedItems)
        } else {
          console.error('[AuthService] Data migration failed:', result.error)
        }
      }

      // 触发一次同步
      console.log('[AuthService] Triggering initial sync...')
      await syncService.syncAll()
    } catch (error) {
      console.error('[AuthService] Post-login handling failed:', error)
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer)
      this.tokenRefreshTimer = null
    }
    this.authStateListeners.clear()
  }
}

// 导出单例
export const authService = new AuthServiceRest()
