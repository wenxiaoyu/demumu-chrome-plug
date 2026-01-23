# 邮件模板同步功能实现

## 概述

实现了邮件模板的云端同步功能，使 Cloud Functions 可以从数据库读取用户的邮件模板来发送通知邮件。

## 实现内容

### 1. 新增邮件模板服务

**文件**: `src/shared/services/email-template-service.ts`

提供默认邮件模板的生成功能：

- `getDefaultChineseEmailTemplate()` - 获取中文默认模板
- `getDefaultEnglishEmailTemplate()` - 获取英文默认模板
- `getDefaultEmailTemplate(language)` - 根据语言获取默认模板

**模板包含**:
- `subject` - 邮件主题（支持变量占位符）
- `htmlBody` - HTML 格式邮件正文
- `textBody` - 纯文本格式邮件正文

**变量占位符**:
- `{{userName}}` - 用户名
- `{{inactiveDays}}` - 未活跃天数
- `{{lastActiveDate}}` - 最后活跃时间
- `{{currentDate}}` - 当前检测时间
- `{{merit}}` - 功德值
- `{{hp}}` - 生命值

### 2. 更新数据迁移服务

**文件**: `src/shared/services/data-migration.ts`

在首次登录时自动生成并上传默认邮件模板：

```typescript
// 获取或生成默认邮件模板
let emailTemplate = await storage.get('customEmailTemplate');
if (!emailTemplate) {
  // 如果没有自定义模板，使用默认模板
  emailTemplate = getDefaultEmailTemplate(language);
  await storage.set('customEmailTemplate', emailTemplate);
}

const userSettings: UserSettings = {
  language,
  deathDetectionConfig,
  emailTemplate,  // 包含邮件模板
  version: 1,
  updatedAt: Date.now()
};

await firestoreService.setUserSettings(uid, userSettings);
```

### 3. 更新同步服务

**文件**: `src/shared/services/sync-service.ts`

在 `syncUserSettings()` 方法中包含邮件模板的同步：

```typescript
// 获取本地配置（包括邮件模板）
const customEmailTemplate = await storage.get('customEmailTemplate');

const localSettings: UserSettings = {
  language: language || 'zh_CN',
  deathDetectionConfig: deathDetectionConfig || DEFAULT_DEATH_DETECTION_CONFIG,
  emailTemplate: customEmailTemplate || undefined,
  version: localVersion,
  updatedAt: localUpdatedAt
};

// 同步到云端
await firestoreService.setUserSettings(uid, localSettings);
```

## 数据结构

### Firestore 存储格式

**集合**: `userSettings/{uid}`

```typescript
{
  uid: string;
  language: string;
  deathDetectionConfig: {
    enabled: boolean;
    inactivityThreshold: number;
    hpThreshold: number;
    checkInterval: number;
  };
  emailTemplate: {                    // 邮件模板
    subject: string;                  // 主题
    htmlBody: string;                 // HTML 正文
    textBody: string;                 // 纯文本正文
  };
  version: number;
  updatedAt: number;
}
```

### 本地存储格式

**Storage Key**: `customEmailTemplate`

```typescript
{
  subject: string;
  htmlBody: string;
  textBody: string;
}
```

## 数据流程

### 首次登录流程

```
用户首次登录
    ↓
触发数据迁移 (migrateLocalDataToCloud)
    ↓
检查是否有自定义邮件模板
    ↓
┌─────────────┬─────────────┐
│ 有自定义    │ 无自定义    │
│ 使用自定义  │ 生成默认    │
└─────────────┴─────────────┘
    ↓
保存到本地 Storage
    ↓
上传到 Firestore (userSettings/{uid})
```

### 同步流程

```
定时同步 / 手动同步
    ↓
syncUserSettings() 执行
    ↓
读取本地邮件模板
    ↓
读取云端邮件模板
    ↓
比较 updatedAt 时间戳
    ↓
┌─────────────┬─────────────┬─────────────┐
│ 云端无数据  │ 本地更新    │ 云端更新    │
│ 上传本地    │ 上传本地    │ 下载云端    │
└─────────────┴─────────────┴─────────────┘
```

## Cloud Functions 使用

Cloud Functions 可以从 Firestore 读取用户的邮件模板：

