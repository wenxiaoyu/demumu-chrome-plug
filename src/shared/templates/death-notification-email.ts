/**
 * 死亡通知邮件模板
 * 
 * 支持中英文双语
 * 使用 Chrome i18n API 根据用户语言自动选择
 */

import { EmailTemplate } from '../types';
import { t, isChineseLanguage } from '../utils/i18n';

/**
 * 获取死亡通知邮件模板
 * @param userName 用户名（用于替换主题中的占位符）
 * @returns 邮件模板（根据当前语言）
 */
export function getDeathNotificationTemplate(userName: string): EmailTemplate {
  const isChinese = isChineseLanguage();
  
  return {
    subject: t('emailSubject', userName),
    htmlBody: isChinese ? getChineseHtmlBody() : getEnglishHtmlBody(),
    textBody: isChinese ? getChineseTextBody() : getEnglishTextBody(),
  };
}

/**
 * 中文 HTML 邮件正文
 */
function getChineseHtmlBody(): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重要通知</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 8px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #d32f2f;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
    }
    .details {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .details-item {
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
    }
    .details-label {
      font-weight: bold;
      color: #666;
    }
    .details-value {
      color: #333;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .note {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ 重要通知</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        您好，
      </div>
      
      <div class="message">
        <p>我们注意到 <strong>{{userName}}</strong> 已经 <strong>{{inactiveDays}}</strong> 天没有活跃了。</p>
        <p>根据预先设定的规则，系统判定可能需要您的关注。</p>
      </div>
      
      <div class="details">
        <div class="details-item">
          <span class="details-label">最后活跃时间：</span>
          <span class="details-value">{{lastActiveDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">检测时间：</span>
          <span class="details-value">{{currentDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">未活跃天数：</span>
          <span class="details-value">{{inactiveDays}} 天</span>
        </div>
        <div class="details-item">
          <span class="details-label">功德值：</span>
          <span class="details-value">{{merit}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">生命值：</span>
          <span class="details-value">{{hp}}</span>
        </div>
      </div>
      
      <div class="note">
        <p><strong>💡 这是什么？</strong></p>
        <p>这是一封自动发送的关怀提醒邮件。如果一切正常，请忽略此邮件。如果您担心对方的安全，建议尽快联系确认。</p>
      </div>
    </div>
    
    <div class="footer">
      <p>此邮件由"还活着吗"扩展自动发送</p>
      <p>© 2025 还活着吗 | 关心每一个生命</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 英文 HTML 邮件正文
 */
function getEnglishHtmlBody(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Notice</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 8px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #d32f2f;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
    }
    .details {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .details-item {
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
    }
    .details-label {
      font-weight: bold;
      color: #666;
    }
    .details-value {
      color: #333;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .note {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Important Notice</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello,
      </div>
      
      <div class="message">
        <p>We noticed that <strong>{{userName}}</strong> has been inactive for <strong>{{inactiveDays}}</strong> days.</p>
        <p>According to the preset rules, the system has determined that your attention may be needed.</p>
      </div>
      
      <div class="details">
        <div class="details-item">
          <span class="details-label">Last Active:</span>
          <span class="details-value">{{lastActiveDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">Detection Time:</span>
          <span class="details-value">{{currentDate}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">Inactive Days:</span>
          <span class="details-value">{{inactiveDays}} days</span>
        </div>
        <div class="details-item">
          <span class="details-label">Merit:</span>
          <span class="details-value">{{merit}}</span>
        </div>
        <div class="details-item">
          <span class="details-label">HP:</span>
          <span class="details-value">{{hp}}</span>
        </div>
      </div>
      
      <div class="note">
        <p><strong>💡 What is this?</strong></p>
        <p>This is an automatically sent care reminder email. If everything is fine, please ignore this email. If you're concerned about their safety, we recommend contacting them as soon as possible.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>This email was automatically sent by "Are You Still Alive" extension</p>
      <p>© 2025 Are You Still Alive | Caring for Every Life</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 中文纯文本邮件正文
 */
function getChineseTextBody(): string {
  return `
⚠️ 重要通知

您好，

我们注意到 {{userName}} 已经 {{inactiveDays}} 天没有活跃了。
根据预先设定的规则，系统判定可能需要您的关注。

详细信息：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
最后活跃时间：{{lastActiveDate}}
检测时间：{{currentDate}}
未活跃天数：{{inactiveDays}} 天
功德值：{{merit}}
生命值：{{hp}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 这是什么？
这是一封自动发送的关怀提醒邮件。如果一切正常，请忽略此邮件。
如果您担心对方的安全，建议尽快联系确认。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
此邮件由"还活着吗"扩展自动发送
© 2025 还活着吗 | 关心每一个生命
  `.trim();
}

/**
 * 英文纯文本邮件正文
 */
function getEnglishTextBody(): string {
  return `
⚠️ Important Notice

Hello,

We noticed that {{userName}} has been inactive for {{inactiveDays}} days.
According to the preset rules, the system has determined that your attention may be needed.

Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last Active: {{lastActiveDate}}
Detection Time: {{currentDate}}
Inactive Days: {{inactiveDays}} days
Merit: {{merit}}
HP: {{hp}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 What is this?
This is an automatically sent care reminder email. If everything is fine, please ignore this email.
If you're concerned about their safety, we recommend contacting them as soon as possible.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was automatically sent by "Are You Still Alive" extension
© 2025 Are You Still Alive | Caring for Every Life
  `.trim();
}
