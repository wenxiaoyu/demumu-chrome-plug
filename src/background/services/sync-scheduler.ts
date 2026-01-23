/**
 * 同步调度器
 * 负责网络状态监听和手动同步触发
 * 注意：自动定时同步已禁用
 */

import { syncService } from '../../shared/services/sync-service'
import { authService } from '../../shared/services/auth-service'

/**
 * 同步调度器类
 */
export class SyncScheduler {
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

    // 监听网络状态变化
    this.setupNetworkListener()

    this.isInitialized = true
    console.log('[SyncScheduler] Initialized (auto-sync disabled)')
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
    this.isInitialized = false
    console.log('[SyncScheduler] Stopped')
  }
}

// 导出单例
export const syncScheduler = new SyncScheduler()
