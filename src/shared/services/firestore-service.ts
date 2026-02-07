/**
 * Firestore 数据服务 - REST API 版本
 * 使用 Firebase REST API 替代 SDK，符合 Manifest V3 规范
 */

import { FirestoreRest } from './firestore-rest'
import { firebaseConfig } from '../config/firebase'
import type { UserData, KnockRecord, DailyStats, EmergencyContact, UserSettings } from '../types'

/**
 * Firestore 用户数据接口（云端格式）
 */
interface FirestoreUserData {
  uid: string
  displayName?: string
  totalKnocks: number
  todayKnocks: number
  lastKnockTime: number
  merit: number
  hp: number
  consecutiveDays: number
  status: 'alive' | 'dead'
  updatedAt: number
}

/**
 * Firestore 联系人数据接口
 */
interface FirestoreContactsData {
  uid: string
  contacts: EmergencyContact[]
  version: number
  updatedAt: number
}

/**
 * Firestore 用户配置接口
 */
interface FirestoreUserSettings {
  uid: string
  language: string
  deathDetectionConfig: {
    enabled: boolean
    inactivityThreshold: number
    hpThreshold: number
    checkInterval: number
  }
  emailTemplate?: {
    zh_CN: {
      subject: string
      htmlBody: string
      textBody: string
    }
    en: {
      subject: string
      htmlBody: string
      textBody: string
    }
  }
  version: number
  updatedAt: number
}

/**
 * Firestore 服务类
 */
export class FirestoreService {
  private firestoreRest: FirestoreRest

  constructor() {
    this.firestoreRest = new FirestoreRest(firebaseConfig.projectId)
  }

