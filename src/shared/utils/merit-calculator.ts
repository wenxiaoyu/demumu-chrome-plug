/**
 * 功德值计算工具
 * 
 * 功德累计算法设计：
 * 1. 基础功德：每次敲击有基础功德值
 * 2. 连击加成：短时间内连续敲击有额外加成
 * 3. 连续天数加成：连续打卡天数越多，功德加成越高
 * 4. 每日首次加成：每天第一次敲击有额外奖励
 * 5. 里程碑奖励：达到特定总敲击次数时获得大额功德
 */

/**
 * 功德配置
 */
export const MERIT_CALCULATION = {
  BASE: 1, // 基础功德值
  FIRST_KNOCK_BONUS: 5, // 每日首次敲击额外奖励
  COMBO_WINDOW: 3000, // 连击时间窗口（3秒）
  COMBO_BONUS: 1, // 连击额外加成
  MAX_COMBO_BONUS: 5, // 最大连击加成
  STREAK_BONUS_PER_DAY: 0.5, // 每连续一天增加的功德加成
  MAX_STREAK_BONUS: 10, // 最大连续天数加成
  MILESTONES: [
    { knocks: 10, merit: 10 },
    { knocks: 50, merit: 50 },
    { knocks: 100, merit: 100 },
    { knocks: 500, merit: 500 },
    { knocks: 1000, merit: 1000 },
    { knocks: 5000, merit: 5000 },
  ],
} as const;

/**
 * 计算连击加成
 * @param lastKnockTime 上次敲击时间
 * @param currentTime 当前时间
 * @param currentCombo 当前连击数
 * @returns 新的连击数和连击加成
 */
export function calculateComboBonus(
  lastKnockTime: number,
  currentTime: number,
  currentCombo: number
): { combo: number; bonus: number } {
  const timeDiff = currentTime - lastKnockTime;
  
  // 如果在连击窗口内，增加连击数
  if (timeDiff <= MERIT_CALCULATION.COMBO_WINDOW) {
    const newCombo = currentCombo + 1;
    const bonus = Math.min(
      newCombo * MERIT_CALCULATION.COMBO_BONUS,
      MERIT_CALCULATION.MAX_COMBO_BONUS
    );
    return { combo: newCombo, bonus };
  }
  
  // 超出窗口，重置连击
  return { combo: 0, bonus: 0 };
}

/**
 * 计算连续天数加成
 * @param consecutiveDays 连续天数
 * @returns 连续天数加成
 */
export function calculateStreakBonus(consecutiveDays: number): number {
  const bonus = consecutiveDays * MERIT_CALCULATION.STREAK_BONUS_PER_DAY;
  return Math.min(bonus, MERIT_CALCULATION.MAX_STREAK_BONUS);
}

/**
 * 检查是否达到里程碑
 * @param previousTotal 之前的总敲击次数
 * @param newTotal 新的总敲击次数
 * @returns 里程碑奖励功德值
 */
export function checkMilestone(previousTotal: number, newTotal: number): number {
  let milestoneReward = 0;
  
  for (const milestone of MERIT_CALCULATION.MILESTONES) {
    // 如果刚好跨越了这个里程碑
    if (previousTotal < milestone.knocks && newTotal >= milestone.knocks) {
      milestoneReward += milestone.merit;
    }
  }
  
  return milestoneReward;
}

/**
 * 计算本次敲击获得的功德值
 * @param isFirstKnockToday 是否为今日首次敲击
 * @param consecutiveDays 连续天数
 * @param lastKnockTime 上次敲击时间
 * @param currentTime 当前时间
 * @param currentCombo 当前连击数
 * @param previousTotal 之前的总敲击次数
 * @returns 功德值和新的连击数
 */
export function calculateMeritGain(
  isFirstKnockToday: boolean,
  consecutiveDays: number,
  lastKnockTime: number,
  currentTime: number,
  currentCombo: number,
  previousTotal: number
): { merit: number; combo: number } {
  // 基础功德
  let totalMerit = MERIT_CALCULATION.BASE;
  
  // 每日首次加成
  if (isFirstKnockToday) {
    totalMerit += MERIT_CALCULATION.FIRST_KNOCK_BONUS;
  }
  
  // 连击加成
  const { combo, bonus: comboBonus } = calculateComboBonus(
    lastKnockTime,
    currentTime,
    currentCombo
  );
  totalMerit += comboBonus;
  
  // 连续天数加成
  const streakBonus = calculateStreakBonus(consecutiveDays);
  totalMerit += streakBonus;
  
  // 里程碑奖励
  const milestoneReward = checkMilestone(previousTotal, previousTotal + 1);
  totalMerit += milestoneReward;
  
  return {
    merit: Math.floor(totalMerit),
    combo,
  };
}

/**
 * 获取功德值描述
 * @param merit 功德值
 * @returns 功德等级描述
 */
export function getMeritLevel(merit: number): string {
  if (merit >= 10000) return '功德圆满';
  if (merit >= 5000) return '大德高僧';
  if (merit >= 1000) return '修行有成';
  if (merit >= 500) return '虔诚信徒';
  if (merit >= 100) return '初窥门径';
  if (merit >= 10) return '初学者';
  return '新手';
}
