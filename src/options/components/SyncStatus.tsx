/**
 * 同步状态组件
 * 显示数据同步状态和最后同步时间
 */

import React, { useState, useEffect } from 'react'
import { SyncStatus as SyncStatusEnum } from '../../shared/services/sync-service'
import type { AuthState } from '../../shared/types/auth'
import { t } from '../../shared/utils/i18n'
import './SyncStatus.css'

export const SyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusEnum>(SyncStatusEnum.Idle)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    loadSyncTime()
    checkAuthState()

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authState) {
        const newState = changes.authState.newValue as AuthState | undefined
        setIsSignedIn(newState?.isSignedIn ?? false)
      }
      if (changes.lastSyncTime) {
        const time = changes.lastSyncTime.newValue as number
        setLastSyncTime(time || 0)
        if (time) {
          setSyncStatus(SyncStatusEnum.Success)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const loadSyncTime = async () => {
    try {
      const result = await chrome.storage.local.get('lastSyncTime')
      const time = result.lastSyncTime as number
      if (time) {
        setLastSyncTime(time)
        setSyncStatus(SyncStatusEnum.Success)
      }
    } catch {
      // ignore
    }
  }

  const checkAuthState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' })
      if (response.success) {
        setIsSignedIn(response.data?.isSignedIn ?? false)
      }
    } catch {
      setIsSignedIn(false)
    }
  }

  const handleSyncNow = async () => {
    if (isSyncing || !isSignedIn) return

    setIsSyncing(true)
    setSyncStatus(SyncStatusEnum.Syncing)
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SYNC_NOW' })
      if (response.success) {
        setSyncStatus(SyncStatusEnum.Success)
        await loadSyncTime()
      } else {
        setSyncStatus(SyncStatusEnum.Error)
      }
    } catch (error) {
      console.error('[SyncStatus] Manual sync failed:', error)
      setSyncStatus(SyncStatusEnum.Error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case SyncStatusEnum.Idle:
        return '⚪'
      case SyncStatusEnum.Syncing:
        return '🔄'
      case SyncStatusEnum.Success:
        return '✅'
      case SyncStatusEnum.Error:
        return '❌'
      case SyncStatusEnum.Offline:
        return '📴'
      default:
        return '⚪'
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case SyncStatusEnum.Idle:
        return t('sync_idle')
      case SyncStatusEnum.Syncing:
        return t('sync_syncing')
      case SyncStatusEnum.Success:
        return t('sync_success')
      case SyncStatusEnum.Error:
        return t('sync_error')
      case SyncStatusEnum.Offline:
        return t('sync_offline')
      default:
        return t('sync_idle')
    }
  }

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return t('sync_never')

    const now = Date.now()
    const diff = now - lastSyncTime
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return t('sync_daysAgo', String(days))
    if (hours > 0) return t('sync_hoursAgo', String(hours))
    if (minutes > 0) return t('sync_minutesAgo', String(minutes))
    return t('sync_justNow')
  }

  if (!isSignedIn) {
    return (
      <div className="sync-status">
        <div className="sync-status-content">
          <p className="sync-status-message">{t('sync_loginRequired')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sync-status">
      <div className="sync-status-header">
        <span></span>
        <button
          className="sync-now-button"
          onClick={handleSyncNow}
          disabled={isSyncing || syncStatus === SyncStatusEnum.Syncing}
        >
          {isSyncing ? t('sync_syncing') : t('sync_syncNow')}
        </button>
      </div>

      <div className="sync-status-content">
        <div className="sync-status-item">
          <span className="sync-status-label">{t('sync_status')}：</span>
          <span className="sync-status-value">
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>

        <div className="sync-status-item">
          <span className="sync-status-label">{t('sync_lastSync')}：</span>
          <span className="sync-status-value">{formatLastSyncTime()}</span>
        </div>

        <div className="sync-status-info">
          <p>{t('sync_info1')}</p>
          <p>{t('sync_info2')}</p>
          <p>{t('sync_info3')}</p>
        </div>
      </div>
    </div>
  )
}
