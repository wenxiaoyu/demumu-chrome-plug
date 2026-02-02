/**
 * Firestore 数据服务
 * 负责与 Firebase Firestore 交互，实现数据的 CRUD 操作
 */

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  type Firestore,
} from 'firebase/firestore'
import type { UserData, KnockRecord, DailyStats, EmergencyContact, UserSettings } from '../types'

/**
 * Firestore 用户数据接口（云端格式）
 */
interface FirestoreUserData {
  uid: string
  displayName?: string // 用户自定义显示名称
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
  private db: Firestore

  constructor() {
    this.db = getFirestore()
  }

  /**
   * 获取用户数据
   */
  async getUserData(uid: string): Promise<FirestoreUserData | null> {
    try {
      const docRef = doc(this.db, 'userData', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return docSnap.data() as FirestoreUserData
      }
      return null
    } catch (error) {
      console.error('[FirestoreService] Get user data failed:', error)
      throw error
    }
  }

  /**
   * 设置用户数据
   */
  async setUserData(
    uid: string,
    data: Partial<UserData> & { displayName?: string }
  ): Promise<void> {
    try {
      const docRef = doc(this.db, 'userData', uid)
      const firestoreData: Partial<FirestoreUserData> = {
        uid,
        updatedAt: Date.now(),
      }

      // 只更新提供的字段
      if (data.displayName !== undefined) firestoreData.displayName = data.displayName
      if (data.totalKnocks !== undefined) firestoreData.totalKnocks = data.totalKnocks
      if (data.todayKnocks !== undefined) firestoreData.todayKnocks = data.todayKnocks
      if (data.lastKnockTime !== undefined) firestoreData.lastKnockTime = data.lastKnockTime
      if (data.merit !== undefined) firestoreData.merit = data.merit
      if (data.hp !== undefined) firestoreData.hp = data.hp
      if (data.consecutiveDays !== undefined) firestoreData.consecutiveDays = data.consecutiveDays
      if (data.status !== undefined) firestoreData.status = data.status

      await setDoc(docRef, firestoreData, { merge: true })
      console.log('[FirestoreService] User data saved')
    } catch (error) {
      console.error('[FirestoreService] Set user data failed:', error)
      throw error
    }
  }

