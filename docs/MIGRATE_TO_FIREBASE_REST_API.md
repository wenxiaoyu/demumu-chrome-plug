# 迁移到 Firebase REST API - 彻底解决远程代码问题

## 🎯 为什么要迁移

**问题**：Firebase SDK 包含动态脚本加载代码，违反 Manifest V3 规则
**解决方案**：使用 Firebase REST API 替代 SDK

### 优势

- ✅ **完全符合 Manifest V3**：没有远程代码
- ✅ **审核无忧**：首次和后续更新都不会被拒
- ✅ **功能完整**：REST API 提供所有必需功能
- ✅ **体积更小**：不需要打包整个 Firebase SDK
- ✅ **性能更好**：直接 HTTP 请求，无额外开销

---

## 📋 迁移步骤

### 第一步：创建 Firebase REST API 客户端

**创建文件：`src/shared/services/firebase-rest-auth.ts`**

```typescript
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
      throw new Error(data.error?.message || 'Request failed')
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
      throw new Error(data.error?.message || 'Token refresh failed')
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
      const payloadJson = atob(payloadBase64)
      const payload = JSON.parse(payloadJson)
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp > currentTime
    } catch {
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
```

---

### 第二步：创建 Firestore REST API 客户端

**创建文件：`src/shared/services/firestore-rest.ts`**

```typescript
/**
 * Firestore REST API 客户端
 * 符合 Manifest V3 规范
 * 
 * 参考：https://firebase.google.com/docs/firestore/use-rest-api
 */

export class FirestoreRest {
  private projectId: string
  private baseUrl: string

  constructor(projectId: string) {
    this.projectId = projectId
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  }

  /**
   * 获取文档
   */
  async getDocument(path: string, idToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get document: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 创建/更新文档
   */
  async setDocument(path: string, data: any, idToken: string): Promise<any> {
    const firestoreData = this.convertToFirestoreFormat(data)

    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: firestoreData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to set document: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 查询集合
   */
  async queryCollection(
    collectionPath: string,
    idToken: string,
    options?: {
      where?: Array<{ field: string; op: string; value: any }>
      orderBy?: string
      limit?: number
    }
  ): Promise<any> {
    const query: any = {
      structuredQuery: {
        from: [{ collectionId: collectionPath.split('/').pop() }],
      },
    }

    if (options?.where) {
      query.structuredQuery.where = {
        compositeFilter: {
          op: 'AND',
          filters: options.where.map(w => ({
            fieldFilter: {
              field: { fieldPath: w.field },
              op: w.op,
              value: this.convertValue(w.value),
            },
          })),
        },
      }
    }

    if (options?.orderBy) {
      query.structuredQuery.orderBy = [{
        field: { fieldPath: options.orderBy },
        direction: 'DESCENDING',
      }]
    }

    if (options?.limit) {
      query.structuredQuery.limit = options.limit
    }

    const response = await fetch(
      `${this.baseUrl.replace('/documents', '')}:runQuery`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to query collection: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 删除文档
   */
  async deleteDocument(path: string, idToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`)
    }
  }

  /**
   * 转换为 Firestore 格式
   */
  private convertToFirestoreFormat(data: any): any {
    const result: any = {}

    for (const [key, value] of Object.entries(data)) {
      result[key] = this.convertValue(value)
    }

    return result
  }

  /**
   * 转换单个值
   */
  private convertValue(value: any): any {
    if (value === null) {
      return { nullValue: null }
    }
    if (typeof value === 'boolean') {
      return { booleanValue: value }
    }
    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? { integerValue: value.toString() }
        : { doubleValue: value }
    }
    if (typeof value === 'string') {
      return { stringValue: value }
    }
    if (value instanceof Date) {
      return { timestampValue: value.toISOString() }
    }
    if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map(v => this.convertValue(v)),
        },
      }
    }
    if (typeof value === 'object') {
      return {
        mapValue: {
          fields: this.convertToFirestoreFormat(value),
        },
      }
    }

    return { stringValue: String(value) }
  }

  /**
   * 从 Firestore 格式转换回普通对象
   */
  convertFromFirestoreFormat(firestoreData: any): any {
    if (!firestoreData || !firestoreData.fields) {
      return null
    }

    const result: any = {}

    for (const [key, value] of Object.entries(firestoreData.fields)) {
      result[key] = this.extractValue(value)
    }

    return result
  }

  /**
   * 提取单个值
   */
  private extractValue(value: any): any {
    if (value.nullValue !== undefined) return null
    if (value.booleanValue !== undefined) return value.booleanValue
    if (value.integerValue !== undefined) return parseInt(value.integerValue)
    if (value.doubleValue !== undefined) return value.doubleValue
    if (value.stringValue !== undefined) return value.stringValue
    if (value.timestampValue !== undefined) return new Date(value.timestampValue)
    if (value.arrayValue !== undefined) {
      return value.arrayValue.values?.map((v: any) => this.extractValue(v)) || []
    }
    if (value.mapValue !== undefined) {
      return this.convertFromFirestoreFormat({ fields: value.mapValue.fields })
    }
    return null
  }
}
```

---

### 第三步：重写 auth-service.ts

**修改文件：`src/shared/services/auth-service.ts`**

```typescript
import { FirebaseRestAuth, type FirebaseUser } from './firebase-rest-auth'
import { storage } from '../storage'
import { STORAGE_KEYS } from '../constants'
import type { User, AuthState } from '../types/auth'

