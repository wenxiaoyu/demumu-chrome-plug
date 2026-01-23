/**
 * 日期工具函数
 */

/**
 * 判断两个时间戳是否在同一天
 */
export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 获取某个时间戳当天的开始时间（00:00:00）
 */
export function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * 计算两个时间戳之间相差的天数
 */
export function getDaysDiff(timestamp1: number, timestamp2: number): number {
  const start = getStartOfDay(timestamp1);
  const end = getStartOfDay(timestamp2);
  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(timestamp: number, format: string = 'YYYY-MM-DD'): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 计算连续活跃天数
 */
export function calculateConsecutiveDays(
  lastKnockTime: number,
  now: number,
  currentConsecutiveDays: number
): number {
  // 如果从未敲击过
  if (lastKnockTime === 0) {
    return 1;
  }
  
  const daysDiff = getDaysDiff(lastKnockTime, now);
  
  // 同一天
  if (daysDiff === 0) {
    return currentConsecutiveDays;
  }
  
  // 连续（昨天敲击过）
  if (daysDiff === 1) {
    return currentConsecutiveDays + 1;
  }
  
  // 断活（超过 1 天未敲击）
  return 1;
}

/**
 * 获取指定月份的天数
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns 该月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 获取指定月份第一天是星期几
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns 星期几 (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * 检查指定日期是否是今天
 * @param dateString 日期字符串 (YYYY-MM-DD)
 * @returns 是否是今天
 */
export function isToday(dateString: string): boolean {
  const today = formatDate(Date.now(), 'YYYY-MM-DD');
  return dateString === today;
}
