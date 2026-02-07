/**
 * Background Service Worker
 *
 * 负责：
 * 1. 状态检测和更新
 * 2. Badge 更新1
 * 3. 消息处理
 */

// 初始化 Firebase（测试）
import '../shared/config/firebase'

import { StatusChecker } from './services/status-checker'
import { contactService } from './services/contact-service'
import { deathDetectionService } from './services/death-detection-service'
import { initLanguage } from '../shared/utils/i18n'
import { authService } from '../shared/services/auth-service'
import { syncScheduler } from './services/sync-scheduler'

console.log('[Background] Service worker loaded')

// 初始化语言设置
initLanguage()
  .then(() => {
    console.log('[Background] Language initialized')
  })
  .catch((error) => {
    console.error('[Background] Failed to initialize language:', error)
  })

// 初始化认证服务
authService
  .initialize()
  .then(() => {
    console.log('[Background] Auth service initialized')
  })
  .catch((error) => {
    console.error('[Background] Failed to initialize auth service:', error)
  })

// 初始化同步调度器
syncScheduler
  .initialize()
  .then(() => {
    console.log('[Background] Sync scheduler initialized')
  })
  .catch((error) => {
    console.error('[Background] Failed to initialize sync scheduler:', error)
  })

const statusChecker = new StatusChecker()

/**
 * 监听插件安装或更新事件
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Background] Extension installed/updated:', details.reason)

  if (details.reason === 'install') {
    console.log('[Background] First install detected')

    // 初始化状态检查
    await statusChecker.initialize()
  } else if (details.reason === 'update') {
    console.log('[Background] Extension updated to version:', chrome.runtime.getManifest().version)

    // 更新后也进行一次状态检查
    await statusChecker.checkAndUpdate()
  }
})

/**
 * 监听浏览器启动事件
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Background] Browser startup detected')

  // 浏览器启动时检查状态
  await statusChecker.checkAndUpdate()
})

/**
 * 监听来自 Popup 的消息
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Background] Message received:', message)

  // 处理敲击后的状态更新请求
  if (message.type === 'KNOCK_COMPLETED') {
    // 敲击完成后立即更新 Badge
    statusChecker.checkAndUpdate().then(() => {
      sendResponse({ success: true })
    })
    return true // 异步响应
  }

  // 处理手动状态检查请求
  if (message.type === 'CHECK_STATUS') {
    statusChecker.checkAndUpdate().then(() => {
      sendResponse({ success: true })
    })
    return true // 异步响应
  }

  // 联系人管理消息处理
  if (message.type === 'GET_CONTACTS') {
    contactService
      .getAllContacts()
      .then((contacts) => {
        sendResponse({ success: true, data: contacts })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'ADD_CONTACT') {
    contactService
      .addContact(message.data)
      .then((contact) => {
        sendResponse({ success: true, data: contact })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'UPDATE_CONTACT') {
    const { id, updates } = message.data
    contactService
      .updateContact(id, updates)
      .then((contact) => {
        sendResponse({ success: true, data: contact })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'DELETE_CONTACT') {
    const { id } = message.data
    contactService
      .deleteContact(id)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  // 死亡检测消息处理
  if (message.type === 'GET_DEATH_CONFIG') {
    deathDetectionService
      .getConfig()
      .then((config) => {
        sendResponse({ success: true, data: config })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'UPDATE_DEATH_CONFIG') {
    deathDetectionService
      .updateConfig(message.data)
      .then(async (config) => {
        sendResponse({ success: true, data: config })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'CHECK_DEATH_STATUS') {
    deathDetectionService
      .checkDeathStatus()
      .then((status) => {
        sendResponse({ success: true, data: status })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'GET_DEATH_STATUS') {
    deathDetectionService
      .getCurrentStatus()
      .then((status) => {
        sendResponse({ success: true, data: status })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  // 邮件发送消息处理
  if (message.type === 'TRIGGER_EMAIL_SEND') {
    deathDetectionService
      .triggerEmailSend()
      .then((success) => {
        sendResponse({ success })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  // 认证相关消息处理
  if (message.type === 'SIGN_IN') {
    authService
      .signInWithGoogle()
      .then((user) => {
        sendResponse({ success: true, data: user })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'SIGN_OUT') {
    authService
      .signOut()
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'GET_AUTH_STATE') {
    authService
      .loadAuthState()
      .then((state) => {
        sendResponse({ success: true, data: state })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  // 同步相关消息处理
  if (message.type === 'SYNC_NOW') {
    syncScheduler
      .syncNow()
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  return false
})

console.log('[Background] All listeners set up')
