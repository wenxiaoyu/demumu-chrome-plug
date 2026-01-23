/**
 * 存储键常量
 */
export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  KNOCK_HISTORY: 'knockHistory',
  DAILY_STATS: 'dailyStats',
  CONTACTS: 'emergencyContacts',
  DEATH_DETECTION_CONFIG: 'deathDetectionConfig',
  DEATH_STATUS: 'deathStatus',
  EMAIL_RECORDS: 'emailRecords',
  LANGUAGE: 'language', // 用户选择的语言
} as const;

/**
 * HP 配置
 */
export const HP_CONFIG = {
  INITIAL: 100, // 初始 HP
  MAX: 100, // 最大 HP
  MIN: 0, // 最小 HP
  FIRST_KNOCK_REWARD: 10, // 每日首次敲击奖励
  DAILY_PENALTY: 10, // 每天未敲击惩罚
} as const;

/**
 * 功德值配置
 */
export const MERIT_CONFIG = {
  PER_KNOCK: 1, // 每次敲击获得的功德值
} as const;

/**
 * 通知配置
 * 注意：Chrome 通知不支持 SVG 图标，需要使用 PNG/JPG
 * 这里使用空字符串，在运行时通过 chrome.runtime.getURL() 获取
 */
export const NOTIFICATION_CONFIG = {
  DEATH_WARNING: {
    title: '💀 你已往生',
    icon: '', // 运行时设置
  },
  HP_WARNING: {
    title: '⚠️ 生命值告急',
    icon: '', // 运行时设置
  },
  FIRST_KNOCK_TODAY: {
    title: '🙏 功德 +1',
    icon: '', // 运行时设置
  },
} as const;

/**
 * HP 状态阈值
 */
export const HP_THRESHOLDS = {
  HEALTHY: 60, // > 60 为健康
  WARNING: 30, // 30-60 为警告
  CRITICAL: 0, // <= 30 为危险
} as const;

/**
 * 死亡检测配置
 */
export const DEATH_DETECTION_CONFIG = {
  DEFAULT_INACTIVITY_THRESHOLD: 7, // 默认未活跃天数阈值（7天）
  DEFAULT_HP_THRESHOLD: 0, // 默认 HP 阈值
  DEFAULT_CHECK_INTERVAL: 60, // 默认检查间隔（60分钟）
  MIN_INACTIVITY_THRESHOLD: 1, // 最小未活跃天数
  MAX_INACTIVITY_THRESHOLD: 3, // 最大未活跃天数
} as const;

/**
 * 联系人配置
 */
export const CONTACT_CONFIG = {
  MAX_CONTACTS: 20, // 最大联系人数量
  MIN_PRIORITY: 1, // 最低优先级
  MAX_PRIORITY: 5, // 最高优先级
  COMMON_RELATIONSHIPS: ['relationship_family', 'relationship_friend', 'relationship_colleague', 'relationship_other'], // 常用关系选项（翻译键）
} as const;

/**
 * 默认联系人数据
 */
export const DEFAULT_CONTACTS_DATA = {
  contacts: [],
  version: 1,
};

/**
 * 默认死亡检测配置
 */
export const DEFAULT_DEATH_DETECTION_CONFIG = {
  enabled: true,
  inactivityThreshold: DEATH_DETECTION_CONFIG.DEFAULT_INACTIVITY_THRESHOLD,
  hpThreshold: DEATH_DETECTION_CONFIG.DEFAULT_HP_THRESHOLD,
  checkInterval: DEATH_DETECTION_CONFIG.DEFAULT_CHECK_INTERVAL,
};