// 从配置中获取 API Key
const FIREBASE_API_KEY = 'YOUR_FIREBASE_API_KEY' // 从 firebase config 获取

class AuthService {
  private firebaseAuth: FirebaseRestAuth
  private authStateListeners: Array<(state: AuthState) => void> = []

  constructor() {
    this.firebaseAuth = new FirebaseRestAuth(FIREBASE_API_KEY)
  }

  async initialize(): Promise<void> {
    console.log('[AuthService] Initializing...')
    
    // 检查是否有保存的认证状态
    const savedAuth = await storage.get<AuthState>(STORAGE_KEYS.AUTH_STATE)
    
    if (savedAuth && savedAuth.user) {
      // 验证 token 是否有效
      if (this.firebaseAuth.isTokenValid(savedAuth.user.idToken)) {
        console.log('[AuthService] Restored auth state from storage')
        this.notifyListeners(savedAuth)
      } else {
        // Token 过期，尝试刷新
        try {
          await this.refreshAuthToken(savedAuth.user.refreshToken)
        } catch (error) {
          console.error('[AuthService] Failed to refresh token:', error)
          await this.signOut()
        }
      }
    }
  }

  /**
   * Google 登录
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // 使用 chrome.identity API 获取 Google OAuth token
      const redirectURL = chrome.identity.getRedirectURL()
      const clientId = 'YOUR_GOOGLE_CLIENT_ID' // 从 Firebase 配置获取
      
      const authURL = new URL('https://accounts.google.com/o/oauth2/auth')
      authURL.searchParams.set('client_id', clientId)
      authURL.searchParams.set('response_type', 'id_token')
      authURL.searchParams.set('redirect_uri', redirectURL)
      authURL.searchParams.set('scope', 'openid email profile')

      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authURL.toString(),
        interactive: true,
      })

      // 从 URL 中提取 id_token
      const url = new URL(responseUrl)
      const idToken = url.hash.match(/id_token=([^&]+)/)?.[1]

      if (!idToken) {
        throw new Error('Failed to get ID token')
      }

      // 使用 Firebase REST API 登录
      const firebaseUser = await this.firebaseAuth.signInWithGoogle(idToken)
      
      const user: User = {
        uid: firebaseUser.localId,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email,
        idToken: firebaseUser.idToken,
        refreshToken: firebaseUser.refreshToken,
      }

      const authState: AuthState = {
        isSignedIn: true,
        user,
      }

      await storage.set(STORAGE_KEYS.AUTH_STATE, authState)
      this.notifyListeners(authState)

      return user
    } catch (error) {
      console.error('[AuthService] Sign in failed:', error)
      throw error
    }
  }

  /**
   * 退出登录
   */
  async signOut(): Promise<void> {
    await storage.remove(STORAGE_KEYS.AUTH_STATE)
    
    const authState: AuthState = {
      isSignedIn: false,
      user: null,
    }

    this.notifyListeners(authState)
  }

