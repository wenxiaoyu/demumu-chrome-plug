import { useState, useEffect } from 'react';
import { storage } from '../../shared/storage';
import { STORAGE_KEYS } from '../../shared/constants';
import { StatsService } from '../../background/services/stats-service';
import type { UserData, DailyStats } from '../../shared/types';
import { t, formatNumber } from '../../shared/utils/i18n';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
} from '../../shared/utils/date';
import './StatsPage.css';

interface CalendarDay {
  date: string;
  knocks: number;
  color: string;
  isToday: boolean;
}

interface KeyMetrics {
  totalMerit: number;
  consecutiveDays: number;
  aliveDays: number;
}

/**
 * 根据敲击次数获取颜色
 */
function getColorByKnocks(knocks: number): string {
  if (knocks === 0) return '#eee';
  if (knocks <= 10) return '#c6e48b';
  if (knocks <= 30) return '#7bc96f';
  return '#239a3b';
}

/**
 * 生成日历数据
 */
function generateCalendarData(
  year: number,
  month: number,
  stats: DailyStats[]
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  const statsMap = new Map(stats.map((s) => [s.date, s]));

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const stat = statsMap.get(date);
    const knocks = stat?.knocks || 0;

    days.push({
      date,
      knocks,
      color: getColorByKnocks(knocks),
      isToday: isToday(date),
    });
  }

  return days;
}

/**
 * 计算关键指标
 */
function calculateKeyMetrics(userData: UserData): KeyMetrics {
  const aliveDays = Math.floor(
    (Date.now() - userData.createdAt) / (1000 * 60 * 60 * 24)
  );

  return {
    totalMerit: userData.merit,
    consecutiveDays: userData.consecutiveDays,
    aliveDays,
  };
}

/**
 * 格式化数字
 */
function formatNumberLocal(num: number): string {
  return formatNumber(num);
}

/**
 * 统计页面组件（合并了关键指标和日历）
 */
export function StatsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 加载数据
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 获取用户数据
        const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
        if (!userData) {
          throw new Error('User data not found');
        }

        // 计算关键指标
        const keyMetrics = calculateKeyMetrics(userData);
        setMetrics(keyMetrics);

        // 获取日历数据
        const stats = await StatsService.getMonthlyStats(year, month);
        const data = generateCalendarData(year, month, stats);
        setCalendarData(data);
      } catch (error) {
        console.error('[StatsPage] Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [year, month]);

  // 上一月
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  // 下一月
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // 获取月份第一天是星期几
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  // 星期标题
  const weekDays = [
    t('stats_sunday'),
    t('stats_monday'),
    t('stats_tuesday'),
    t('stats_wednesday'),
    t('stats_thursday'),
    t('stats_friday'),
    t('stats_saturday')
  ];

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">{t('loading')}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="stats-page">
        <div className="stats-error">{t('dataLoadError')}</div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      {/* 关键指标卡片 */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-icon">🙏</div>
          <div className="metric-value">{formatNumberLocal(metrics.totalMerit)}</div>
          <div className="metric-label">{t('stats_totalMerit')}</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-value">{formatNumberLocal(metrics.consecutiveDays)}</div>
          <div className="metric-label">{t('stats_consecutiveDays')}</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-value">{formatNumberLocal(metrics.aliveDays)}</div>
          <div className="metric-label">{t('stats_aliveDays')}</div>
        </div>
      </div>

      {/* 活跃日历 */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button
            className="month-nav-button"
            onClick={handlePrevMonth}
            aria-label={t('stats_prevMonth')}
          >
            ‹
          </button>
          <h2 className="calendar-title">
            {year} {t('stats_year')} {month} {t('stats_month')}
          </h2>
          <button
            className="month-nav-button"
            onClick={handleNextMonth}
            aria-label={t('stats_nextMonth')}
          >
            ›
          </button>
        </div>

        <div className="calendar-grid">
          {/* 星期标题 */}
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {/* 空白占位 */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty" />
          ))}

          {/* 日期格子 */}
          {calendarData.map((day) => (
            <div
              key={day.date}
              className={`calendar-day ${day.isToday ? 'today' : ''}`}
              style={{ backgroundColor: day.color }}
              title={`${day.date}\n敲击次数: ${day.knocks}`}
            >
              <span className="day-number">
                {parseInt(day.date.split('-')[2])}
              </span>
              {day.knocks > 0 && (
                <span className="day-knocks">{day.knocks}</span>
              )}
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="calendar-legend">
          <span className="legend-label">{t('stats_knockCount')}：</span>
          <div className="legend-items">
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: '#eee' }}
              />
              <span>{t('stats_noKnocks')}</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: '#c6e48b' }}
              />
              <span>1-10</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: '#7bc96f' }}
              />
              <span>11-30</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: '#239a3b' }}
              />
              <span>31+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
