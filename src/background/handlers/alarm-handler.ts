/**
 * Alarm 处理器
 * 
 * 负责：
 * 1. 创建定时检查任务
 * 2. 处理定时检查事件
 */

import { StatusChecker } from '../services/status-checker';

const ALARM_NAME = 'status-check';
const CHECK_INTERVAL_MINUTES = 60; // 每小时检查一次

const statusChecker = new StatusChecker();

/**
 * 创建定时检查 Alarm
 */
export async function createStatusCheckAlarm(): Promise<void> {
  try {
    // 清除已存在的 alarm
    await chrome.alarms.clear(ALARM_NAME);

    // 创建新的 alarm（每小时触发一次）
    await chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: CHECK_INTERVAL_MINUTES,
      periodInMinutes: CHECK_INTERVAL_MINUTES,
    });

    console.log(`[AlarmHandler] Status check alarm created (every ${CHECK_INTERVAL_MINUTES} minutes)`);
  } catch (error) {
    console.error('[AlarmHandler] Error creating alarm:', error);
  }
}

/**
 * 处理 Alarm 事件
 */
export async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name === ALARM_NAME) {
    console.log('[AlarmHandler] Status check alarm triggered');
    await statusChecker.checkAndUpdate();
  }
}

/**
 * 设置 Alarm 监听器
 */
export function setupAlarmListeners(): void {
  chrome.alarms.onAlarm.addListener(handleAlarm);
  console.log('[AlarmHandler] Alarm listeners set up');
}
