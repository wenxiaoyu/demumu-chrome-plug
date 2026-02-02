/**
 * 认证相关类型定义
 */

/**
 * 用户信息
 */
export interface User {
  /** 用户 ID */
  uid: string;
  /** 显示名称 */
  displayName: string | null;
  /** 邮箱地址 */
  email: string | null;
  /** 头像 URL */
  photoURL: string | null;
  /** 邮箱是否已验证 */
  emailVerified: boolean;
  /** ID Token (用于 API 认证) */
  idToken?: string;
  /** Refresh Token (用于刷新 ID Token) */
  refreshToken?: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  /** 是否已登录 */
  isSignedIn: boolean;
  /** 用户信息（已登录时） */
  user: User | null;
  /** 最后更新时间 */
  lastUpdated: number;
  /** 访问令牌（用于 API 调用） */
  accessToken?: string;
}

/**
 * 登录提示配置
 */
export interface LoginPromptConfig {
  /** 提示标题 */
  title: string;
  /** 提示消息 */
  message: string;
  /** 登录按钮文本 */
  loginButtonText: string;
  /** 稍后按钮文本 */
  laterButtonText: string;
  /** 是否显示"稍后再说"选项 */
  showLaterOption: boolean;
}

/**
 * 认证错误类型
 */
export enum AuthErrorType {
  /** 用户取消登录 */
  USER_CANCELLED = 'user_cancelled',
  /** 网络错误 */
  NETWORK_ERROR = 'network_error',
  /** 未授权 */
  UNAUTHORIZED = 'unauthorized',
  /** 配置错误 */
  CONFIG_ERROR = 'config_error',
  /** 未知错误 */
  UNKNOWN = 'unknown',
}

/**
 * 认证错误
 */
export interface AuthError {
  /** 错误类型 */
  type: AuthErrorType;
  /** 错误消息 */
  message: string;
  /** 原始错误对象 */
  originalError?: unknown;
}
