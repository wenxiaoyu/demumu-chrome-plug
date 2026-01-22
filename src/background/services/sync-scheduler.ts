/**
 * 同步调度器
 * 负责定时自动同步和网络状态监听
 */

import { syncService } from '../../shared/services/sync-service'
import { authService } from '../../shared/services/auth-service'

/**
 * 同步调度器类
 */
export class SyncScheduler {
  private readonly SYNC_ALARM_NAME = 'autoSync'
  private readonly SYNC_INTERVAL_MINUTES = 30 // 每 30 分钟同步一次
  private isInitialized = false

  /**
   * 初始化调度器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[SyncScheduler] Already initialized')
      return
    }

    console.log('[SyncScheduler] Initializing...')

    // 加载最后同步时间
    await syncService.loadLastSyncTime()

    // 设置定时同步
    await this.setupPeriodicSync()

    // 监听网络状态变化
    this.setupNetworkListener()

    // 监听 Alarm 事件
    this.setupAlarmListener()

    this.isInitialized = true
    console.log('[SyncScheduler] Initialized')
  }

  /**
   * 设置定时同步
   */
  private async setupPeriodicSync(): Promise<void> {
    try {
      // 创建定时任务
      await chrome.alarms.create(this.SYNC_ALARM_NAME, {
        periodInMinutes: this.SYNC_INTERVAL_MINUTES,
      })
      console.log(`[SyncScheduler] Periodic sync set to ${this.SYNC_INTERVAL_MINUTES} minutes`)
    } catch (error) {
      console.error('[SyncScheduler] Setup periodic sync failed:', error)
    }
  }

  /**
   * 设置 Alarm 监听器
   */
  private setupAlarmListener(): void {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === this.SYNC_ALARM_NAME) {
        console.log('[SyncScheduler] Auto sync triggered')
        this.triggerSync()
      }
    })
  }

  /**
   * 设置网络状态监听器
   */
  private setupNetworkListener(): void {
    // 监听网络恢复
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncScheduler] Network restored, triggering sync')
        this.triggerSync()
      })

      window.addEventListener('offline', () => {
        console.log('[SyncScheduler] Network lost')
      })
    }
  }

  /**
   * 触发同步
   */
  async triggerSync(): Promise<void> {
    try {
      // 检查是否已登录
      const user = authService.getCurrentUser()
      if (!user) {
        console.log('[SyncScheduler] Not signed in, skipping sync')
        return
      }

      // 检查网络状态
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log('[SyncScheduler] Offline, skipping sync')
        return
      }

      // 执行同步
      console.log('[SyncScheduler] Starting sync...')
      const result = await syncService.syncAll()

      if (result.success) {
        console.log('[SyncScheduler] Sync completed successfully')
      } else {
        console.error('[SyncScheduler] Sync failed:', result.error)
      }
    } catch (error) {
      console.error('[SyncScheduler] Trigger sync failed:', error)
    }
  }

  /**
   * 手动触发立即同步
   */
  async syncNow(): Promise<void> {
    console.log('[SyncScheduler] Manual sync triggered')
    await this.triggerSync()
  }

  /**
   * 停止调度器
   */
  async stop(): Promise<void> {
    try {
      await chrome.alarms.clear(this.SYNC_ALARM_NAME)
      this.isInitialized = false
      console.log('[SyncScheduler] Stopped')
    } catch (error) {
      console.error('[SyncScheduler] Stop failed:', error)
    }
  }
}

// 导出单例
export const syncScheduler = new SyncScheduler()
