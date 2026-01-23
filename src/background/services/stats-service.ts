import { storage } from '../../shared/storage';
import { STORAGE_KEYS } from '../../shared/constants';
import type { UserData, DailyStats } from '../../shared/types';
import { formatDate } from '../../shared/utils/date';
import { syncService } from '../../shared/services/sync-service';
import { authService } from '../../shared/services/auth-service';

/**
 * 统计服务
 * 负责管理每日统计数据
 */
export class StatsService {
  /**
   * 最大保存天数
   */
  private static readonly MAX_DAYS = 365;

  /**
   * 更新每日统计
   * @param userData 当前用户数据
   */
  static async updateDailyStats(userData: UserData): Promise<void> {
    try {
      const today = formatDate(Date.now(), 'YYYY-MM-DD');

      // 获取现有统计数据
      const stats =
        (await storage.get<Record<string, DailyStats>>(
          STORAGE_KEYS.DAILY_STATS
        )) || {};

      // 如果今天的记录不存在，创建新记录
      if (!stats[today]) {
        stats[today] = {
          date: today,
          knocks: 0,
          merit: 0,
          hp: userData.hp,
        };
      }

      // 更新今天的统计
      stats[today].knocks += 1;
      stats[today].merit += 1; // 每次敲击获得 1 功德
      stats[today].hp = userData.hp; // 更新当前 HP

      // 清理旧数据（超过 365 天）
      const cutoffDate = formatDate(
        Date.now() - this.MAX_DAYS * 24 * 60 * 60 * 1000,
        'YYYY-MM-DD'
      );

      Object.keys(stats).forEach((date) => {
        if (date < cutoffDate) {
          delete stats[date];
        }
      });

      // 保存到存储
      await storage.set(STORAGE_KEYS.DAILY_STATS, stats);

      // 如果已登录，标记统计为待同步
      if (authService.isSignedIn()) {
        await syncService.markDailyStatsForSync(stats[today]);
      }
    } catch (error) {
      console.error('[StatsService] Failed to update daily stats:', error);
      throw error;
    }
  }

  /**
   * 获取最近 N 天的统计数据
   * @param days 天数
   * @returns 统计数据数组，按日期升序排列
   */
  static async getDailyStats(days: number): Promise<DailyStats[]> {
    try {
      const stats =
        (await storage.get<Record<string, DailyStats>>(
          STORAGE_KEYS.DAILY_STATS
        )) || {};

      // 计算截止日期
      const cutoffDate = formatDate(
        Date.now() - days * 24 * 60 * 60 * 1000,
        'YYYY-MM-DD'
      );

      // 过滤并排序
      return Object.values(stats)
        .filter((stat) => stat.date >= cutoffDate)
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('[StatsService] Failed to get daily stats:', error);
      return [];
    }
  }

  /**
   * 获取指定月份的统计数据
   * @param year 年份
   * @param month 月份 (1-12)
   * @returns 该月的统计数据数组
   */
  static async getMonthlyStats(
    year: number,
    month: number
  ): Promise<DailyStats[]> {
    try {
      const stats =
        (await storage.get<Record<string, DailyStats>>(
          STORAGE_KEYS.DAILY_STATS
        )) || {};

      // 构建月份前缀 (YYYY-MM)
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

      // 过滤该月的数据
      return Object.values(stats)
        .filter((stat) => stat.date.startsWith(monthPrefix))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('[StatsService] Failed to get monthly stats:', error);
      return [];
    }
  }
}
