import { HP_CONFIG, HP_THRESHOLDS } from '../constants';
import { HPStatus } from '../types';
import { getDaysDiff } from './date';

/**
 * 计算当前 HP
 * 基于最后敲击时间和当前 HP 计算实际 HP
 */
export function calculateCurrentHP(
  lastKnockTime: number,
  currentHP: number,
  now: number
): number {
  // 如果从未敲击过，返回初始 HP
  if (lastKnockTime === 0) {
    return HP_CONFIG.INITIAL;
  }

  // 计算天数差
  const daysDiff = getDaysDiff(lastKnockTime, now);

  // 如果是同一天或时间倒退（负数），返回当前 HP
  // 时间倒退可能是用户修改了系统时间
  if (daysDiff <= 0) {
    return currentHP;
  }

  // 计算惩罚（只有当时间向前时才惩罚）
  const penalty = daysDiff * HP_CONFIG.DAILY_PENALTY;
  const newHP = currentHP - penalty;

  // 确保 HP 不低于最小值
  return Math.max(HP_CONFIG.MIN, newHP);
}

/**
 * 计算敲击奖励
 * 今日首次敲击奖励 HP
 */
export function calculateKnockReward(
  currentHP: number,
  isFirstKnockToday: boolean
): number {
  if (!isFirstKnockToday) {
    return currentHP;
  }

  const newHP = currentHP + HP_CONFIG.FIRST_KNOCK_REWARD;
  
  // 确保 HP 不超过最大值
  return Math.min(HP_CONFIG.MAX, newHP);
}

/**
 * 获取 HP 颜色
 */
export function getHPColor(hp: number): string {
  if (hp > HP_THRESHOLDS.HEALTHY) {
    return '#239a3b'; // 绿色 - 健康
  } else if (hp > HP_THRESHOLDS.WARNING) {
    return '#f59e0b'; // 黄色 - 警告
  } else {
    return '#ef4444'; // 红色 - 危险
  }
}

/**
 * 获取 HP 状态
 */
export function getHPStatus(hp: number): HPStatus {
  if (hp > HP_THRESHOLDS.HEALTHY) {
    return 'healthy';
  } else if (hp > HP_THRESHOLDS.WARNING) {
    return 'warning';
  } else {
    return 'critical';
  }
}
