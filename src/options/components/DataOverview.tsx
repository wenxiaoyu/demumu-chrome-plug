import { useState, useEffect } from 'react';
import { storage } from '../../shared/storage';
import { STORAGE_KEYS } from '../../shared/constants';
import { StatsService } from '../../background/services/stats-service';
import type { UserData, DailyStats } from '../../shared/types';
import './DataOverview.css';

interface OverviewData {
  totalMerit: number;
  totalKnocks: number;
  consecutiveDays: number;
  avgKnocksPerDay: number;
  aliveDays: number;
  maxConsecutiveDays: number;
}

/**
 * 计算数据总览指标
 */
function calculateOverview(
  userData: UserData,
  stats: DailyStats[]
): OverviewData {
  // 计算存活天数
  const aliveDays = Math.floor(
    (Date.now() - userData.createdAt) / (1000 * 60 * 60 * 24)
  );

  // 计算平均每日敲击
  const avgKnocksPerDay =
    aliveDays > 0 ? Math.round(userData.totalKnocks / aliveDays) : 0;

  // 计算最长连续活跃天数
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  const sortedStats = [...stats].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sortedStats.length; i++) {
    if (sortedStats[i].knocks > 0) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }

  return {
    totalMerit: userData.merit,
    totalKnocks: userData.totalKnocks,
    consecutiveDays: userData.consecutiveDays,
    avgKnocksPerDay,
    aliveDays,
    maxConsecutiveDays: Math.max(maxConsecutive, userData.consecutiveDays),
  };
}

/**
 * 格式化数字（添加千位分隔符）
 */
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString('zh-CN');
}

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
}

/**
 * 指标卡片组件
 */
function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

/**
 * 数据总览组件
 */
export function DataOverview() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverviewData() {
      setLoading(true);
      try {
        // 获取用户数据
        const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
        if (!userData) {
          throw new Error('User data not found');
        }

        // 获取所有统计数据
        const stats = await StatsService.getDailyStats(365);

        // 计算总览数据
        const data = calculateOverview(userData, stats);
        setOverview(data);
      } catch (error) {
        console.error('[DataOverview] Failed to load overview data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="overview-container">
        <div className="overview-loading">加载中...</div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="overview-container">
        <div className="overview-error">数据加载失败</div>
      </div>
    );
  }

  return (
    <div className="overview-container">
      <h2 className="overview-title">数据总览</h2>

      <div className="metrics-grid">
        <MetricCard
          icon="🙏"
          label="总功德值"
          value={formatNumber(overview.totalMerit)}
        />
        <MetricCard
          icon="🪵"
          label="总敲击次数"
          value={formatNumber(overview.totalKnocks)}
        />
        <MetricCard
          icon="🔥"
          label="连续活跃"
          value={`${overview.consecutiveDays} 天`}
        />
        <MetricCard
          icon="💯"
          label="平均每日"
          value={`${overview.avgKnocksPerDay} 次`}
        />
        <MetricCard
          icon="📅"
          label="存活天数"
          value={`${overview.aliveDays} 天`}
        />
        <MetricCard
          icon="🏆"
          label="最长连续"
          value={`${overview.maxConsecutiveDays} 天`}
        />
      </div>
    </div>
  );
}
