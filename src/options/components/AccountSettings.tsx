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
        displayName: displayName.trim(),
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
