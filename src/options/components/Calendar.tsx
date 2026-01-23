import { useState, useEffect } from 'react';
import { StatsService } from '../../background/services/stats-service';
import type { DailyStats } from '../../shared/types';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
} from '../../shared/utils/date';
import './Calendar.css';

interface CalendarDay {
  date: string; // YYYY-MM-DD
  knocks: number;
  color: string;
  isToday: boolean;
}

/**
 * 根据敲击次数获取颜色
 */
function getColorByKnocks(knocks: number): string {
  if (knocks === 0) return '#eee'; // 未敲击
  if (knocks <= 10) return '#c6e48b'; // 敲击少
  if (knocks <= 30) return '#7bc96f'; // 敲击中
  return '#239a3b'; // 敲击多
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

  // 创建统计数据映射
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
 * 活跃日历组件
 */
export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 加载日历数据
  useEffect(() => {
    async function loadCalendarData() {
      setLoading(true);
      try {
        const stats = await StatsService.getMonthlyStats(year, month);
        const data = generateCalendarData(year, month, stats);
        setCalendarData(data);
      } catch (error) {
        console.error('[Calendar] Failed to load calendar data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCalendarData();
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
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button
          className="month-nav-button"
          onClick={handlePrevMonth}
          aria-label="上一月"
        >
          ‹
        </button>
        <h2 className="calendar-title">
          {year} 年 {month} 月
        </h2>
        <button
          className="month-nav-button"
          onClick={handleNextMonth}
          aria-label="下一月"
        >
          ›
        </button>
      </div>

      {loading ? (
        <div className="calendar-loading">加载中...</div>
      ) : (
        <>
          <div className="calendar-grid">
            {/* 星期标题 */}
            {weekDays.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}

            {/* 空白占位（月初前的空格） */}
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
            <span className="legend-label">敲击次数：</span>
            <div className="legend-items">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: '#eee' }}
                />
                <span>未敲击</span>
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
        </>
      )}
    </div>
  );
}
