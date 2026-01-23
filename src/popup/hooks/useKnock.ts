import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../shared/storage';
import { STORAGE_KEYS, HP_CONFIG } from '../../shared/constants';
import { UserData } from '../../shared/types';
import { generateUserId } from '../../shared/utils/id-generator';
import { isSameDay, calculateConsecutiveDays } from '../../shared/utils/date';
import { calculateCurrentHP, calculateKnockReward } from '../../shared/utils/hp-calculator';
import { calculateMeritGain } from '../../shared/utils/merit-calculator';
import { KnockService } from '../../background/services/knock-service';
import { StatsService } from '../../background/services/stats-service';

/**
 * 初始化用户数据
 */
function initializeUserData(): UserData {
  const now = Date.now();
  return {
    userId: generateUserId(),
    lastKnockTime: 0,
    todayKnocks: 0,
    totalKnocks: 0,
    merit: 0,
    consecutiveDays: 0,
    combo: 0,
    hp: HP_CONFIG.INITIAL,
    status: 'alive',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 敲木鱼 Hook
 */
export function useKnock() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载用户数据
  useEffect(() => {
    async function loadUserData() {
      try {
        let data = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
        
        // 如果没有数据，初始化
        if (!data) {
          data = initializeUserData();
          await storage.set(STORAGE_KEYS.USER_DATA, data);
        } else {
          // 计算当前实际 HP（考虑时间惩罚）
          const now = Date.now();
          const actualHP = calculateCurrentHP(data.lastKnockTime, data.hp, now);
          
          // 检查是否跨日（需要重置今日敲击次数）
          const isToday = isSameDay(data.lastKnockTime, now);
          const needsReset = !isToday && data.lastKnockTime > 0;
          
          console.log('[useKnock] Load check:', {
            lastKnockTime: new Date(data.lastKnockTime).toISOString(),
            now: new Date(now).toISOString(),
            isToday,
            needsReset,
            currentTodayKnocks: data.todayKnocks,
            currentHP: data.hp,
          });
          
          // 如果 HP 有变化或需要重置今日敲击，更新数据
          if (actualHP !== data.hp || needsReset) {
            console.log('[useKnock] Updating data on load:', {
              oldHP: data.hp,
              newHP: actualHP,
              oldTodayKnocks: data.todayKnocks,
              newTodayKnocks: needsReset ? 0 : data.todayKnocks,
              needsReset,
            });
            
            data = {
              ...data,
              hp: actualHP,
              status: actualHP > 0 ? 'alive' : 'dead',
              todayKnocks: needsReset ? 0 : data.todayKnocks, // 跨日重置
              updatedAt: now, // 更新时间戳
            };
            await storage.set(STORAGE_KEYS.USER_DATA, data);
            
            if (needsReset) {
              console.log('[useKnock] Day changed, reset todayKnocks to 0');
            }
          }
        }
        
        setUserData(data);
      } catch (error) {
        console.error('[useKnock] Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  // 敲木鱼
  const knock = useCallback(async () => {
    if (!userData) return;

    try {
      const now = Date.now();
      
      // 检查是否跨天
      const isToday = isSameDay(userData.lastKnockTime, now);
      const isFirstKnockToday = !isToday;
      
      // 计算连续天数
      const consecutiveDays = calculateConsecutiveDays(
        userData.lastKnockTime,
        now,
        userData.consecutiveDays
      );
      
      // 计算当前 HP（考虑时间惩罚）
      let currentHP = calculateCurrentHP(userData.lastKnockTime, userData.hp, now);
      
      console.log('[useKnock] HP calculation:', {
        storedHP: userData.hp,
        calculatedHP: currentHP,
        isFirstKnockToday,
        lastKnockTime: new Date(userData.lastKnockTime).toISOString(),
        now: new Date(now).toISOString(),
      });
      
      // 计算敲击奖励
      const hpBeforeReward = currentHP;
      currentHP = calculateKnockReward(currentHP, isFirstKnockToday);
      
      console.log('[useKnock] HP reward:', {
        before: hpBeforeReward,
        after: currentHP,
        reward: currentHP - hpBeforeReward,
      });
      
      // 更新状态
      const status = currentHP > 0 ? 'alive' : 'dead';
      
      // 计算功德值增加（使用新算法）
      const { merit: meritGain, combo: newCombo } = calculateMeritGain(
        isFirstKnockToday,
        consecutiveDays,
        userData.lastKnockTime,
        now,
        userData.combo,
        userData.totalKnocks
      );
      
      // 更新数据
      const updatedData: UserData = {
        ...userData,
        lastKnockTime: now,
        todayKnocks: isFirstKnockToday ? 1 : userData.todayKnocks + 1,
        totalKnocks: userData.totalKnocks + 1,
        merit: userData.merit + meritGain,
        consecutiveDays,
        combo: newCombo,
        hp: currentHP,
        status,
        updatedAt: now,
      };

      // 保存到存储
      await storage.set(STORAGE_KEYS.USER_DATA, updatedData);
      
      // 保存敲击记录
      try {
        await KnockService.saveKnockRecord(updatedData);
      } catch (error) {
        console.warn('[useKnock] Failed to save knock record:', error);
      }
      
      // 更新每日统计
      try {
        await StatsService.updateDailyStats(updatedData);
      } catch (error) {
        console.warn('[useKnock] Failed to update daily stats:', error);
      }
      
      // 更新状态
      setUserData(updatedData);
      
      // 通知 background 更新 Badge
      try {
        await chrome.runtime.sendMessage({ 
          type: 'KNOCK_COMPLETED',
          data: {
            isFirstKnockToday,
            consecutiveDays,
            hp: currentHP,
            todayKnocks: updatedData.todayKnocks,
          }
        });
      } catch (error) {
        console.warn('[useKnock] Failed to notify background:', error);
      }
      
      console.log('[useKnock] Knock successful:', {
        isFirstKnockToday,
        consecutiveDays,
        meritGain,
        totalMerit: updatedData.merit,
        combo: newCombo,
        hp: currentHP,
        status,
        todayKnocks: updatedData.todayKnocks,
        totalKnocks: updatedData.totalKnocks,
      });
    } catch (error) {
      console.error('[useKnock] Error knocking:', error);
    }
  }, [userData]);

  return {
    userData,
    loading,
    knock,
  };
}

