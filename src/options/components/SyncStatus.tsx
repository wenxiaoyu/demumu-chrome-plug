/**
 * 同步状态组件
 * 显示数据同步状态和最后同步时间
 */

import React, { useState, useEffect } from 'react'
import { syncService, SyncStatus as SyncStatusEnum } from '../../shared/services/sync-service'
import { authService } from '../../shared/services/auth-service'
import { t } from '../../shared/utils/i18n'
import './SyncStatus.css'

export const SyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusEnum>(SyncStatusEnum.Idle)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    // 加载初始状态
    loadSyncStatus()

    // 检查登录状态
    const user = authService.getCurrentUser()
    setIsSignedIn(!!user)

    // 监听认证状态变化
    const unsubscribe = authService.onAuthStateChanged((state) => {
      setIsSignedIn(state.isSignedIn)
      if (state.isSignedIn) {
        loadSyncStatus()
      }
    })

    // 定时刷新状态
    const interval = window.setInterval(loadSyncStatus, 5000)

    return () => {
      unsubscribe()
      window.clearInterval(interval)
    }
  }, [])

  const loadSyncStatus = async () => {
    const status = syncService.getSyncStatus()
    await syncService.loadLastSyncTime()

    setSyncStatus(status)
    setLastSyncTime(syncService.getLastSyncTime())
  }

  const handleSyncNow = async () => {
    if (isSyncing || !isSignedIn) return

    setIsSyncing(true)
    try {
      const result = await syncService.syncAll()
      if (result.success) {
        await loadSyncStatus()
      }
    } catch (error) {
      console.error('[SyncStatus] Manual sync failed:', error)
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
        <div className="sync-status-header">
          <h3>{t('sync_title')}</h3>
        </div>
        <div className="sync-status-content">
          <p className="sync-status-message">{t('sync_loginRequired')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sync-status">
      <div className="sync-status-header">
        <h3>{t('sync_title')}</h3>
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
