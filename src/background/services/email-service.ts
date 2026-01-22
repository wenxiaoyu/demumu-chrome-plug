/**
 * 邮件发送服务
 *
 * 负责准备和发送死亡通知邮件
 * Phase 1 使用 mailto 协议，需要用户手动确认
 */

import { EmailTemplate, EmailTemplateVariables, EmailRecord } from '../../shared/types'
import { getDeathNotificationTemplate } from '../../shared/templates/death-notification-email'
import { renderTemplate } from '../../shared/utils/template-renderer'
import { STORAGE_KEYS } from '../../shared/constants'
import { contactService } from './contact-service'
import { authService } from '../../shared/services/auth-service'

export class EmailService {
  /**
   * 准备邮件内容
   *
   * @param variables 模板变量
   * @returns 渲染后的邮件模板
   */
  async prepareEmail(variables: EmailTemplateVariables): Promise<EmailTemplate> {
    const template = await getDeathNotificationTemplate(variables.userName)
    return renderTemplate(template, variables, true)
  }

  /**
   * 生成 mailto 链接
   *
   * @param recipients 收件人邮箱列表
   * @param subject 邮件主题
   * @param body 邮件正文（纯文本）
   * @returns mailto URL
   */
  generateMailtoLink(recipients: string[], subject: string, body: string): string {
    // 对邮件内容进行 URL 编码
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)

    // 构建 mailto 链接
    // 格式：mailto:email1,email2?subject=xxx&body=xxx
    const recipientList = recipients.join(',')
    const mailtoUrl = `mailto:${recipientList}?subject=${encodedSubject}&body=${encodedBody}`

    return mailtoUrl
  }

  /**
   * 发送邮件（使用 mailto 协议）
   *
   * @param recipients 收件人列表
   * @param email 邮件内容
   * @returns 邮件发送记录
   */
  async sendEmail(recipients: string[], email: EmailTemplate): Promise<EmailRecord> {
    const record: EmailRecord = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipients,
      subject: email.subject,
      sentAt: Date.now(),
      status: 'pending',
    }

    try {
      // 生成 mailto 链接（使用纯文本正文）
      const mailtoUrl = this.generateMailtoLink(recipients, email.subject, email.textBody)

      // 在 Service Worker 中使用 chrome.tabs.create 打开 mailto 链接
      await chrome.tabs.create({ url: mailtoUrl })

      // 标记为已发送（实际上是已打开邮件客户端）
      record.status = 'sent'

      // 保存发送记录
      await this.saveEmailRecord(record)

      console.log('[EmailService] Email prepared and mailto link opened:', record.id)

      return record
    } catch (error) {
      console.error('[EmailService] Error sending email:', error)

      record.status = 'failed'
      record.error = error instanceof Error ? error.message : 'Unknown error'

      await this.saveEmailRecord(record)

      throw error
    }
  }

  /**
   * 按优先级发送邮件给联系人
   *
   * @param variables 模板变量
   * @param maxRecipients 最大收件人数量（默认 5）
   * @returns 邮件发送记录
   */
  async sendToContacts(
    variables: EmailTemplateVariables,
    maxRecipients: number = 5
  ): Promise<EmailRecord> {
    // 检查登录状态
    if (!authService.isSignedIn()) {
      console.log('[EmailService] User not signed in, email sending skipped')
      throw new Error('User not signed in. Please sign in to send email notifications.')
    }

    // 获取当前用户
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      throw new Error('Failed to get current user')
    }

    // 获取自定义显示名称
    let userName = variables.userName
    try {
      const { firestoreService } = await import('../../shared/services/firestore-service')
      const userData = await firestoreService.getUserData(currentUser.uid)
      if (userData?.displayName) {
        userName = userData.displayName
      } else if (currentUser.displayName) {
        userName = currentUser.displayName
      }
    } catch (error) {
      console.error('[EmailService] Failed to load display name:', error)
      // 使用传入的 userName 作为后备
    }

    // 更新模板变量中的用户名
    const updatedVariables = {
      ...variables,
      userName,
    }

    // 获取所有联系人
    const contacts = await contactService.getAllContacts()

    if (contacts.length === 0) {
      throw new Error('No emergency contacts found. Please add at least one contact first.')
    }

    // 按优先级排序（优先级数字越小越高）
    const sortedContacts = contacts.sort((a, b) => a.priority - b.priority).slice(0, maxRecipients)

    // 提取邮箱地址
    const recipients = sortedContacts.map((c) => c.email)

    // 准备邮件
    const email = await this.prepareEmail(updatedVariables)

    // 发送邮件
    return await this.sendEmail(recipients, email)
  }

  /**
   * 保存邮件发送记录
   *
   * @param record 邮件记录
   */
  private async saveEmailRecord(record: EmailRecord): Promise<void> {
    try {
      // 获取现有记录
      const result = await chrome.storage.local.get(STORAGE_KEYS.EMAIL_RECORDS)
      const records: EmailRecord[] = (result[STORAGE_KEYS.EMAIL_RECORDS] as EmailRecord[]) || []

      // 添加新记录
      records.push(record)

      // 只保留最近 100 条记录
      const recentRecords = records.slice(-100)

      // 保存
      await chrome.storage.local.set({
        [STORAGE_KEYS.EMAIL_RECORDS]: recentRecords,
      })

      console.log('[EmailService] Email record saved:', record.id)
    } catch (error) {
      console.error('[EmailService] Error saving email record:', error)
    }
  }

  /**
   * 获取所有邮件发送记录
   *
   * @returns 邮件记录列表
   */
  async getEmailRecords(): Promise<EmailRecord[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.EMAIL_RECORDS)
      return (result[STORAGE_KEYS.EMAIL_RECORDS] as EmailRecord[]) || []
    } catch (error) {
      console.error('[EmailService] Error getting email records:', error)
      return []
    }
  }

  /**
   * 清除所有邮件记录
   */
  async clearEmailRecords(): Promise<void> {
    try {
      await chrome.storage.local.remove(STORAGE_KEYS.EMAIL_RECORDS)
      console.log('[EmailService] Email records cleared')
    } catch (error) {
      console.error('[EmailService] Error clearing email records:', error)
    }
  }
}

// 导出单例
export const emailService = new EmailService()
