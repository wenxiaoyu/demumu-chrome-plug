import { storage } from '../../shared/storage';
import { STORAGE_KEYS } from '../../shared/constants';
import type { UserData, KnockRecord } from '../../shared/types';
import { generateRecordId } from '../../shared/utils/id-generator';
import { syncService } from '../../shared/services/sync-service';
import { authService } from '../../shared/services/auth-service';

/**
 * 敲击记录服务
 * 负责保存和查询敲击历史记录
 */
export class KnockService {
  /**
   * 最大记录数量限制（365 天 × 100 次/天）
   */
  private static readonly MAX_RECORDS = 365 * 100;

  /**
   * 保存敲击记录
   * @param userData 当前用户数据
   */
  static async saveKnockRecord(userData: UserData): Promise<void> {
    try {
      // 创建新记录
      const record: KnockRecord = {
        id: generateRecordId(),
        timestamp: Date.now(),
        merit: 1, // 每次敲击获得 1 功德
        totalMerit: userData.merit,
        hp: userData.hp,
        consecutiveDays: userData.consecutiveDays,
      };

      // 获取现有记录
      const history =
        (await storage.get<KnockRecord[]>(STORAGE_KEYS.KNOCK_HISTORY)) || [];

      // 添加新记录
      history.push(record);

      // 限制记录数量，删除最旧的记录
      if (history.length > this.MAX_RECORDS) {
        history.splice(0, history.length - this.MAX_RECORDS);
      }

      // 保存到存储
      await storage.set(STORAGE_KEYS.KNOCK_HISTORY, history);

      // 如果已登录，标记记录为待同步
      if (authService.isSignedIn()) {
        await syncService.markKnockRecordForSync(record);
      }
    } catch (error) {
      console.error('[KnockService] Failed to save knock record:', error);
      throw error;
    }
  }

  /**
   * 获取最近 N 天的敲击记录
   * @param days 天数
   * @returns 敲击记录数组，按时间升序排列
   */
  static async getKnockHistory(days: number): Promise<KnockRecord[]> {
    try {
      const history =
        (await storage.get<KnockRecord[]>(STORAGE_KEYS.KNOCK_HISTORY)) || [];

      // 计算截止时间戳
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

      // 过滤并返回最近 N 天的记录
      return history
        .filter((record) => record.timestamp >= cutoffTime)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('[KnockService] Failed to get knock history:', error);
      return [];
    }
  }

  /**
   * 获取指定日期的敲击记录
   * @param date 日期字符串 (YYYY-MM-DD)
   * @returns 该日期的敲击记录数组
   */
  static async getKnockRecordsByDate(date: string): Promise<KnockRecord[]> {
    try {
      const history =
        (await storage.get<KnockRecord[]>(STORAGE_KEYS.KNOCK_HISTORY)) || [];

      // 解析日期范围（当天 00:00:00 到 23:59:59）
      const [year, month, day] = date.split('-').map(Number);
      const startTime = new Date(year, month - 1, day, 0, 0, 0).getTime();
      const endTime = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();

      // 过滤该日期的记录
      return history
        .filter(
          (record) =>
            record.timestamp >= startTime && record.timestamp <= endTime
        )
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('[KnockService] Failed to get records by date:', error);
      return [];
    }
  }
}
