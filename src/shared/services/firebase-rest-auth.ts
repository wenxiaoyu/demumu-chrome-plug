/**
 * Firebase Authentication REST API 客户端
 * 符合 Manifest V3 规范，不使用动态脚本加载
 * 
 * 参考：https://firebase.google.com/docs/reference/rest/auth
 */

export interface FirebaseUser {
  kind: string
  localId: string
  email: string
  displayName: string
  idToken: string
  registered: boolean
  refreshToken: string
  expiresIn: string
}

export interface FirebaseSignInResponse {
  kind: string
  localId: string
  email: string
  displayName: string
  idToken: string
  registered: boolean
  refreshToken: string
  expiresIn: string
}

export interface FirebaseRefreshTokenResponse {
  access_token: string
  expires_in: string
  token_type: string
  refresh_token: string
  id_token: string
  user_id: string
  project_id: string
}

export class FirebaseRestAuth {
  private apiKey: string
  private baseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts'
  private tokenUrl = 'https://securetoken.googleapis.com/v1/token'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Firebase API key is required')
    }
    this.apiKey = apiKey
  }

  /**
   * 通用请求方法
   */
  private async request(endpoint: string, body: any): Promise<any> {
    const url = `${this.baseUrl}:${endpoint}?key=${this.apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Request failed'
      console.error('[FirebaseRestAuth] Request failed:', errorMessage, data)
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * 使用 Google OAuth 登录
   * 注意：需要先通过 chrome.identity.launchWebAuthFlow 获取 OAuth token
   */
  async signInWithGoogle(idToken: string): Promise<FirebaseSignInResponse> {
    return this.request('signInWithIdp', {
      postBody: `id_token=${idToken}&providerId=google.com`,
      requestUri: chrome.identity.getRedirectURL(),
      returnSecureToken: true,
      returnIdpCredential: true,
    })
  }

  /**
   * 使用邮箱密码登录
   */
  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<FirebaseSignInResponse> {
    return this.request('signInWithPassword', {
      email,
      password,
      returnSecureToken: true,
    })
  }

  /**
   * 注册新用户
   */
  async signUp(email: string, password: string): Promise<FirebaseSignInResponse> {
    return this.request('signUp', {
      email,
      password,
      returnSecureToken: true,
    })
  }

  /**
   * 更新用户资料
   */
  async updateProfile(params: {
    idToken: string
    displayName?: string
    photoUrl?: string
  }): Promise<any> {
    return this.request('update', {
      idToken: params.idToken,
      displayName: params.displayName,
      photoUrl: params.photoUrl,
      returnSecureToken: true,
    })
  }

  /**
   * 刷新 ID Token
   */
  async refreshToken(refreshToken: string): Promise<FirebaseRefreshTokenResponse> {
    const response = await fetch(`${this.tokenUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Token refresh failed'
      console.error('[FirebaseRestAuth] Token refresh failed:', errorMessage, data)
      throw new Error(errorMessage)
    }

    return data
  }

  /**
   * 验证 Token 是否有效
   */
  isTokenValid(idToken: string): boolean {
    if (!idToken) {
      return false
    }

    try {
      const payloadBase64 = idToken.split('.')[1]
      const payloadJson = globalThis.atob(payloadBase64)
      const payload = JSON.parse(payloadJson)
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp > currentTime
    } catch (error) {
      console.error('[FirebaseRestAuth] Token validation failed:', error)
      return false
    }
  }

  /**
   * 获取用户信息
   */
  async getUserData(idToken: string): Promise<any> {
    return this.request('lookup', {
      idToken,
    })
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(email: string): Promise<any> {
    return this.request('sendOobCode', {
      requestType: 'PASSWORD_RESET',
      email,
    })
  }

  /**
   * 删除账号
   */
  async deleteAccount(idToken: string): Promise<any> {
    return this.request('delete', {
      idToken,
    })
  }
}
