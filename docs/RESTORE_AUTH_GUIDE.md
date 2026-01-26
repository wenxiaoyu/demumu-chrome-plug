# 恢复登录和同步功能指南

## 📋 概述

本文档记录了为通过 Chrome Web Store 审核而临时禁用的登录和同步功能。
当扩展发布后获得永久扩展 ID，可以按照本指南恢复完整功能。

**禁用日期**：2026-01-26
**版本**：v1.1.0
**原因**：Chrome Web Store 审核时 Google OAuth 返回 400 错误

---

## 🔄 变更记录

### 1. src/popup/Popup.tsx

#### 变更内容：

- 注释掉了 `LoginButton` 和 `UserProfile` 的 imports
- 注释掉了 `AuthState` 类型导入
- 注释掉了认证状态相关的 state 和 useEffect
- 注释掉了登录 UI 的渲染

#### 恢复步骤：

**第 1 步：恢复 imports**

将：

```typescript
// import { LoginButton } from './components/LoginButton';
// import { UserProfile } from './components/UserProfile';
// import type { AuthState } from '../shared/types/auth';
```

改为：

```typescript
import { LoginButton } from './components/LoginButton'
import { UserProfile } from './components/UserProfile'
import type { AuthState } from '../shared/types/auth'
```

**第 2 步：恢复状态管理**

将：

```typescript
function Popup() {
  const { userData, loading, knock } = useKnock();
  const [langReady, setLangReady] = useState(false);
  // const [authState, setAuthState] = useState<AuthState | null>(null);
  // const [authLoading, setAuthLoading] = useState(true);

  // 初始化语言
  useEffect(() => {
    initLanguage().then(() => setLangReady(true));
  }, []);

  // 加载认证状态 - 暂时禁用
  // useEffect(() => {
  //   loadAuthState();
  //   ...
  // }, []);

  // const loadAuthState = async () => {
  //   ...
  // };

  // const handleAuthChange = () => {
  //   loadAuthState();
  // };
```

改为：

```typescript
function Popup() {
  const { userData, loading, knock } = useKnock();
  const [langReady, setLangReady] = useState(false);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 初始化语言
  useEffect(() => {
    initLanguage().then(() => setLangReady(true));
  }, []);

  // 加载认证状态
  useEffect(() => {
    loadAuthState();

    // 监听认证状态变化
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authState) {
        setAuthState(changes.authState.newValue as AuthState);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadAuthState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
      if (response.success) {
        setAuthState(response.data);
      }
    } catch (err) {
      console.error('[Popup] Failed to load auth state:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthChange = () => {
    loadAuthState();
  };
```

**第 3 步：恢复登录 UI**

将：

```typescript
{
  /* 用户信息区域 - 暂时禁用登录功能 */
}
{
  /* {!authLoading && (
  authState?.isSignedIn && authState.user ? (
    <UserProfile user={authState.user} onSignOut={handleAuthChange} />
  ) : (
    <LoginButton onLoginSuccess={handleAuthChange} />
  )
)} */
}
```

改为：

```typescript
{/* 用户信息区域 */}
{!authLoading && (
  authState?.isSignedIn && authState.user ? (
    <UserProfile user={authState.user} onSignOut={handleAuthChange} />
  ) : (
    <LoginButton onLoginSuccess={handleAuthChange} />
  )
)}
```

---

### 2. src/options/components/AccountSettings.tsx

#### 变更内容：

- 完全重写为"即将推出"UI
- 移除了所有登录、同步、账号管理功能

#### 恢复步骤：

**完整替换文件内容为以下代码：**

