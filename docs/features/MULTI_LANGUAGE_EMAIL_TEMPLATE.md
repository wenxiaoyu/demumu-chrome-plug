# 多语言邮件模板实现

## 概述

将邮件模板从单语言格式升级为多语言格式，支持中英文双语邮件模板的存储和同步。

## 问题背景

之前的实现中，远程数据库只存储一份邮件模板（根据用户当前语言），这导致：

1. 用户切换语言后，邮件模板不会自动切换
2. 无法同时维护中英文两个版本的邮件模板
3. 多设备同步时可能出现语言不一致的问题

## 解决方案

### 1. 类型定义更新

**新增 `MultiLanguageEmailTemplate` 接口** (`src/shared/types.ts`)

```typescript
/**
 * 多语言邮件模板接口
 */
export interface MultiLanguageEmailTemplate {
  zh_CN: EmailTemplate // 中文模板
  en: EmailTemplate // 英文模板
}

/**
 * 用户配置接口（用于同步）
 */
export interface UserSettings {
  language: string
  deathDetectionConfig: DeathDetectionConfig
  emailTemplate?: MultiLanguageEmailTemplate // 改为多语言模板
  version: number
  updatedAt: number
}
```

### 2. 邮件模板服务更新

**新增多语言模板生成函数** (`src/shared/services/email-template-service.ts`)

```typescript
/**
 * 获取默认的多语言邮件模板
 */
export function getDefaultMultiLanguageEmailTemplate(): MultiLanguageEmailTemplate {
  return {
    zh_CN: getDefaultChineseEmailTemplate(),
    en: getDefaultEnglishEmailTemplate(),
  }
}
```

### 3. 模板获取逻辑更新

**支持从存储读取多语言模板** (`src/shared/templates/death-notification-email.ts`)

```typescript
export async function getDeathNotificationTemplate(userName: string): Promise<EmailTemplate> {
  // 尝试从存储中获取自定义模板
  const customTemplate = await storage.get<MultiLanguageEmailTemplate>('customEmailTemplate')

  if (customTemplate) {
    // 使用自定义模板，根据当前语言选择
    const isChinese = isChineseLanguage()
    const template = isChinese ? customTemplate.zh_CN : customTemplate.en
    return template
  }

  // 如果没有自定义模板，使用默认模板
  const isChinese = isChineseLanguage()
  return {
    subject: t('emailSubject', userName),
    htmlBody: isChinese ? getChineseHtmlBody() : getEnglishHtmlBody(),
    textBody: isChinese ? getChineseTextBody() : getEnglishTextBody(),
  }
}
```

### 4. 同步服务更新

**支持多语言模板同步** (`src/shared/services/sync-service.ts`)

```typescript
// 获取本地配置
const customEmailTemplate = await storage.get<MultiLanguageEmailTemplate>('customEmailTemplate')

// 如果本地没有邮件模板，生成默认的多语言模板
let emailTemplate = customEmailTemplate
if (!emailTemplate) {
  const { getDefaultMultiLanguageEmailTemplate } = await import('./email-template-service')
  emailTemplate = getDefaultMultiLanguageEmailTemplate()
  await storage.set('customEmailTemplate', emailTemplate)
  console.log('[SyncService] Default multi-language email template generated')
}
```

### 5. Firestore 服务更新

**更新云端存储格式** (`src/shared/services/firestore-service.ts`)

```typescript
interface FirestoreUserSettings {
  uid: string;
  language: string;
  deathDetectionConfig: { ... };
  emailTemplate?: {
    zh_CN: {
      subject: string;
      htmlBody: string;
      textBody: string;
    };
    en: {
      subject: string;
      htmlBody: string;
      textBody: string;
    };
  };
  version: number;
  updatedAt: number;
}
```

### 6. 数据迁移

**自动迁移旧的单语言模板** (`src/shared/services/data-migration.ts`)

