/**
 * 用户数据接口
 */
export interface UserData {
  userId: string // 本地生成的唯一 ID
  displayName?: string // 用户自定义显示名称（用于邮件）
  lastKnockTime: number // 最后敲木鱼时间戳
  todayKnocks: number // 今日敲击次数
  totalKnocks: number // 总敲击次数
  merit: number // 功德值（累计）
  consecutiveDays: number // 连续活跃天数
  combo: number // 当前连击数
  hp: number // 当前生命值 (0-100)
  status: 'alive' | 'dead' // 存活状态
  createdAt: number // 创建时间
  updatedAt: number // 更新时间
}

/**
 * 敲击记录接口
 */
export interface KnockRecord {
  id: string // 记录 ID
  timestamp: number // 敲击时间戳
  merit: number // 本次获得的功德值
  totalMerit: number // 敲击时的总功德值
  hp: number // 敲击时的 HP
  consecutiveDays: number // 敲击时的连续天数
}

/**
 * 每日统计接口
 */
export interface DailyStats {
  date: string // 日期（YYYY-MM-DD）
  knocks: number // 当日敲击次数
  merit: number // 当日获得功德值
  hp: number // 当日结束时的 HP
}

/**
 * 敲击结果接口
 */
export interface KnockResult {
  success: boolean
  message: string
  data?: {
    merit: number
    totalMerit: number
    todayKnocks: number
    consecutiveDays: number
    hp: number
    status: 'alive' | 'dead'
    isFirstKnockToday: boolean
  }
}

/**
 * HP 状态类型
 */
export type HPStatus = 'healthy' | 'warning' | 'critical'
/**
 * 紧急联系人接口
 */
export interface EmergencyContact {
  id: string // 唯一标识
  name: string // 姓名
  email: string // 邮箱地址
  relationship: string // 关系（用于分组，如：家人、朋友、同事等）
  priority: number // 优先级（1-5，1最高）
  createdAt: number // 创建时间
  updatedAt: number // 更新时间
}

/**
 * 联系人数据存储接口
 */
export interface ContactsData {
  contacts: EmergencyContact[]
  version: number
}

/**
 * 死亡检测配置接口
 */
export interface DeathDetectionConfig {
  enabled: boolean // 是否启用检测
  inactivityThreshold: number // 未活跃天数阈值（默认 7 天）
  hpThreshold: number // HP 阈值（默认 0）
  checkInterval: number // 检查间隔（分钟，默认 60）
}

/**
 * 死亡状态接口
 */
export interface DeathStatus {
  isDead: boolean // 是否死亡
  reason: string // 死亡原因（已翻译的文本，保留用于向后兼容）
  reasonKey: string // 死亡原因的翻译键
  reasonParams?: string[] // 翻译参数
  inactiveDays: number // 未活跃天数
  lastActiveDate: string // 最后活跃日期
  detectedAt: number // 检测时间
  notificationSent: boolean // 是否已发送通知
}

/**
 * 邮件模板接口
 */
export interface EmailTemplate {
  subject: string // 邮件主题
  htmlBody: string // HTML 正文
  textBody: string // 纯文本正文
}

/**
 * 多语言邮件模板接口
 */
export interface MultiLanguageEmailTemplate {
  zh_CN: EmailTemplate // 中文模板
  en: EmailTemplate // 英文模板
}

/**
 * 邮件模板变量接口
 */
export interface EmailTemplateVariables {
  userName: string // 用户名称
  inactiveDays: number // 未活跃天数
  lastActiveDate: string // 最后活跃日期
  currentDate: string // 当前日期
  merit: number // 功德值
  hp: number // 生命值
}

/**
 * 邮件发送记录接口
 */
export interface EmailRecord {
  id: string // 记录 ID
  recipients: string[] // 收件人列表
  subject: string // 邮件主题
  sentAt: number // 发送时间
  status: 'pending' | 'sent' | 'failed' // 发送状态
  error?: string // 错误信息（如果失败）
}

/**
 * 用户配置接口（用于同步）
 */
export interface UserSettings {
  language: string // 语言偏好
  deathDetectionConfig: DeathDetectionConfig // 死亡检测配置
  emailTemplate?: MultiLanguageEmailTemplate // 自定义邮件模板（中英文双语，可选）
  version: number // 配置版本号
  updatedAt: number // 更新时间
}
