/**
 * 认证服务
 * 
 * 负责：
 * 1. Google 登录/登出
 * 2. 用户状态管理
 * 3. 认证状态持久化
 */

import {
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser,
  Unsubscribe,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, AuthState, AuthError, AuthErrorType } from '../types/auth';
import { migrateLocalDataToCloud, isMigrated } from './data-migration';
import { syncService } from './sync-service';

/**
 * 认证服务类
 */
class AuthService {
  private authStateListeners: Set<(state: AuthState) => void> = new Set();
  private unsubscribeAuth: Unsubscribe | null = null;

  constructor() {
    this.initializeAuthListener();
  }

  /**
   * 初始化认证状态监听器
   */
  private initializeAuthListener() {
    this.unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      const authState = await this.buildAuthState(firebaseUser);
      await this.saveAuthState(authState);
      this.notifyListeners(authState);

      // 如果用户已登录，触发数据迁移和同步
      if (firebaseUser) {
        await this.handlePostLogin(firebaseUser.uid);
      }
    });
  }

  /**
   * 构建认证状态对象
   */
  private async buildAuthState(firebaseUser: FirebaseUser | null): Promise<AuthState> {
    if (!firebaseUser) {
      return {
        isSignedIn: false,
        user: null,
        lastUpdated: Date.now(),
      };
    }

    const user: User = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };

    // 获取访问令牌
    let accessToken: string | undefined;
    try {
      accessToken = await firebaseUser.getIdToken();
    } catch (error) {
      console.error('[AuthService] Failed to get access token:', error);
    }

    return {
      isSignedIn: true,
      user,
      lastUpdated: Date.now(),
      accessToken,
    };
  }

  /**
   * 使用 Google 登录
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // 使用 launchWebAuthFlow 获取 ID token
      const idToken = await this.launchWebAuthFlow();

      // 使用 ID token 登录 Firebase
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      if (!result.user) {
        throw this.createError(AuthErrorType.UNKNOWN, 'No user returned from sign in');
      }

      const user: User = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
      };

      console.log('[AuthService] Sign in successful:', user.email);
      return user;
    } catch (error) {
      console.error('[AuthService] Sign in failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * 使用 launchWebAuthFlow 获取 Google ID token
   */
  private async launchWebAuthFlow(): Promise<string> {
    const redirectUrl = chrome.identity.getRedirectURL();
    const clientId = '681396856351-la69jc71l4b3msoop2ckuo6jt5ao2q3t.apps.googleusercontent.com';
    
    // 构建 OAuth2 URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', this.generateNonce());

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
            );
            return;
          }

          if (!responseUrl) {
            reject(this.createError(AuthErrorType.UNKNOWN, 'No response URL'));
            return;
          }

          // 从 URL fragment 中提取 id_token
          const url = new URL(responseUrl);
          const params = new URLSearchParams(url.hash.substring(1));
          const idToken = params.get('id_token');

          if (!idToken) {
            reject(this.createError(AuthErrorType.UNKNOWN, 'No ID token in response'));
            return;
          }

          resolve(idToken);
        }
      );
    });
  }

  /**
   * 生成随机 nonce
   */
  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 退出登录
   */
  async signOut(): Promise<void> {
    try {
      // Firebase 退出登录
      await firebaseSignOut(auth);

      // 清除本地状态
      await this.clearAuthState();

      console.log('[AuthService] Sign out successful');
    } catch (error) {
      console.error('[AuthService] Sign out failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }

    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  }

  /**
   * 检查是否已登录
   */
  isSignedIn(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    this.authStateListeners.add(callback);

    // 立即调用一次回调，传递当前状态
    this.loadAuthState().then((state) => {
      callback(state);
    });

    // 返回取消监听的函数
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(state: AuthState) {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[AuthService] Listener error:', error);
      }
    });
  }

  /**
   * 保存认证状态到 Chrome Storage
   */
  async saveAuthState(state: AuthState): Promise<void> {
    try {
      await chrome.storage.local.set({ authState: state });
      console.log('[AuthService] Auth state saved');
    } catch (error) {
      console.error('[AuthService] Failed to save auth state:', error);
    }
  }

  /**
   * 从 Chrome Storage 加载认证状态
   */
  async loadAuthState(): Promise<AuthState> {
    try {
      const result = await chrome.storage.local.get('authState');
      if (result.authState) {
        console.log('[AuthService] Auth state loaded');
        return result.authState as AuthState;
      }
    } catch (error) {
      console.error('[AuthService] Failed to load auth state:', error);
    }

    // 返回默认状态
    return {
      isSignedIn: false,
      user: null,
      lastUpdated: Date.now(),
    };
  }

  /**
   * 清除认证状态
   */
  async clearAuthState(): Promise<void> {
    try {
      await chrome.storage.local.remove('authState');
      console.log('[AuthService] Auth state cleared');
    } catch (error) {
      console.error('[AuthService] Failed to clear auth state:', error);
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
    };
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(error: unknown): AuthError {
    if (typeof error === 'object' && error !== null && 'type' in error) {
      return error as AuthError;
    }

    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('cancelled') || message.includes('canceled')) {
      return this.createError(AuthErrorType.USER_CANCELLED, message, error);
    }

    if (message.includes('network')) {
      return this.createError(AuthErrorType.NETWORK_ERROR, message, error);
    }

    return this.createError(AuthErrorType.UNKNOWN, message, error);
  }

  /**
   * 处理登录后的操作
   */
  private async handlePostLogin(uid: string): Promise<void> {
    try {
      // 检查是否已迁移
      const migrated = await isMigrated();
      
      if (!migrated) {
        console.log('[AuthService] First login detected, migrating data...');
        const result = await migrateLocalDataToCloud(uid);
        
        if (result.success) {
          console.log('[AuthService] Data migration completed:', result.migratedItems);
        } else {
          console.error('[AuthService] Data migration failed:', result.error);
        }
      }

      // 触发一次同步
      console.log('[AuthService] Triggering initial sync...');
      await syncService.syncAll();
    } catch (error) {
      console.error('[AuthService] Post-login handling failed:', error);
    }
  }

  /**
   * 销毁服务
   */
  destroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.authStateListeners.clear();
  }
}

// 导出单例
export const authService = new AuthService();
