# 邮件模板格式错误修复

## 问题描述

在 Options 页面出现错误：

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'subject')
```

## 原因分析

代码已更新为支持多语言邮件模板格式，但本地存储中可能还保存着旧的单语言格式，导致模板解析失败。

**旧格式（单语言）**:

```json
{
  "subject": "...",
  "htmlBody": "...",
  "textBody": "..."
}
```

**新格式（多语言）**:

```json
{
  "zh_CN": {
    "subject": "...",
    "htmlBody": "...",
    "textBody": "..."
  },
  "en": {
    "subject": "...",
    "htmlBody": "...",
    "textBody": "..."
  }
}
```

## 解决方案

### 方案 1：清除本地模板（推荐）

在浏览器控制台运行以下代码，清除旧模板让系统重新生成：

```javascript
// 清除本地邮件模板
chrome.storage.local.remove('customEmailTemplate', () => {
  console.log('✅ 邮件模板已清除')
  console.log('💡 刷新页面后将自动生成新的多语言模板')
})
```

然后刷新页面。

### 方案 2：手动转换为多语言格式

如果你有自定义的邮件模板想保留，可以手动转换：

```javascript
// 1. 获取当前模板
chrome.storage.local.get(['customEmailTemplate', 'language'], async (result) => {
  const oldTemplate = result.customEmailTemplate
  const language = result.language || 'zh_CN'

  console.log('旧模板:', oldTemplate)
  console.log('当前语言:', language)

  // 2. 检查是否需要转换
  if (oldTemplate && oldTemplate.subject && !oldTemplate.zh_CN && !oldTemplate.en) {
    console.log('⚠️ 检测到旧格式，开始转换...')

    // 3. 转换为多语言格式
    const multiLangTemplate = {
      zh_CN:
        language === 'zh_CN'
          ? oldTemplate
          : {
              subject: '⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃',
              htmlBody: '...', // 使用默认中文模板
              textBody: '...',
            },
      en:
        language === 'en'
          ? oldTemplate
          : {
              subject:
                '⚠️ Important Notice: {{userName}} has been inactive for {{inactiveDays}} days',
              htmlBody: '...', // 使用默认英文模板
              textBody: '...',
            },
    }

    // 4. 保存新格式
    chrome.storage.local.set({ customEmailTemplate: multiLangTemplate }, () => {
      console.log('✅ 转换完成！')
      console.log('新模板:', multiLangTemplate)
      console.log('💡 刷新页面查看效果')
    })
  } else if (oldTemplate && oldTemplate.zh_CN && oldTemplate.en) {
    console.log('✅ 已经是多语言格式，无需转换')
  } else {
    console.log('ℹ️ 没有自定义模板')
  }
})
```

### 方案 3：等待自动迁移

如果你已登录 Firebase，下次同步时会自动转换：

1. 打开 Options 页面
2. 点击"立即同步"按钮
3. 等待同步完成
4. 刷新页面

## 代码改进

已在代码中添加了以下改进：

### 1. 兼容旧格式

`src/shared/templates/death-notification-email.ts` 现在可以处理两种格式：

```typescript
export async function getDeathNotificationTemplate(userName: string): Promise<EmailTemplate> {
  try {
    const customTemplate = await storage.get<any>('customEmailTemplate')

    if (customTemplate) {
      // 检查是否为新的多语言格式
      if (customTemplate.zh_CN && customTemplate.en) {
        const isChinese = isChineseLanguage()
        return isChinese ? customTemplate.zh_CN : customTemplate.en
      }
      // 兼容旧的单语言格式
      else if (customTemplate.subject && customTemplate.htmlBody && customTemplate.textBody) {
        console.warn('[getDeathNotificationTemplate] Found old single-language template')
        return customTemplate
      }
    }

    // 使用默认模板
    const isChinese = isChineseLanguage()
    return {
      subject: t('emailSubject', userName),
      htmlBody: isChinese ? getChineseHtmlBody() : getEnglishHtmlBody(),
      textBody: isChinese ? getChineseTextBody() : getEnglishTextBody(),
    }
  } catch (error) {
    console.error('[getDeathNotificationTemplate] Error:', error)
    // 返回默认模板作为后备
    // ...
  }
}
```

### 2. 错误处理

`src/options/components/EmailPreview.tsx` 添加了错误处理：

```typescript
const renderEmail = async () => {
  try {
    const template = await getDeathNotificationTemplate(vars.userName)

    // 验证模板完整性
    if (!template || !template.subject || !template.htmlBody || !template.textBody) {
      throw new Error('Invalid email template format')
    }

    const rendered = renderTemplate(template, vars, true)
    setRenderedEmail(rendered)
  } catch (error) {
    console.error('[EmailPreview] Failed to render email:', error)
    // 显示错误信息
    setRenderedEmail({
      subject: 'Error loading email template',
      htmlBody: '<p>Failed to load email template.</p>',
      textBody: 'Failed to load email template.',
    })
  }
}
```

## 验证修复

### 1. 检查本地存储

在浏览器控制台运行：

```javascript
chrome.storage.local.get(['customEmailTemplate'], (result) => {
  const template = result.customEmailTemplate

  if (!template) {
    console.log('ℹ️ 没有自定义模板')
  } else if (template.zh_CN && template.en) {
    console.log('✅ 多语言格式正确')
    console.log('中文主题:', template.zh_CN.subject)
    console.log('英文主题:', template.en.subject)
  } else if (template.subject) {
    console.log('⚠️ 旧的单语言格式')
    console.log('主题:', template.subject)
  } else {
    console.log('❌ 格式无法识别')
    console.log('模板:', template)
  }
})
```

### 2. 测试邮件预览

1. 打开 Options 页面
2. 切换到"设置"标签
3. 查看邮件预览是否正常显示
4. 切换语言（中文 ↔ 英文）
5. 确认邮件内容随语言切换

### 3. 查看控制台日志

打开浏览器控制台，查看是否有以下日志：

```
[getDeathNotificationTemplate] Found custom template: {...}
[getDeathNotificationTemplate] Using multi-language template
[EmailPreview] Rendering template with userName: ...
```

## 预防措施

为避免将来出现类似问题：

1. **始终验证数据格式**: 在读取存储数据时验证格式
2. **提供后备方案**: 如果数据格式不正确，使用默认值
3. **添加错误处理**: 使用 try-catch 捕获异常
4. **记录详细日志**: 便于调试和排查问题

## 相关文档

- [多语言邮件模板实现](../features/MULTI_LANGUAGE_EMAIL_TEMPLATE.md)
- [邮件模板迁移指南](../setup/EMAIL_TEMPLATE_MIGRATION_GUIDE.md)
- [Firestore 数据库结构](../setup/FIRESTORE_DATABASE_SCHEMA.md)

---

**最后更新**: 2025-01-22