```typescript
/**
 * 账号设置组件
 * 显示用户信息、同步状态、账号操作
 */

import { useState, useEffect } from 'react'
import { t } from '../../shared/utils/i18n'
import type { AuthState } from '../../shared/types/auth'
import { SyncStatus } from './SyncStatus'
import './AccountSettings.css'

export function AccountSettings() {
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAuthState()

    // 监听认证状态变化
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authState) {
        setAuthState(changes.authState.newValue as AuthState)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const loadAuthState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' })
      if (response.success) {
        setAuthState(response.data)
        if (response.data?.user?.displayName) {
          setDisplayName(response.data.user.displayName)
        }
      }
    } catch (err) {
      console.error('[AccountSettings] Failed to load auth state:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SIGN_IN' })
      if (response.success) {
        await loadAuthState()
      } else {
        alert(t('loginFailed') + ': ' + (response.error || t('unknownError')))
      }
    } catch (err) {
      console.error('[AccountSettings] Sign in failed:', err)
      alert(t('loginFailed'))
    }
  }

  const handleSignOut = async () => {
    if (!confirm(t('confirmSignOut'))) {
      return
    }

    try {
      const response = await chrome.runtime.sendMessage({ type: 'SIGN_OUT' })
      if (response.success) {
        await loadAuthState()
      } else {
        alert(t('account_signOutFailed'))
      }
    } catch (err) {
      console.error('[AccountSettings] Sign out failed:', err)
      alert(t('account_signOutFailed'))
    }
  }

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      return
    }

    setSaving(true)
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_DISPLAY_NAME',
        displayName: displayName.trim()
      })

      if (response.success) {
        setEditingName(false)
        await loadAuthState()
        alert(t('account_nameUpdated'))
      } else {
        alert(t('account_nameUpdateFailed'))
      }
    } catch (err) {
      console.error('[AccountSettings] Failed to update display name:', err)
      alert(t('account_nameUpdateFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm(t('account_confirmDelete'))) {
      return
    }

    if (!confirm(t('account_confirmDeleteWarning'))) {
      return
    }

    // TODO: 实现账号删除功能
    alert(t('account_deleteNotImplemented'))
  }

  if (loading) {
    return (
      <div className="account-settings">
        <div className="loading">{t('loading')}</div>
      </div>
    )
  }

  // 未登录状态
  if (!authState?.isSignedIn || !authState.user) {
    return (
      <div className="account-settings">
        <div className="account-card">
          <h3 className="card-title">{t('account_title')}</h3>
          <div className="not-signed-in">
            <p className="hint">{t('account_notSignedIn')}</p>
            <p className="hint">{t('account_signInHint')}</p>
            <button className="btn-primary" onClick={handleSignIn}>
              {t('loginWithGoogle')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 已登录状态
  const user = authState.user

  return (
    <div className="account-settings">
      {/* 用户信息 */}
      <div className="account-card">
        <h3 className="card-title">{t('account_userInfo')}</h3>
        <div className="user-info">
          <div className="info-row">
            <label>{t('account_displayName')}</label>
            {editingName ? (
              <div className="edit-name">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('account_enterName')}
                  disabled={saving}
                />
                <button
                  className="btn-small btn-primary"
                  onClick={handleSaveDisplayName}
                  disabled={saving || !displayName.trim()}
                >
                  {saving ? t('saving') : t('save')}
                </button>
                <button
                  className="btn-small"
                  onClick={() => {
                    setEditingName(false)
                    setDisplayName(user.displayName || '')
                  }}
                  disabled={saving}
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <div className="display-name">
                <span>{user.displayName || t('account_notSet')}</span>
                <button
                  className="btn-icon"
                  onClick={() => setEditingName(true)}
                  title={t('account_editName')}
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
          <div className="info-row">
            <label>{t('account_email')}</label>
            <span>{user.email}</span>
          </div>
          <div className="info-row">
            <label>{t('account_userId')}</label>
            <span className="user-id">{user.uid}</span>
          </div>
        </div>
      </div>

      {/* 数据同步 */}
      <div className="account-card">
        <h3 className="card-title">{t('account_dataSync')}</h3>
        <SyncStatus />
      </div>

      {/* 账号操作 */}
      <div className="account-card">
        <h3 className="card-title">{t('account_actions')}</h3>
        <div className="account-actions">
          <button className="btn-secondary" onClick={handleSignOut}>
            {t('signOut')}
          </button>
          <div className="danger-zone">
            <p className="warning">{t('account_deleteWarning')}</p>
            <button className="btn-danger" onClick={handleDeleteAccount}>
              {t('account_deleteAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 3. src/\_locales/zh_CN/messages.json

#### 变更内容：

- 添加了新的翻译键用于"即将推出"UI

#### 恢复步骤：

**可以保留这些翻译键**，它们不会影响完整功能版本。但如果需要清理，可以删除以下键：

```json
"account_comingSoon": {
  "message": "云端同步功能即将推出",
  "description": "Coming soon title"
},
"account_comingSoonDesc": {
  "message": "我们正在开发云端数据同步功能，让您可以在多设备间同步数据。敬请期待！",
  "description": "Coming soon description"
},
"account_feature1": {
  "message": "云端数据备份",
  "description": "Feature 1: Cloud backup"
},
"account_feature2": {
  "message": "多设备同步",
  "description": "Feature 2: Multi-device sync"
},
"account_feature3": {
  "message": "Google 账号登录",
  "description": "Feature 3: Google sign in"
}
```

---

### 4. scripts/translate-en.js

#### 变更内容：

- 添加了对应的英文翻译

#### 恢复步骤：

**可以保留这些翻译**，或者删除以下内容：

```javascript
"account_comingSoon": "Cloud Sync Coming Soon",
"account_comingSoonDesc": "We're developing cloud data sync feature to sync your data across devices. Stay tuned!",
"account_feature1": "Cloud Data Backup",
"account_feature2": "Multi-device Sync",
"account_feature3": "Google Sign In",
```

---

### 5. src/options/components/AccountSettings.css

#### 变更内容：

- 添加了 `.coming-soon-*` 相关样式

#### 恢复步骤：

**可以保留这些样式**，它们不会影响完整功能版本。但如果需要清理，可以删除以下样式：

```css
.coming-soon-container {
  text-align: center;
  padding: 3rem 2rem;
}

