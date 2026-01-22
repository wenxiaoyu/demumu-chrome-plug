/**
 * 账号设置组件
 * 显示用户信息、同步状态、账号操作
 */

import { useState, useEffect } from 'react'
import { authService } from '../../shared/services/auth-service'
import type { User } from '../../shared/types/auth'
import { t } from '../../shared/utils/i18n'
import './AccountSettings.css'

export function AccountSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const loadDisplayName = async (uid: string) => {
    try {
      // 从 Firestore 加载自定义显示名称
      const { firestoreService } = await import('../../shared/services/firestore-service')
      const userData = await firestoreService.getUserData(uid)
      if (userData?.displayName) {
        setDisplayName(userData.displayName)
      } else if (user?.displayName) {
        // 如果没有自定义名称，使用 Google 账号的显示名称
        setDisplayName(user.displayName)
      }
    } catch (error) {
      console.error('[AccountSettings] Load display name failed:', error)
    }
  }

  const loadUserInfo = async () => {
    try {
      setLoading(true)
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      if (currentUser) {
        await loadDisplayName(currentUser.uid)
      }
    } catch (error) {
      console.error('[AccountSettings] Load user info failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserInfo()

    // 监听认证状态变化
    const unsubscribe = authService.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDisplayName(state.user.uid)
      }
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditName = () => {
    setEditingName(true)
  }

  const handleCancelEdit = () => {
    setEditingName(false)
    // 恢复原来的名称
    if (user) {
      loadDisplayName(user.uid)
    }
  }

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) {
      return
    }

    try {
      setSavingName(true)

      // 1. 保存到 Firestore
      const { firestoreService } = await import('../../shared/services/firestore-service')
      await firestoreService.updateDisplayName(user.uid, displayName.trim())

      // 2. 更新本地 UserData
      const result = await chrome.storage.local.get('userData')
      if (result.userData) {
        const updatedUserData = {
          ...result.userData,
          displayName: displayName.trim(),
          updatedAt: Date.now(),
        }
        await chrome.storage.local.set({ userData: updatedUserData })
        console.log('[AccountSettings] Local userData updated with displayName')
      }

      // 3. 触发同步
      try {
        const { syncService } = await import('../../shared/services/sync-service')
        await syncService.syncUserData()
        console.log('[AccountSettings] User data synced after displayName update')
      } catch (syncError) {
        console.error('[AccountSettings] Failed to sync after displayName update:', syncError)
        // 同步失败不影响保存成功的提示
      }

      setEditingName(false)
      window.alert(t('account_nameUpdated'))
    } catch (error) {
      console.error('[AccountSettings] Save display name failed:', error)
      window.alert(t('account_nameUpdateFailed'))
    } finally {
      setSavingName(false)
    }
  }

  const handleSignOut = async () => {
    if (!window.confirm(t('confirmSignOut'))) {
      return
    }

    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error('[AccountSettings] Sign out failed:', error)
      window.alert(t('account_signOutFailed'))
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t('account_confirmDelete'))
    if (!confirmed) return

    const doubleConfirmed = window.confirm(t('account_confirmDeleteWarning'))
    if (!doubleConfirmed) return

    window.alert(t('account_deleteNotImplemented'))
    // TODO: 实现账号删除功能
  }

  if (loading) {
    return (
      <div className="account-settings">
        <div className="loading">{t('loading')}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="account-settings">
        <div className="account-empty">
          <p className="empty-icon">🔐</p>
          <p className="empty-text">{t('account_notSignedIn')}</p>
          <p className="empty-hint">{t('account_signInHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-settings">
      {/* 用户信息卡片 */}
      <div className="account-card">
        <h3 className="card-title">{t('account_userInfo')}</h3>
        <div className="user-info-section">
          <div className="user-avatar-large">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || t('user')} />
            ) : (
              <div className="avatar-placeholder">
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <div className="detail-item">
              <span className="detail-label">{t('account_displayName')}:</span>
              {editingName ? (
                <div className="name-edit-container">
                  <input
                    type="text"
                    className="name-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('account_enterName')}
                    maxLength={50}
                    disabled={savingName}
                  />
                  <div className="name-edit-actions">
                    <button
                      className="btn-name-action btn-save"
                      onClick={handleSaveName}
                      disabled={savingName || !displayName.trim()}
                    >
                      {savingName ? t('saving') : t('save')}
                    </button>
                    <button
                      className="btn-name-action btn-cancel"
                      onClick={handleCancelEdit}
                      disabled={savingName}
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="name-display-container">
                  <span className="detail-value">
                    {displayName || user.displayName || t('account_notSet')}
                  </span>
                  <button
                    className="btn-edit-name"
                    onClick={handleEditName}
                    title={t('account_editName')}
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('account_email')}:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('account_userId')}:</span>
              <span className="detail-value detail-value-small">{user.uid}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 账号操作卡片 */}
      <div className="account-card">
        <h3 className="card-title">{t('account_actions')}</h3>
        <div className="account-actions">
          <button className="btn-action btn-sign-out" onClick={handleSignOut}>
            <span className="btn-icon">🚪</span>
            {t('signOut')}
          </button>
          <button className="btn-action btn-delete" onClick={handleDeleteAccount}>
            <span className="btn-icon">⚠️</span>
            {t('account_deleteAccount')}
          </button>
        </div>
        <div className="account-warning">
          <p>{t('account_deleteWarning')}</p>
        </div>
      </div>
    </div>
  )
}
