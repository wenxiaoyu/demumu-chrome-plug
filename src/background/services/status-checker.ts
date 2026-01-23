/**
 * 状态检测服务
 *
 * 负责：
 * 1. 定期检查用户状态
 * 2. 计算当前 HP
 * 3. 检测死亡/警告状态
 * 4. 更新 Badge
 */

import { storage } from '../../shared/storage'
import { STORAGE_KEYS, HP_THRESHOLDS } from '../../shared/constants'
import { UserData } from '../../shared/types'
import { calculateCurrentHP, getHPColor, getHPStatus } from '../../shared/utils/hp-calculator'
import { isSameDay } from '../../shared/utils/date'

export class StatusChecker {
  constructor() {
    // Notification service removed
  }

  /**
   * 检查并更新用户状态
   */
  async checkAndUpdate(): Promise<void> {
    try {
      console.log('[StatusChecker] Starting status check...')

      const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA)

      if (!userData) {
        console.log('[StatusChecker] No user data found, skipping check')
        return
      }

      const now = Date.now()
      let needsUpdate = false
      const updates: Partial<UserData> = {}

      // 1. 检查跨天，重置 todayKnocks
      if (!isSameDay(userData.lastKnockTime, now)) {
        console.log('[StatusChecker] New day detected, resetting todayKnocks')
        updates.todayKnocks = 0
        needsUpdate = true
      }

      // 2. 计算当前 HP（考虑时间惩罚）
      const currentHP = calculateCurrentHP(userData.lastKnockTime, userData.hp, now)

      if (currentHP !== userData.hp) {
        console.log(`[StatusChecker] HP changed: ${userData.hp} → ${currentHP}`)
        updates.hp = currentHP
        needsUpdate = true
      }

      // 3. 检测状态变化
      const previousStatus = userData.status
      const currentStatus = currentHP > 0 ? 'alive' : 'dead'

      if (currentStatus !== previousStatus) {
        console.log(`[StatusChecker] Status changed: ${previousStatus} → ${currentStatus}`)
        updates.status = currentStatus
        needsUpdate = true
      }

      // 4. 检测 HP 警告状态（通知已禁用）
      if (currentStatus === 'alive' && currentHP <= HP_THRESHOLDS.WARNING && currentHP > 0) {
        const hpStatus = getHPStatus(currentHP)
        if (hpStatus === 'critical' || hpStatus === 'warning') {
          console.log(`[StatusChecker] HP warning: ${currentHP} (notification disabled)`)
        }
      }

      // 5. 保存更新
      if (needsUpdate) {
        const updatedData: UserData = {
          ...userData,
          ...updates,
          updatedAt: now,
        }
        await storage.set(STORAGE_KEYS.USER_DATA, updatedData)
        console.log('[StatusChecker] User data updated:', updates)
      }

      // 6. 更新 Badge
      await this.updateBadge(currentHP)

      console.log('[StatusChecker] Status check completed')
    } catch (error) {
      console.error('[StatusChecker] Error during status check:', error)
    }
  }

  /**
   * 更新浏览器扩展图标的 Badge
   */
  async updateBadge(hp: number): Promise<void> {
    try {
      // 设置 Badge 文本（显示 HP 数值）
      await chrome.action.setBadgeText({ text: hp.toString() })

      // 设置 Badge 背景颜色（根据 HP 状态）
      const color = getHPColor(hp)
      await chrome.action.setBadgeBackgroundColor({ color })

      console.log(`[StatusChecker] Badge updated: HP=${hp}, color=${color}`)
    } catch (error) {
      console.error('[StatusChecker] Error updating badge:', error)
    }
  }

  /**
   * 初始化检查（插件安装或浏览器启动时）
   */
  async initialize(): Promise<void> {
    console.log('[StatusChecker] Initializing...')
    await this.checkAndUpdate()
  }
}