  /**
   * 更新用户显示名称
   */
  async updateDisplayName(uid: string, displayName: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'userData', uid)
      await setDoc(
        docRef,
        {
          uid,
          displayName,
          updatedAt: Date.now(),
        },
        { merge: true }
      )
      console.log('[FirestoreService] Display name updated')
    } catch (error) {
      console.error('[FirestoreService] Update display name failed:', error)
      throw error
    }
  }

  /**
   * 获取紧急联系人
   */
  async getEmergencyContacts(uid: string): Promise<FirestoreContactsData | null> {
    try {
      const docRef = doc(this.db, 'emergencyContacts', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return docSnap.data() as FirestoreContactsData
      }
      return null
    } catch (error) {
      console.error('[FirestoreService] Get emergency contacts failed:', error)
      throw error
    }
  }

  /**
   * 设置紧急联系人
   */
  async setEmergencyContacts(
    uid: string,
    contacts: EmergencyContact[],
    version: number
  ): Promise<void> {
    try {
      const docRef = doc(this.db, 'emergencyContacts', uid)
      const data: FirestoreContactsData = {
        uid,
        contacts,
        version,
        updatedAt: Date.now(),
      }

      await setDoc(docRef, data)
      console.log('[FirestoreService] Emergency contacts saved')
    } catch (error) {
      console.error('[FirestoreService] Set emergency contacts failed:', error)
      throw error
    }
  }

  /**
   * 获取敲击记录（最近 N 条）
   */
  async getKnockRecords(uid: string, limitCount: number = 100): Promise<KnockRecord[]> {
    try {
      const recordsRef = collection(this.db, 'knockRecords', uid, 'records')
      const q = query(recordsRef, orderBy('timestamp', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)

      const records: KnockRecord[] = []
      querySnapshot.forEach((doc) => {
        records.push(doc.data() as KnockRecord)
      })

      return records
    } catch (error) {
      console.error('[FirestoreService] Get knock records failed:', error)
      throw error
    }
  }

  /**
   * 添加敲击记录
   */
  async addKnockRecord(uid: string, record: KnockRecord): Promise<void> {
    try {
      const recordsRef = collection(this.db, 'knockRecords', uid, 'records')
      await addDoc(recordsRef, record)
      console.log('[FirestoreService] Knock record added')
    } catch (error) {
      console.error('[FirestoreService] Add knock record failed:', error)
      throw error
    }
  }

  /**
   * 获取每日统计（最近 N 天）
   */
  async getDailyStats(uid: string, limitCount: number = 30): Promise<DailyStats[]> {
    try {
      const statsRef = collection(this.db, 'dailyStats', uid, 'stats')
      const q = query(statsRef, orderBy('date', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)

      const stats: DailyStats[] = []
      querySnapshot.forEach((doc) => {
        stats.push(doc.data() as DailyStats)
      })

      return stats
    } catch (error) {
      console.error('[FirestoreService] Get daily stats failed:', error)
      throw error
    }
  }

  /**
   * 设置每日统计
   */
  async setDailyStats(uid: string, date: string, stats: DailyStats): Promise<void> {
    try {
      const docRef = doc(this.db, 'dailyStats', uid, 'stats', date)
      await setDoc(docRef, stats)
      console.log('[FirestoreService] Daily stats saved')
    } catch (error) {
      console.error('[FirestoreService] Set daily stats failed:', error)
      throw error
    }
  }

  /**
   * 批量设置每日统计
   */
  async batchSetDailyStats(uid: string, statsList: DailyStats[]): Promise<void> {
    try {
      const promises = statsList.map((stats) => this.setDailyStats(uid, stats.date, stats))
      await Promise.all(promises)
      console.log('[FirestoreService] Batch daily stats saved')
    } catch (error) {
      console.error('[FirestoreService] Batch set daily stats failed:', error)
      throw error
    }
  }

  /**
   * 批量添加敲击记录
   */
  async batchAddKnockRecords(uid: string, records: KnockRecord[]): Promise<void> {
    try {
      const promises = records.map((record) => this.addKnockRecord(uid, record))
      await Promise.all(promises)
      console.log('[FirestoreService] Batch knock records added')
    } catch (error) {
      console.error('[FirestoreService] Batch add knock records failed:', error)
      throw error
    }
  }

  /**
   * 获取用户配置
   */
  async getUserSettings(uid: string): Promise<FirestoreUserSettings | null> {
    try {
      const docRef = doc(this.db, 'userSettings', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return docSnap.data() as FirestoreUserSettings
      }
      return null
    } catch (error) {
      console.error('[FirestoreService] Get user settings failed:', error)
      throw error
    }
  }

  /**
   * 设置用户配置
   */
  async setUserSettings(uid: string, settings: UserSettings): Promise<void> {
    try {
      const docRef = doc(this.db, 'userSettings', uid)
      const firestoreData: Partial<FirestoreUserSettings> = {
        uid,
        language: settings.language,
        deathDetectionConfig: settings.deathDetectionConfig,
        version: settings.version,
        updatedAt: Date.now(),
      }

      // 只有当 emailTemplate 存在时才添加到数据中
      if (settings.emailTemplate) {
        firestoreData.emailTemplate = settings.emailTemplate
      }

      await setDoc(docRef, firestoreData as FirestoreUserSettings)
      console.log('[FirestoreService] User settings saved')
    } catch (error) {
      console.error('[FirestoreService] Set user settings failed:', error)
      throw error
    }
  }
}

// 导出单例
export const firestoreService = new FirestoreService()