```typescript
// 在 Cloud Functions 中
const userSettingsDoc = await db.collection('userSettings').doc(uid).get();
const userSettings = userSettingsDoc.data();

if (userSettings && userSettings.emailTemplate) {
  // 使用用户的自定义模板
  const template = userSettings.emailTemplate;
  const subject = renderTemplate(template.subject, variables);
  const htmlBody = renderTemplate(template.htmlBody, variables);
  const textBody = renderTemplate(template.textBody, variables);
} else {
  // 使用默认模板（后备方案）
  const template = getDefaultEmailTemplate(userSettings?.language || 'zh_CN');
  // ...
}
```

## 模板变量渲染

使用 `template-renderer.ts` 中的 `renderTemplate()` 函数：

```typescript
import { renderTemplate } from '../shared/utils/template-renderer';

const variables = {
  userName: '张三',
  inactiveDays: 7,
  lastActiveDate: '2025-01-14 10:30:00',
  currentDate: '2025-01-21 10:30:00',
  merit: 1500,
  hp: 30
};

const subject = renderTemplate(template.subject, variables);
// 结果: "⚠️ 重要通知：张三 已经 7 天没有活跃"
```

## 未来扩展：自定义邮件模板编辑器

如果需要让用户自定义邮件模板，可以：

1. 在 Options 页面添加"邮件模板编辑器"标签
2. 提供模板编辑界面（主题、HTML、纯文本）
3. 提供变量占位符说明
4. 提供预览功能
5. 保存时更新 `customEmailTemplate` 并触发同步

**示例组件结构**:
```
src/options/components/
  ├── EmailTemplateEditor.tsx    // 模板编辑器
  ├── EmailTemplateEditor.css
  └── EmailTemplatePreview.tsx   // 模板预览
```

## 默认模板特点

### 中文模板
- 使用中文标点和表达
- 适合中国用户的阅读习惯
- 包含完整的 HTML 样式

### 英文模板
- 使用英文标点和表达
- 适合国际用户
- 与中文模板保持相同的结构和样式

### 共同特点
- 响应式设计，适配移动设备
- 清晰的视觉层次
- 包含所有必要信息
- 友好的提示说明

## 测试步骤

### 1. 测试首次登录

1. 清除本地数据（或使用新账号）
2. 登录 Google 账号
3. 检查 Firestore Console
4. 验证 `userSettings/{uid}` 文档中包含 `emailTemplate` 字段

### 2. 测试同步

1. 修改本地邮件模板（通过 Storage）
2. 触发同步
3. 检查云端是否更新

### 3. 测试 Cloud Functions

1. 在 Cloud Functions 中读取 `userSettings/{uid}`
2. 验证可以获取 `emailTemplate`
3. 使用模板发送测试邮件

## 相关文件

### 新增文件
- `src/shared/services/email-template-service.ts` - 邮件模板服务

### 修改文件
- `src/shared/services/data-migration.ts` - 添加邮件模板迁移
- `src/shared/services/sync-service.ts` - 添加邮件模板同步
- `src/shared/services/firestore-service.ts` - 支持 emailTemplate 字段

### 相关文件
- `src/shared/templates/death-notification-email.ts` - 原有模板（可保留作为参考）
- `src/shared/utils/template-renderer.ts` - 模板渲染工具
- `src/options/components/EmailPreview.tsx` - 邮件预览组件

## 注意事项

1. **模板大小**: 邮件模板可能较大（HTML 内容），注意 Firestore 文档大小限制（1MB）
2. **变量安全**: 确保模板变量正确转义，防止 XSS 攻击
3. **后备方案**: Cloud Functions 应该有默认模板作为后备
4. **版本控制**: 使用 `version` 字段管理模板版本
5. **语言一致性**: 邮件模板语言应与用户语言设置一致

## 完成状态

- [x] 创建邮件模板服务
- [x] 更新数据迁移服务
- [x] 更新同步服务
- [x] 首次登录时生成默认模板
- [x] 同步邮件模板到云端
- [x] 构建验证通过
- [ ] 更新 Cloud Functions 代码（需要单独实现）
- [ ] 添加邮件模板编辑器（未来功能）

---

**完成时间**: 2026-01-21  
**版本**: v1.0.0
