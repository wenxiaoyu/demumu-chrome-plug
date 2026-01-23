/**
 * 通知服务
 * 
 * 负责显示各种类型的通知：
 * 1. 死亡通知
 * 2. HP 警告通知
 * 3. 首次敲击通知
 */

import { t } from '../../shared/utils/i18n';

export class NotificationService {
  /**
   * 显示死亡警告通知
   * @param daysSinceKnock 距离上次敲击的天数
   */
  async showDeathWarning(daysSinceKnock: number): Promise<void> {
    try {
      const message = daysSinceKnock === 1
        ? t('deathWarning1Day')
        : t('deathWarningDays', String(daysSinceKnock));

      await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: t('notificationDeathWarningTitle'),
        message,
        priority: 2,
      });

      console.log('[NotificationService] Death warning shown');
    } catch (error) {
      console.error('[NotificationService] Error showing death warning:', error);
    }
  }

  /**
   * 显示 HP 警告通知
   * @param hp 当前 HP 值
   */
  async showHPWarning(hp: number): Promise<void> {
    try {
      const message = hp <= 10
        ? t('hpWarningCritical', String(hp))
        : t('hpWarningLow', String(hp));

      await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: t('notificationHpWarningTitle'),
        message,
        priority: 1,
      });

      console.log(`[NotificationService] HP warning shown: ${hp}`);
    } catch (error) {
      console.error('[NotificationService] Error showing HP warning:', error);
    }
  }

  /**
   * 显示首次敲击通知
   * @param consecutiveDays 连续天数
   * @param hp 当前 HP
   */
  async showFirstKnockToday(
    consecutiveDays: number,
    hp: number
  ): Promise<void> {
    try {
      let message = t('hpIncreased', String(hp));
      
      if (consecutiveDays > 1) {
        message += '\n' + t('consecutiveDays', String(consecutiveDays));
      }

      await chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: t('notificationFirstKnockTitle'),
        message,
        priority: 0,
      });

      console.log('[NotificationService] First knock notification shown');
    } catch (error) {
      console.error('[NotificationService] Error showing first knock notification:', error);
    }
  }

  /**
   * 清除所有通知
   */
  async clearAll(): Promise<void> {
    try {
      const notifications = await chrome.notifications.getAll();
      const notificationIds = Object.keys(notifications);
      
      for (const id of notificationIds) {
        await chrome.notifications.clear(id);
      }
      
      console.log('[NotificationService] All notifications cleared');
    } catch (error) {
      console.error('[NotificationService] Error clearing notifications:', error);
    }
  }
}