  /**
   * 获取用户数据
   */
  async getUserData(uid: string, idToken: string): Promise<FirestoreUserData | null> {
    try {
      const data = await this.firestoreRest.getDocument(`userData/${uid}`, idToken)
      return data as FirestoreUserData
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
        return null
      }
      console.error('[FirestoreService] Get user data failed:', error)
      throw error
    }
  }

  /**
   * 保存用户数据
   */
  async saveUserData(
    uid: string,
    data: Partial<FirestoreUserData>,
    idToken: string
  ): Promise<void> {
    try {
      const userData: FirestoreUserData = {
        uid,
        totalKnocks: data.totalKnocks ?? 0,
        todayKnocks: data.todayKnocks ?? 0,
        lastKnockTime: data.lastKnockTime ?? Date.now(),
        merit: data.merit ?? 0,
        hp: data.hp ?? 100,
        consecutiveDays: data.consecutiveDays ?? 0,
        status: data.status ?? 'alive',
        updatedAt: Date.now(),
        ...(data.displayName && { displayName: data.displayName }),
      }

      await this.firestoreRest.setDocument(`userData/${uid}`, userData, idToken)
      console.log('[FirestoreService] User data saved')
    } catch (error) {
      console.error('[FirestoreService] Save user data failed:', error)
      throw error
    }
  }

  /**
   * 获取联系人数据
   */
  async getContacts(uid: string, idToken: string): Promise<EmergencyContact[]> {
    try {
      const data = await this.firestoreRest.getDocument(`emergencyContacts/${uid}`, idToken)
      if (data && data.contacts) {
        return data.contacts as EmergencyContact[]
      }
      return []
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
        return []
      }
      console.error('[FirestoreService] Get contacts failed:', error)
      throw error
    }
  }

  /**
   * 保存联系人数据
   */
  async saveContacts(uid: string, contacts: EmergencyContact[], idToken: string): Promise<void> {
    try {
      const contactsData: FirestoreContactsData = {
        uid,
        contacts,
        version: 1,
        updatedAt: Date.now(),
      }

      await this.firestoreRest.setDocument(`emergencyContacts/${uid}`, contactsData, idToken)
      console.log('[FirestoreService] Contacts saved')
    } catch (error) {
      console.error('[FirestoreService] Save contacts failed:', error)
      throw error
    }
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(uid: string, idToken: string): Promise<UserSettings | null> {
    try {
      const data = await this.firestoreRest.getDocument(`userSettings/${uid}`, idToken)
      if (data) {
        return {
          language: data.language,
          deathDetectionConfig: data.deathDetectionConfig,
          emailTemplate: data.emailTemplate,
        } as UserSettings
      }
      return null
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
        return null
      }
      console.error('[FirestoreService] Get user settings failed:', error)
      throw error
    }
  }

  /**
   * 保存用户设置
   */
  async saveUserSettings(uid: string, settings: UserSettings, idToken: string): Promise<void> {
    try {
      const settingsData: FirestoreUserSettings = {
        uid,
        language: settings.language,
        deathDetectionConfig: settings.deathDetectionConfig,
        emailTemplate: settings.emailTemplate,
        version: 1,
        updatedAt: Date.now(),
      }

      await this.firestoreRest.setDocument(`userSettings/${uid}`, settingsData, idToken)
      console.log('[FirestoreService] User settings saved')
    } catch (error) {
      console.error('[FirestoreService] Save user settings failed:', error)
      throw error
    }
  }

  /**
   * 保存敲击记录
   */
  async saveKnockRecord(uid: string, record: KnockRecord, idToken: string): Promise<void> {
    try {
      const recordPath = `userData/${uid}/knockRecords/${record.id}`
      await this.firestoreRest.setDocument(recordPath, record, idToken)
      console.log('[FirestoreService] Knock record saved')
    } catch (error) {
      console.error('[FirestoreService] Save knock record failed:', error)
      throw error
    }
  }

  /**
   * 获取敲击记录
   */
  async getKnockRecords(
    uid: string,
    idToken: string,
    limitCount: number = 100
  ): Promise<KnockRecord[]> {
    try {
      const records = await this.firestoreRest.queryCollection(
        `userData/${uid}/knockRecords`,
        idToken,
        {
          orderBy: 'timestamp',
          limit: limitCount,
        }
      )
      return records as KnockRecord[]
    } catch (error) {
      console.error('[FirestoreService] Get knock records failed:', error)
      return []
    }
  }

  /**
   * 保存每日统计
   */
  async saveDailyStats(uid: string, stats: DailyStats, idToken: string): Promise<void> {
    try {
      const statsPath = `userData/${uid}/dailyStats/${stats.date}`
      await this.firestoreRest.setDocument(statsPath, stats, idToken)
      console.log('[FirestoreService] Daily stats saved')
    } catch (error) {
      console.error('[FirestoreService] Save daily stats failed:', error)
      throw error
    }
  }

  /**
   * 获取每日统计
   */
  async getDailyStats(
    uid: string,
    idToken: string,
    limitCount: number = 365
  ): Promise<DailyStats[]> {
    try {
      const stats = await this.firestoreRest.queryCollection(
        `userData/${uid}/dailyStats`,
        idToken,
        {
          orderBy: 'date',
          limit: limitCount,
        }
      )
      return stats as DailyStats[]
    } catch (error) {
      console.error('[FirestoreService] Get daily stats failed:', error)
      return []
    }
  }

  /**
   * 设置用户数据（别名方法，用于兼容）
   */
  async setUserData(uid: string, data: UserData, idToken: string): Promise<void> {
    return this.saveUserData(uid, data, idToken)
  }

  /**
   * 获取紧急联系人（别名方法，用于兼容）
   */
  async getEmergencyContacts(uid: string, idToken: string): Promise<FirestoreContactsData | null> {
    try {
      const data = await this.firestoreRest.getDocument(`emergencyContacts/${uid}`, idToken)
      return data as FirestoreContactsData
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
        return null
      }
      console.error('[FirestoreService] Get emergency contacts failed:', error)
      throw error
    }
  }

  /**
   * 设置紧急联系人（别名方法，用于兼容）
   */
  async setEmergencyContacts(
    uid: string,
    contacts: EmergencyContact[],
    version: number,
    idToken: string
  ): Promise<void> {
    try {
      const contactsData: FirestoreContactsData = {
        uid,
        contacts,
        version,
        updatedAt: Date.now(),
      }
      await this.firestoreRest.setDocument(`emergencyContacts/${uid}`, contactsData, idToken)
      console.log('[FirestoreService] Emergency contacts saved')
    } catch (error) {
      console.error('[FirestoreService] Save emergency contacts failed:', error)
      throw error
    }
  }

  /**
   * 设置用户设置（别名方法，用于兼容）
   */
  async setUserSettings(uid: string, settings: UserSettings, idToken: string): Promise<void> {
    return this.saveUserSettings(uid, settings, idToken)
  }

  /**
   * 批量添加敲击记录
   */
  async batchAddKnockRecords(uid: string, records: KnockRecord[], idToken: string): Promise<void> {
    try {
      const writes = records.map((record) => ({
        path: `userData/${uid}/knockRecords/${record.id}`,
        data: record,
      }))
      await this.firestoreRest.batchWrite(writes, idToken)
      console.log('[FirestoreService] Batch knock records saved:', records.length)
    } catch (error) {
      console.error('[FirestoreService] Batch add knock records failed:', error)
      throw error
    }
  }

  /**
   * 批量设置每日统计
   */
  async batchSetDailyStats(uid: string, stats: DailyStats[], idToken: string): Promise<void> {
    try {
      const writes = stats.map((stat) => ({
        path: `userData/${uid}/dailyStats/${stat.date}`,
        data: stat,
      }))
      await this.firestoreRest.batchWrite(writes, idToken)
      console.log('[FirestoreService] Batch daily stats saved:', stats.length)
    } catch (error) {
      console.error('[FirestoreService] Batch set daily stats failed:', error)
      throw error
    }
  }

  /**
   * 批量同步数据
   */
  async batchSync(
    uid: string,
    data: {
      userData?: Partial<FirestoreUserData>
      contacts?: EmergencyContact[]
      settings?: UserSettings
      knockRecords?: KnockRecord[]
      dailyStats?: DailyStats[]
    },
    idToken: string
  ): Promise<void> {
    try {
      const writes: Array<{ path: string; data: any }> = []

      // 用户数据
      if (data.userData) {
        const userData: FirestoreUserData = {
          uid,
          totalKnocks: data.userData.totalKnocks ?? 0,
          todayKnocks: data.userData.todayKnocks ?? 0,
          lastKnockTime: data.userData.lastKnockTime ?? Date.now(),
          merit: data.userData.merit ?? 0,
          hp: data.userData.hp ?? 100,
          consecutiveDays: data.userData.consecutiveDays ?? 0,
          status: data.userData.status ?? 'alive',
          updatedAt: Date.now(),
          ...(data.userData.displayName && { displayName: data.userData.displayName }),
        }
        writes.push({ path: `userData/${uid}`, data: userData })
      }

      // 联系人
      if (data.contacts) {
        const contactsData: FirestoreContactsData = {
          uid,
          contacts: data.contacts,
          version: 1,
          updatedAt: Date.now(),
        }
        writes.push({ path: `emergencyContacts/${uid}`, data: contactsData })
      }

      // 设置
      if (data.settings) {
        const settingsData: FirestoreUserSettings = {
          uid,
          language: data.settings.language,
          deathDetectionConfig: data.settings.deathDetectionConfig,
          emailTemplate: data.settings.emailTemplate,
          version: 1,
          updatedAt: Date.now(),
        }
        writes.push({ path: `userSettings/${uid}`, data: settingsData })
      }

      // 敲击记录
      if (data.knockRecords) {
        data.knockRecords.forEach((record) => {
          writes.push({
            path: `userData/${uid}/knockRecords/${record.id}`,
            data: record,
          })
        })
      }

      // 每日统计
      if (data.dailyStats) {
        data.dailyStats.forEach((stats) => {
          writes.push({
            path: `userData/${uid}/dailyStats/${stats.date}`,
            data: stats,
          })
        })
      }

      // 批量写入
      if (writes.length > 0) {
        await this.firestoreRest.batchWrite(writes, idToken)
        console.log('[FirestoreService] Batch sync completed:', writes.length, 'writes')
      }
    } catch (error) {
      console.error('[FirestoreService] Batch sync failed:', error)
      throw error
    }
  }
}

// 导出单例
export const firestoreService = new FirestoreService()
