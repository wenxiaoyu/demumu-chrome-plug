/**
 * 数据同步服务
 * 负责本地数据与云端数据的双向同步
 */

import { storage } from '../storage'
import { STORAGE_KEYS, DEFAULT_DEATH_DETECTION_CONFIG } from '../constants'
import { authService } from './auth-service'
import { firestoreService } from './firestore-service'
import type {
  UserData,
  KnockRecord,
  DailyStats,
  EmergencyContact,
  UserSettings,
  DeathDetectionConfig,
} from '../types'

/**
 * 同步状态枚举
 */
export enum SyncStatus {
  Idle = 'idle', // 空闲
  Syncing = 'syncing', // 同步中
  Success = 'success', // 同步成功
  Error = 'error', // 同步失败
  Offline = 'offline', // 离线
}

/**
 * 同步结果接口
 */
interface SyncResult {
  success: boolean
  error?: string
  syncedAt?: number
}

/**
 * 同步服务类
 */
export class SyncService {
  private isSyncing = false
  private lastSyncTime = 0
  private syncStatus: SyncStatus = SyncStatus.Idle

  /**
   * 同步用户数据（双向）
   */
  async syncUserData(): Promise<SyncResult> {
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.idToken) {
        return { success: false, error: 'Not signed in' }
      }

      console.log('[SyncService] Syncing user data...')

