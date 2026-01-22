/**
 * 数据迁移服务
 * 负责首次登录时将本地数据迁移到云端
 */

import { storage } from '../storage'
import { STORAGE_KEYS, DEFAULT_DEATH_DETECTION_CONFIG } from '../constants'
import { firestoreService } from './firestore-service'
import { getDefaultMultiLanguageEmailTemplate } from './email-template-service'
import type {
  UserData,
  KnockRecord,
  DailyStats,
  EmergencyContact,
  UserSettings,
  MultiLanguageEmailTemplate,
  EmailTemplate,
} from '../types'

/**
 * 迁移结果接口
 */
export interface MigrationResult {
  success: boolean
  migratedItems: {
    userData: boolean
    userSettings: boolean
    contacts: boolean
    knockRecords: number
    dailyStats: number
  }
  error?: string
}

/**
 * 检查是否已迁移
 */
export async function isMigrated(): Promise<boolean> {
  const migrated = await storage.get<boolean>('dataMigrated')
  return migrated === true
}

/**
 * 迁移本地数据到云端
 */
export async function migrateLocalDataToCloud(uid: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedItems: {
      userData: false,
      userSettings: false,
      contacts: false,
      knockRecords: 0,
      dailyStats: 0,
    },
  }

  try {
    console.log('[DataMigration] Starting data migration...')

    // 1. 迁移用户数据
    const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA)
    if (userData) {
      await firestoreService.setUserData(uid, userData)
      result.migratedItems.userData = true
      console.log('[DataMigration] User data migrated')
    }

    // 2. 迁移用户配置（包括邮件模板）
    const language = (await storage.get<string>(STORAGE_KEYS.LANGUAGE)) || 'zh_CN'
    const deathDetectionConfig =
      (await storage.get<typeof DEFAULT_DEATH_DETECTION_CONFIG>(
        STORAGE_KEYS.DEATH_DETECTION_CONFIG
      )) || DEFAULT_DEATH_DETECTION_CONFIG

    // 获取或生成多语言邮件模板
    let emailTemplate = await storage.get<MultiLanguageEmailTemplate>('customEmailTemplate')

    if (!emailTemplate) {
      // 检查是否有旧的单语言模板
      const oldTemplate = await storage.get<EmailTemplate>('customEmailTemplate')

      if (oldTemplate && oldTemplate.subject) {
        // 迁移旧模板：将单语言模板转换为多语言格式
        console.log(
          '[DataMigration] Migrating old single-language template to multi-language format'
        )
        const defaultMultiLang = getDefaultMultiLanguageEmailTemplate()

        // 根据当前语言决定将旧模板放在哪个语言下
        if (language === 'zh_CN') {
          emailTemplate = {
            zh_CN: oldTemplate,
            en: defaultMultiLang.en,
          }
        } else {
          emailTemplate = {
            zh_CN: defaultMultiLang.zh_CN,
            en: oldTemplate,
          }
        }
      } else {
        // 如果没有任何模板，使用默认的多语言模板
        emailTemplate = getDefaultMultiLanguageEmailTemplate()
      }

      await storage.set('customEmailTemplate', emailTemplate)
      console.log('[DataMigration] Multi-language email template generated')
    }

    const userSettings: UserSettings = {
      language,
      deathDetectionConfig,
      emailTemplate,
      version: 1,
      updatedAt: Date.now(),
    }

    await firestoreService.setUserSettings(uid, userSettings)
    result.migratedItems.userSettings = true
    console.log('[DataMigration] User settings migrated (including multi-language email template)')

    // 3. 迁移紧急联系人
    const contactsData = await storage.get<{ contacts: EmergencyContact[]; version: number }>(
      STORAGE_KEYS.CONTACTS
    )
    if (contactsData && contactsData.contacts && contactsData.contacts.length > 0) {
      await firestoreService.setEmergencyContacts(
        uid,
        contactsData.contacts,
        contactsData.version || 1
      )
      result.migratedItems.contacts = true
      console.log('[DataMigration] Emergency contacts migrated')
    }

    // 4. 迁移敲击记录（最近 100 条）
    const knockRecords = (await storage.get<KnockRecord[]>(STORAGE_KEYS.KNOCK_HISTORY)) || []
    if (knockRecords.length > 0) {
      // 只迁移最近 100 条记录
      const recentRecords = knockRecords.slice(-100)
      await firestoreService.batchAddKnockRecords(uid, recentRecords)
      result.migratedItems.knockRecords = recentRecords.length
      console.log(`[DataMigration] ${recentRecords.length} knock records migrated`)
    }

    // 5. 迁移每日统计（最近 30 天）
    const dailyStats = (await storage.get<DailyStats[]>(STORAGE_KEYS.DAILY_STATS)) || []
    if (dailyStats.length > 0) {
      // 只迁移最近 30 天的统计
      const recentStats = dailyStats.slice(-30)
      await firestoreService.batchSetDailyStats(uid, recentStats)
      result.migratedItems.dailyStats = recentStats.length
      console.log(`[DataMigration] ${recentStats.length} daily stats migrated`)
    }

    // 6. 标记已迁移
    await storage.set('dataMigrated', true)
    await storage.set('migratedAt', Date.now())

    result.success = true
    console.log('[DataMigration] Migration completed successfully')

    return result
  } catch (error) {
    console.error('[DataMigration] Migration failed:', error)
    result.error = String(error)
    return result
  }
}

/**
 * 重置迁移状态（用于测试）
 */
export async function resetMigrationStatus(): Promise<void> {
  await storage.set('dataMigrated', false)
  await storage.remove('migratedAt')
  console.log('[DataMigration] Migration status reset')
}