```typescript
// 获取或生成多语言邮件模板
let emailTemplate = await storage.get<MultiLanguageEmailTemplate>('customEmailTemplate')

if (!emailTemplate) {
  // 检查是否有旧的单语言模板
  const oldTemplate = await storage.get<EmailTemplate>('customEmailTemplate')

  if (oldTemplate && oldTemplate.subject) {
    // 迁移旧模板：将单语言模板转换为多语言格式
    console.log('[DataMigration] Migrating old single-language template to multi-language format')
    const defaultMultiLang = getDefaultMultiLanguageEmailTemplate()

    // 根据当前语言决定将旧模板放在哪个语言下
    if (language === 'zh_CN') {
      emailTemplate = {
        zh_CN: oldTemplate,
        en: defaultMultiLang.en,
      }
    } else {
      emailTemplate = {
        zh_CN: defaultMultiLang.zh_CN,
        en: oldTemplate,
      }
    }
  } else {
    // 如果没有任何模板，使用默认的多语言模板
    emailTemplate = getDefaultMultiLanguageEmailTemplate()
  }

  await storage.set('customEmailTemplate', emailTemplate)
  console.log('[DataMigration] Multi-language email template generated')
}
```

### 7. UI 组件更新

**EmailPreview 组件支持异步加载** (`src/options/components/EmailPreview.tsx`)

```typescript
useEffect(() => {
  const renderEmail = async () => {
    // ... 准备变量

    const template = await getDeathNotificationTemplate(vars.userName)
    const rendered = renderTemplate(template, vars, true)
    setRenderedEmail(rendered)
  }

  renderEmail()
}, [variables, displayName, isSignedIn, loading])
```

**EmailService 支持异步模板** (`src/background/services/email-service.ts`)

```typescript
async prepareEmail(variables: EmailTemplateVariables): Promise<EmailTemplate> {
  const template = await getDeathNotificationTemplate(variables.userName);
  return renderTemplate(template, variables, true);
}
```

## 数据结构

### 本地存储格式

**Storage Key**: `customEmailTemplate`

```typescript
{
  zh_CN: {
    subject: "⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃",
    htmlBody: "...",
    textBody: "..."
  },
  en: {
    subject: "⚠️ Important Notice: {{userName}} has been inactive for {{inactiveDays}} days",
    htmlBody: "...",
    textBody: "..."
  }
}
```

### 云端存储格式

**Firestore Collection**: `userSettings/{uid}`

```typescript
{
  uid: "user123",
  language: "zh_CN",
  deathDetectionConfig: { ... },
  emailTemplate: {
    zh_CN: {
      subject: "...",
      htmlBody: "...",
      textBody: "..."
    },
    en: {
      subject: "...",
      htmlBody: "...",
      textBody: "..."
    }
  },
  version: 1,
  updatedAt: 1234567890
}
```

## 向后兼容性

1. **自动迁移**: 首次同步时，会自动检测旧的单语言模板并转换为多语言格式
2. **默认模板**: 如果没有自定义模板，会自动生成包含中英文的默认模板
3. **语言选择**: 根据用户当前语言设置自动选择对应的模板版本

## 使用方式

### 获取邮件模板

```typescript
// 自动根据当前语言返回对应的模板
const template = await getDeathNotificationTemplate(userName)
```

### 自定义模板（未来功能）

```typescript
// 保存自定义的多语言模板
const customTemplate: MultiLanguageEmailTemplate = {
  zh_CN: {
    subject: '自定义中文主题',
    htmlBody: '...',
    textBody: '...',
  },
  en: {
    subject: 'Custom English Subject',
    htmlBody: '...',
    textBody: '...',
  },
}

await storage.set('customEmailTemplate', customTemplate)
await syncService.markSettingsForSync() // 触发同步
```

## 测试建议

1. **新用户测试**: 创建新账号，验证默认多语言模板是否正确生成
2. **旧用户迁移测试**: 使用有旧模板的账号登录，验证迁移是否成功
3. **语言切换测试**: 切换语言后，验证邮件预览是否显示对应语言的模板
4. **同步测试**: 在多个设备间同步，验证模板是否正确同步
5. **云端数据测试**: 检查 Firestore 中的数据格式是否正确

## 相关文件

- `src/shared/types.ts` - 类型定义
- `src/shared/services/email-template-service.ts` - 模板服务
- `src/shared/templates/death-notification-email.ts` - 模板获取
- `src/shared/services/sync-service.ts` - 同步服务
- `src/shared/services/firestore-service.ts` - Firestore 服务
- `src/shared/services/data-migration.ts` - 数据迁移
- `src/background/services/email-service.ts` - 邮件服务
- `src/options/components/EmailPreview.tsx` - 邮件预览组件

## 后续优化

1. 添加 UI 界面支持用户自定义编辑中英文模板
2. 支持更多语言（如日语、韩语等）
3. 提供模板变量的可视化编辑器
4. 添加模板预览和测试功能