      // 获取本地数据
      const localData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA)
      if (!localData) {
        return { success: false, error: 'No local data' }
      }

      // 获取云端数据
      const cloudData = await firestoreService.getUserData(user.uid, user.idToken)

      if (!cloudData) {
        // 云端无数据，上传本地数据
        await firestoreService.setUserData(user.uid, localData, user.idToken)
        console.log('[SyncService] User data uploaded to cloud')
      } else if (localData.updatedAt > cloudData.updatedAt) {
        // 本地数据更新，上传到云端
        await firestoreService.setUserData(user.uid, localData, user.idToken)
        console.log('[SyncService] User data uploaded (local newer)')
      } else if (cloudData.updatedAt > localData.updatedAt) {
        // 云端数据更新，下载到本地
        const mergedData: UserData = {
          ...localData,
          displayName: cloudData.displayName, // 同步显示名称
          totalKnocks: cloudData.totalKnocks,
          todayKnocks: cloudData.todayKnocks,
          lastKnockTime: cloudData.lastKnockTime,
          merit: cloudData.merit,
          hp: cloudData.hp,
          consecutiveDays: cloudData.consecutiveDays,
          status: cloudData.status,
          updatedAt: cloudData.updatedAt,
        }
        await storage.set(STORAGE_KEYS.USER_DATA, mergedData)
        console.log('[SyncService] User data downloaded (cloud newer)')
      } else {
        console.log('[SyncService] User data already in sync')
      }

      return { success: true, syncedAt: Date.now() }
    } catch (error) {
      console.error('[SyncService] Sync user data failed:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * 同步紧急联系人（双向）
   */
  async syncEmergencyContacts(): Promise<SyncResult> {
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.idToken) {
        return { success: false, error: 'Not signed in' }
      }

      console.log('[SyncService] Syncing emergency contacts...')

      // 获取本地联系人数据（ContactsData 格式）
      const localContactsData = await storage.get<{
        contacts: EmergencyContact[]
        version: number
      }>(STORAGE_KEYS.CONTACTS)

      // 提取联系人数组和版本号
      const localContacts = localContactsData?.contacts || []
      const localVersion = localContactsData?.version || 0
      const localUpdatedAt = (await storage.get<number>('contactsUpdatedAt')) || 0

      // 获取云端联系人
      const cloudData = await firestoreService.getEmergencyContacts(user.uid, user.idToken)

      if (!cloudData) {
        // 云端无数据，上传本地数据
        if (localContacts.length > 0) {
          await firestoreService.setEmergencyContacts(user.uid, localContacts, localVersion, user.idToken)
          console.log('[SyncService] Emergency contacts uploaded to cloud')
        }
      } else if (localUpdatedAt > cloudData.updatedAt) {
        // 本地数据更新，上传到云端
        await firestoreService.setEmergencyContacts(user.uid, localContacts, localVersion, user.idToken)
        console.log('[SyncService] Emergency contacts uploaded (local newer)')
      } else if (cloudData.updatedAt > localUpdatedAt) {
        // 云端数据更新，下载到本地
        const updatedContactsData = {
          contacts: cloudData.contacts,
          version: cloudData.version,
        }
        await storage.set(STORAGE_KEYS.CONTACTS, updatedContactsData)
        await storage.set('contactsVersion', cloudData.version)
        await storage.set('contactsUpdatedAt', cloudData.updatedAt)
        console.log('[SyncService] Emergency contacts downloaded (cloud newer)')
      } else {
        console.log('[SyncService] Emergency contacts already in sync')
      }

      return { success: true, syncedAt: Date.now() }
    } catch (error) {
      console.error('[SyncService] Sync emergency contacts failed:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * 同步敲击记录（仅上传）
   */
  async syncKnockRecords(): Promise<SyncResult> {
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.idToken) {
        return { success: false, error: 'Not signed in' }
      }

      console.log('[SyncService] Syncing knock records...')

      // 获取未同步的记录
      const unsyncedRecords = (await storage.get<KnockRecord[]>('unsyncedKnockRecords')) || []

      if (unsyncedRecords.length === 0) {
        console.log('[SyncService] No unsynced knock records')
        return { success: true, syncedAt: Date.now() }
      }

      // 批量上传记录
      await firestoreService.batchAddKnockRecords(user.uid, unsyncedRecords, user.idToken)

      // 清空未同步记录
      await storage.set('unsyncedKnockRecords', [])
      console.log(`[SyncService] ${unsyncedRecords.length} knock records synced`)

      return { success: true, syncedAt: Date.now() }
    } catch (error) {
      console.error('[SyncService] Sync knock records failed:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * 同步每日统计（仅上传）
   */
  async syncDailyStats(): Promise<SyncResult> {
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.idToken) {
        return { success: false, error: 'Not signed in' }
      }

      console.log('[SyncService] Syncing daily stats...')

      // 获取未同步的统计
      const unsyncedStats = (await storage.get<DailyStats[]>('unsyncedDailyStats')) || []

      if (unsyncedStats.length === 0) {
        console.log('[SyncService] No unsynced daily stats')
        return { success: true, syncedAt: Date.now() }
      }

      // 批量上传统计
      await firestoreService.batchSetDailyStats(user.uid, unsyncedStats, user.idToken)

      // 清空未同步统计
      await storage.set('unsyncedDailyStats', [])
      console.log(`[SyncService] ${unsyncedStats.length} daily stats synced`)

      return { success: true, syncedAt: Date.now() }
    } catch (error) {
      console.error('[SyncService] Sync daily stats failed:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * 同步用户配置（双向）
   */
  async syncUserSettings(): Promise<SyncResult> {
    try {
      const user = authService.getCurrentUser()
      if (!user || !user.idToken) {
        return { success: false, error: 'Not signed in' }
      }

      console.log('[SyncService] Syncing user settings...')

      // 获取本地配置
      const [language, deathDetectionConfig, customEmailTemplate] = await Promise.all([
        storage.get<string>(STORAGE_KEYS.LANGUAGE),
        storage.get<DeathDetectionConfig>(STORAGE_KEYS.DEATH_DETECTION_CONFIG),
        storage.get<{
          zh_CN: { subject: string; htmlBody: string; textBody: string }
          en: { subject: string; htmlBody: string; textBody: string }
        }>('customEmailTemplate'),
      ])

      const localVersion = (await storage.get<number>('settingsVersion')) || 1
      const localUpdatedAt = (await storage.get<number>('settingsUpdatedAt')) || 0

      // 如果本地没有邮件模板，生成默认的多语言模板
      let emailTemplate = customEmailTemplate
      if (!emailTemplate) {
        const { getDefaultMultiLanguageEmailTemplate } = await import('./email-template-service')
        emailTemplate = getDefaultMultiLanguageEmailTemplate()
        await storage.set('customEmailTemplate', emailTemplate)
        console.log('[SyncService] Default multi-language email template generated')
      }

      // 构建本地配置对象
      const localSettings: UserSettings = {
        language: language || 'zh_CN',
        deathDetectionConfig: deathDetectionConfig || DEFAULT_DEATH_DETECTION_CONFIG,
        emailTemplate: emailTemplate,
        version: localVersion,
        updatedAt: localUpdatedAt,
      }

      // 获取云端配置
      const cloudSettings = await firestoreService.getUserSettings(user.uid, user.idToken)

      if (!cloudSettings) {
        // 云端无数据，上传本地配置
        await firestoreService.setUserSettings(user.uid, localSettings, user.idToken)
        await storage.set('settingsUpdatedAt', Date.now())
        console.log(
          '[SyncService] User settings uploaded to cloud (including multi-language email template)'
        )
      } else if (localUpdatedAt > cloudSettings.updatedAt) {
        // 本地配置更新，上传到云端
        await firestoreService.setUserSettings(user.uid, localSettings, user.idToken)
        console.log('[SyncService] User settings uploaded (local newer)')
      } else if (cloudSettings.updatedAt > localUpdatedAt) {
        // 云端配置更新，下载到本地
        await storage.set(STORAGE_KEYS.LANGUAGE, cloudSettings.language)
        await storage.set(STORAGE_KEYS.DEATH_DETECTION_CONFIG, cloudSettings.deathDetectionConfig)
        if (cloudSettings.emailTemplate) {
          await storage.set('customEmailTemplate', cloudSettings.emailTemplate)
        }
        await storage.set('settingsVersion', cloudSettings.version)
        await storage.set('settingsUpdatedAt', cloudSettings.updatedAt)
        console.log('[SyncService] User settings downloaded (cloud newer)')

        // 通知其他组件配置已更新
        chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' }).catch(() => {
          // 忽略错误，可能没有监听器
        })
      } else {
        console.log('[SyncService] User settings already in sync')
      }

      return { success: true, syncedAt: Date.now() }
    } catch (error) {
      console.error('[SyncService] Sync user settings failed:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * 批量同步所有数据
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress')
      return { success: false, error: 'Sync already in progress' }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[SyncService] Offline, skipping sync')
      this.syncStatus = SyncStatus.Offline
      return { success: false, error: 'Offline' }
    }

    this.isSyncing = true
    this.syncStatus = SyncStatus.Syncing

    try {
      console.log('[SyncService] Starting full sync...')

      // 按顺序同步各类数据
      const results = await Promise.all([
        this.syncUserData(),
        this.syncUserSettings(),
        this.syncEmergencyContacts(),
        this.syncKnockRecords(),
        this.syncDailyStats(),
      ])

      // 检查是否全部成功
      const allSuccess = results.every((r) => r.success)

      if (allSuccess) {
        this.lastSyncTime = Date.now()
        this.syncStatus = SyncStatus.Success
        await this.updateLastSyncTime()
        console.log('[SyncService] Full sync completed successfully')
        return { success: true, syncedAt: this.lastSyncTime }
      } else {
        this.syncStatus = SyncStatus.Error
        const errors = results.filter((r) => !r.success).map((r) => r.error)
        console.error('[SyncService] Some syncs failed:', errors)
        return { success: false, error: errors.join(', ') }
      }
    } catch (error) {
      this.syncStatus = SyncStatus.Error
      console.error('[SyncService] Full sync failed:', error)
      return { success: false, error: String(error) }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus
  }

  /**
   * 获取最后同步时间
   */
  getLastSyncTime(): number {
    return this.lastSyncTime
  }

  /**
   * 更新最后同步时间
   */
  private async updateLastSyncTime(): Promise<void> {
    await storage.set('lastSyncTime', this.lastSyncTime)
  }

  /**
   * 从存储加载最后同步时间
   */
  async loadLastSyncTime(): Promise<void> {
    const time = await storage.get<number>('lastSyncTime')
    if (time) {
      this.lastSyncTime = time
    }
  }

  /**
   * 标记敲击记录为待同步
   */
  async markKnockRecordForSync(record: KnockRecord): Promise<void> {
    const unsyncedRecords = (await storage.get<KnockRecord[]>('unsyncedKnockRecords')) || []
    unsyncedRecords.push(record)
    await storage.set('unsyncedKnockRecords', unsyncedRecords)
  }

  /**
   * 标记每日统计为待同步
   */
  async markDailyStatsForSync(stats: DailyStats): Promise<void> {
    const unsyncedStats = (await storage.get<DailyStats[]>('unsyncedDailyStats')) || []
    // 检查是否已存在该日期的统计
    const existingIndex = unsyncedStats.findIndex((s) => s.date === stats.date)
    if (existingIndex >= 0) {
      unsyncedStats[existingIndex] = stats
    } else {
      unsyncedStats.push(stats)
    }
    await storage.set('unsyncedDailyStats', unsyncedStats)
  }

  /**
   * 标记用户配置为待同步
   */
  async markSettingsForSync(): Promise<void> {
    await storage.set('settingsUpdatedAt', Date.now())
  }
}

// 导出单例
export const syncService = new SyncService()