.coming-soon-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.coming-soon-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.coming-soon-desc {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.coming-soon-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-text {
  color: #555;
  font-size: 0.95rem;
}
```

---

## 🔧 恢复前的准备工作

### 1. 获取扩展 ID

扩展发布后，在 Chrome Web Store Developer Dashboard 中获取永久扩展 ID：

- 格式：`abcdefghijklmnopqrstuvwxyz123456`（32位字符）
- 位置：Developer Dashboard → 你的扩展 → 详情页面

### 2. 配置 Google Cloud OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择项目：`alive-checker-d24ea`
3. 进入"API 和服务" → "凭据"
4. 找到 OAuth 2.0 客户端 ID
5. 添加授权的重定向 URI：
   ```
   https://[你的扩展ID].chromiumapp.org/
   ```
6. 保存更改

### 3. 更新 Firebase 配置

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目：`alive-checker-d24ea`
3. 进入"Authentication" → "Sign-in method"
4. 点击"Google"提供商
5. 在"授权域"中添加：
   ```
   [你的扩展ID].chromiumapp.org
   ```
6. 保存更改

### 4. 验证配置

在本地测试环境中：

1. 加载未打包的扩展（使用 `dist` 目录）
2. 尝试登录
3. 检查是否能成功完成 OAuth 流程
4. 验证数据同步功能是否正常

---

## 📝 恢复步骤总结

### 快速恢复清单：

1. **配置 OAuth**（必须先完成）
   - [ ] 获取扩展 ID
   - [ ] 在 Google Cloud Console 添加 redirect URI
   - [ ] 在 Firebase Console 添加授权域

2. **恢复代码**
   - [ ] 恢复 `src/popup/Popup.tsx`
   - [ ] 恢复 `src/options/components/AccountSettings.tsx`
   - [ ] （可选）清理翻译文件中的临时键

3. **测试**
   - [ ] 本地构建：`npm run build`
   - [ ] 加载扩展测试登录功能
   - [ ] 测试数据同步功能
   - [ ] 测试多设备同步

4. **更新产品说明**
   - [ ] 在 Chrome Web Store 中添加登录功能描述
   - [ ] 添加云端同步功能描述
   - [ ] 更新截图（显示登录功能）

5. **发布更新**
   - [ ] 升级版本号（如 v1.2.0）
   - [ ] 更新 CHANGELOG
   - [ ] 构建并打包
   - [ ] 提交到 Chrome Web Store

---

## 🔍 验证清单

恢复后确认以下功能正常：

- [ ] Google 登录按钮显示
- [ ] 点击登录能打开 OAuth 流程
- [ ] 登录成功后显示用户信息
- [ ] 显示名称可以编辑
- [ ] 数据同步状态显示正常
- [ ] 手动同步功能正常
- [ ] 退出登录功能正常
- [ ] 多设备数据同步正常

---

## 📞 相关文档

- OAuth 配置详情：`docs/setup/FIREBASE_SETUP_GUIDE.md`
- 登录错误修复：`docs/FIX_GOOGLE_LOGIN_ERROR.md`
- Firebase 配置：`docs/setup/FIREBASE_CONFIG_INSTRUCTIONS.md`

---

## ⚠️ 注意事项

1. **必须先配置 OAuth**：在恢复代码前，必须先完成 OAuth 配置，否则登录会失败
2. **测试充分**：在本地充分测试后再发布更新
3. **版本号**：恢复功能时建议升级到新的小版本号
4. **用户通知**：在更新说明中告知用户新增了登录和同步功能

---

**创建日期**：2026-01-26
**最后更新**：2026-01-26
**状态**：待恢复