  /**
   * 获取当前认证状态
   */
  async getAuthState(): Promise<AuthState> {
    const savedAuth = await storage.get<AuthState>(STORAGE_KEYS.AUTH_STATE)
    
    if (!savedAuth || !savedAuth.user) {
      return { isSignedIn: false, user: null }
    }

    // 检查 token 是否有效
    if (!this.firebaseAuth.isTokenValid(savedAuth.user.idToken)) {
      // 尝试刷新
      try {
        await this.refreshAuthToken(savedAuth.user.refreshToken)
        return await storage.get<AuthState>(STORAGE_KEYS.AUTH_STATE) || { isSignedIn: false, user: null }
      } catch {
        await this.signOut()
        return { isSignedIn: false, user: null }
      }
    }

    return savedAuth
  }

  /**
   * 刷新认证 Token
   */
  private async refreshAuthToken(refreshToken: string): Promise<void> {
    const response = await this.firebaseAuth.refreshToken(refreshToken)
    
    const savedAuth = await storage.get<AuthState>(STORAGE_KEYS.AUTH_STATE)
    if (savedAuth && savedAuth.user) {
      savedAuth.user.idToken = response.id_token
      savedAuth.user.refreshToken = response.refresh_token
      await storage.set(STORAGE_KEYS.AUTH_STATE, savedAuth)
      this.notifyListeners(savedAuth)
    }
  }

  /**
   * 更新用户资料
   */
  async updateDisplayName(displayName: string): Promise<void> {
    const authState = await this.getAuthState()
    
    if (!authState.isSignedIn || !authState.user) {
      throw new Error('Not signed in')
    }

    await this.firebaseAuth.updateProfile({
      idToken: authState.user.idToken,
      displayName,
    })

    authState.user.displayName = displayName
    await storage.set(STORAGE_KEYS.AUTH_STATE, authState)
    this.notifyListeners(authState)
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    this.authStateListeners.push(callback)
    
    // 立即调用一次
    this.getAuthState().then(callback)

    // 返回取消监听的函数
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(state: AuthState): void {
    this.authStateListeners.forEach(listener => listener(state))
  }
}

export const authService = new AuthService()
```

---

### 第四步：更新 firestore-service.ts

使用 REST API 替代 SDK，参考上面的 `firestore-rest.ts`。

---

### 第五步：移除 Firebase SDK 依赖

```bash
npm uninstall firebase
```

更新 `package.json`，移除 firebase 依赖。

---

## 📊 迁移对比

| 特性 | Firebase SDK | Firebase REST API |
|------|-------------|-------------------|
| Manifest V3 兼容 | ❌ 违规 | ✅ 完全兼容 |
| 包大小 | ~500KB | ~10KB |
| 审核通过率 | ❌ 被拒 | ✅ 通过 |
| 功能完整性 | ✅ 完整 | ✅ 完整 |
| 性能 | 一般 | ✅ 更快 |
| 维护成本 | 低 | 中 |

---

## ✅ 验证清单

迁移完成后，确认：

- [ ] 移除了所有 `firebase` npm 包
- [ ] 所有 Firebase 导入改为 REST API 客户端
- [ ] Google 登录功能正常
- [ ] Firestore 读写功能正常
- [ ] Token 自动刷新机制工作
- [ ] 构建产物中不包含远程脚本加载代码
- [ ] 运行 `npm run build` 成功
- [ ] 在 Chrome 中测试所有功能

---

## 🔍 检查构建产物

```bash
# 构建
npm run build

# 检查是否还有违规代码
Select-String -Path "dist/**/*.js" -Pattern "loadJS|apis.google.com|recaptcha" -SimpleMatch

# 应该没有任何输出
```

---

## 📚 参考资料

- [Firebase Auth REST API 文档](https://firebase.google.com/docs/reference/rest/auth)
- [Firestore REST API 文档](https://firebase.google.com/docs/firestore/use-rest-api)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [解决 Blue Argon 错误](https://ecostack.dev/posts/firebase-auth-chrome-extension-blue-argon/)

---

**这是唯一能让 Firebase 功能在 Manifest V3 扩展中长期稳定运行的方案！**
