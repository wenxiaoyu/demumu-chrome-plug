import { storage } from '../../shared/storage';
import { STORAGE_KEYS, DEFAULT_DEATH_DETECTION_CONFIG } from '../../shared/constants';
import type { DeathDetectionConfig, DeathStatus, UserData, EmailTemplateVariables } from '../../shared/types';
import { formatDate } from '../../shared/utils/date';
import { emailService } from './email-service';
import { t } from '../../shared/utils/i18n';

/**
 * 死亡检测服务
 * 负责检测用户是否长时间未活跃，判断"死亡"状态
 */
class DeathDetectionService {
  /**
   * 获取死亡检测配置
   */
  async getConfig(): Promise<DeathDetectionConfig> {
    const config = await storage.get<DeathDetectionConfig>(STORAGE_KEYS.DEATH_DETECTION_CONFIG);
    return config || DEFAULT_DEATH_DETECTION_CONFIG;
  }

  /**
   * 更新死亡检测配置
   */
  async updateConfig(updates: Partial<DeathDetectionConfig>): Promise<DeathDetectionConfig> {
    const config = await this.getConfig();
    const newConfig = { ...config, ...updates };
    await storage.set(STORAGE_KEYS.DEATH_DETECTION_CONFIG, newConfig);
    return newConfig;
  }

  /**
   * 计算未活跃天数
   */
  calculateInactiveDays(lastActiveTime: number): number {
    const now = Date.now();
    const diffMs = now - lastActiveTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * 获取最后活跃日期字符串
   */
  getLastActiveDate(lastActiveTime: number): string {
    return formatDate(lastActiveTime, 'YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 判断是否"死亡"
   */
  async isDead(userData: UserData): Promise<{ isDead: boolean; reason: string; reasonKey: string; reasonParams?: string[] }> {
    const config = await this.getConfig();

    // 如果未启用检测，返回 false
    if (!config.enabled) {
      return { 
        isDead: false, 
        reason: t('reason_detectionDisabled'),
        reasonKey: 'reason_detectionDisabled'
      };
    }

    // 检查 HP 是否低于阈值
    if (userData.hp <= config.hpThreshold) {
      const params = [String(userData.hp), String(config.hpThreshold)];
      return { 
        isDead: true, 
        reason: t('reason_hpBelowThreshold', params),
        reasonKey: 'reason_hpBelowThreshold',
        reasonParams: params
      };
    }

    // 检查未活跃天数
    const inactiveDays = this.calculateInactiveDays(userData.lastKnockTime);
    if (inactiveDays >= config.inactivityThreshold) {
      const params = [String(inactiveDays), String(config.inactivityThreshold)];
      return { 
        isDead: true, 
        reason: t('reason_inactivityExceeded', params),
        reasonKey: 'reason_inactivityExceeded',
        reasonParams: params
      };
    }

    return { 
      isDead: false, 
      reason: t('statusNormal'),
      reasonKey: 'statusNormal'
    };
  }

  /**
   * 检查死亡状态
   */
  async checkDeathStatus(): Promise<DeathStatus | null> {
    try {
      // 获取用户数据
      const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
      if (!userData) {
        console.log('[DeathDetection] No user data found');
        return null;
      }

      // 判断是否死亡
      const { isDead, reason, reasonKey, reasonParams } = await this.isDead(userData);
      
      const inactiveDays = this.calculateInactiveDays(userData.lastKnockTime);
      const lastActiveDate = this.getLastActiveDate(userData.lastKnockTime);

      const deathStatus: DeathStatus = {
        isDead,
        reason,
        reasonKey,
        reasonParams,
        inactiveDays,
        lastActiveDate,
        detectedAt: Date.now(),
        notificationSent: false,
      };

      // 保存死亡状态
      await storage.set(STORAGE_KEYS.DEATH_STATUS, deathStatus);

      console.log('[DeathDetection] Status checked:', deathStatus);
      return deathStatus;
    } catch (error) {
      console.error('[DeathDetection] Error checking status:', error);
      return null;
    }
  }

  /**
   * 获取当前死亡状态
   */
  async getCurrentStatus(): Promise<DeathStatus | null> {
    return await storage.get<DeathStatus>(STORAGE_KEYS.DEATH_STATUS);
  }

  /**
   * 标记通知已发送
   */
  async markNotificationSent(): Promise<void> {
    const status = await this.getCurrentStatus();
    if (status) {
      status.notificationSent = true;
      await storage.set(STORAGE_KEYS.DEATH_STATUS, status);
    }
  }

  /**
   * 标记邮件已发送
   */
  async markEmailSent(): Promise<void> {
    const status = await this.getCurrentStatus();
    if (status) {
      // 添加邮件发送标记（扩展 DeathStatus 接口）
      await storage.set(STORAGE_KEYS.DEATH_STATUS, {
        ...status,
        emailSent: true,
        emailSentAt: Date.now(),
      });
    }
  }

  /**
   * 准备邮件模板变量
   */
  async prepareEmailVariables(userData: UserData): Promise<EmailTemplateVariables> {
    const inactiveDays = this.calculateInactiveDays(userData.lastKnockTime);
    const lastActiveDate = this.getLastActiveDate(userData.lastKnockTime);
    const currentDate = formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss');

    // 获取用户显示名称
    let userName = '用户'; // 默认值
    
    try {
      const { authService } = await import('../../shared/services/auth-service');
      const currentUser = authService.getCurrentUser();
      
      if (currentUser && currentUser.idToken) {
        // 尝试从 Firestore 获取自定义显示名称
        try {
          const { firestoreService } = await import('../../shared/services/firestore-service');
          const firestoreUserData = await firestoreService.getUserData(currentUser.uid, currentUser.idToken);
          
          if (firestoreUserData?.displayName) {
            userName = firestoreUserData.displayName;
          } else if (currentUser.displayName) {
            userName = currentUser.displayName;
          } else if (currentUser.email) {
            userName = currentUser.email.split('@')[0];
          }
        } catch (error) {
          console.error('[DeathDetection] Failed to load display name from Firestore:', error);
          // 使用 Google 账号名称作为后备
          if (currentUser.displayName) {
            userName = currentUser.displayName;
          } else if (currentUser.email) {
            userName = currentUser.email.split('@')[0];
          }
        }
      }
    } catch (error) {
      console.error('[DeathDetection] Failed to load user info:', error);
    }

    console.log('[DeathDetection] Using userName for email:', userName);

    return {
      userName,
      inactiveDays,
      lastActiveDate,
      currentDate,
      merit: userData.merit,
      hp: userData.hp,
    };
  }

  /**
   * 触发邮件发送（需要用户确认）
   * 
   * @returns 是否成功触发邮件发送
   */
  async triggerEmailSend(): Promise<boolean> {
    try {
      // 获取用户数据
      const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
      if (!userData) {
        console.error('[DeathDetection] No user data found');
        return false;
      }

      // 准备邮件变量
      const variables = await this.prepareEmailVariables(userData);

      // 发送邮件（会打开 mailto 链接）
      await emailService.sendToContacts(variables);

      // 标记邮件已发送
      await this.markEmailSent();

      console.log('[DeathDetection] Email triggered successfully');
      return true;
    } catch (error) {
      console.error('[DeathDetection] Error triggering email:', error);
      return false;
    }
  }

  /**
   * 重置死亡状态（用户恢复活跃后）
   */
  async resetStatus(): Promise<void> {
    await storage.remove(STORAGE_KEYS.DEATH_STATUS);
    console.log('[DeathDetection] Status reset');
  }
}

// 导出单例
export const deathDetectionService = new DeathDetectionService();
