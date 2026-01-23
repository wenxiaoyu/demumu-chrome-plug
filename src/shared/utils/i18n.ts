/**
 * i18n 工具函数
 * 
 * 自定义国际化实现，支持手动语言切换
 * 支持语言：中文 (zh_CN)、英文 (en)
 * 默认语言：英文
 */

import { STORAGE_KEYS } from '../constants';

// 语言代码类型
export type LanguageCode = 'en' | 'zh_CN';

// 翻译数据缓存
let translations: Record<string, { message: string; placeholders?: any }> = {};
let currentLanguage: LanguageCode = 'en';
let isInitialized = false;

/**
 * 加载翻译文件
 */
async function loadTranslations(lang: LanguageCode): Promise<void> {
  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
    const response = await fetch(url);
    translations = await response.json();
    currentLanguage = lang;
  } catch (error) {
    console.error(`[i18n] Failed to load translations for ${lang}:`, error);
    // 如果加载失败，尝试加载英文作为后备
    if (lang !== 'en') {
      await loadTranslations('en');
    }
  }
}

/**
 * 初始化语言设置
 */
export async function initLanguage(): Promise<void> {
  if (isInitialized) return;
  
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LANGUAGE);
    const savedLang = result[STORAGE_KEYS.LANGUAGE] as LanguageCode | undefined;
    const lang = savedLang || 'en'; // 默认英文
    await loadTranslations(lang);
    isInitialized = true;
  } catch (error) {
    console.error('[i18n] Failed to initialize language:', error);
    await loadTranslations('en');
    isInitialized = true;
  }
}

/**
 * 设置当前语言
 * @param lang 语言代码
 */
export async function setLanguage(lang: LanguageCode): Promise<void> {
  await loadTranslations(lang);
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.LANGUAGE]: lang });
    
    // 标记配置为待同步
    try {
      const { syncService } = await import('../services/sync-service');
      await syncService.markSettingsForSync();
    } catch (error) {
      console.error('[i18n] Failed to mark settings for sync:', error);
    }
    
    // 触发语言变更事件
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  } catch (error) {
    console.error('[i18n] Failed to save language setting:', error);
  }
}

/**
 * 替换占位符
 * 支持 $NAME$, $COUNT$, $HP$, $DAYS$ 等命名占位符
 */
function replacePlaceholders(message: string, substitutions?: string | string[]): string {
  if (!substitutions) return message;
  
  const subs = Array.isArray(substitutions) ? substitutions : [substitutions];
  let result = message;
  
  // 替换命名占位符 $NAME$, $COUNT$, $HP$, $DAYS$ 等
  // 按出现顺序替换，第一个占位符用 subs[0]，第二个用 subs[1]，以此类推
  let placeholderIndex = 0;
  result = result.replace(/\$([A-Z_]+)\$/g, () => {
    const value = subs[placeholderIndex] || '';
    placeholderIndex++;
    return value;
  });
  
  return result;
}

/**
 * 获取翻译文本
 * @param key 翻译键名
 * @param substitutions 替换变量（可选）
 * @returns 翻译后的文本
 */
export function t(key: string, substitutions?: string | string[]): string {
  try {
    const entry = translations[key];
    if (!entry) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key;
    }
    
    return replacePlaceholders(entry.message, substitutions);
  } catch (error) {
    console.error(`[i18n] Error getting message for key: ${key}`, error);
    return key;
  }
}

/**
 * 获取当前语言代码
 * @returns 语言代码，如 'zh_CN' 或 'en'
 */
export function getCurrentLanguage(): LanguageCode {
  return currentLanguage;
}

/**
 * 获取浏览器UI语言
 * @returns 浏览器语言代码
 */
export function getBrowserLanguage(): string {
  return chrome.i18n.getUILanguage();
}

/**
 * 判断当前是否为中文环境
 * @returns 是否为中文
 */
export function isChineseLanguage(): boolean {
  return currentLanguage === 'zh_CN';
}

/**
 * 格式化数字（根据语言环境）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (isChineseLanguage()) {
    // 中文：使用"万"单位
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString('zh-CN');
  } else {
    // 英文：使用千位分隔符
    return num.toLocaleString('en-US');
  }
}

/**
 * 格式化日期（根据语言环境）
 * @param date 日期对象
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = isChineseLanguage() ? 'zh-CN' : 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(date);
}
