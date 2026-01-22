# Firestore 数据库结构设计

## 概述

本文档详细说明了"还活着吗"扩展的 Firestore 数据库结构，包括所有集合、文档格式和字段说明。

## 数据库架构图

```
Firebase Firestore
├── users/{uid}                          # 用户基本信息
├── userData/{uid}                       # 用户游戏数据
├── userSettings/{uid}                   # 用户配置（包含多语言邮件模板）⭐
├── emergencyContacts/{uid}              # 紧急联系人
├── knockRecords/{uid}/records/{id}      # 敲击记录（子集合）
├── dailyStats/{uid}/stats/{date}        # 每日统计（子集合）
├── deathNotifications/{uid}             # 死亡检测结果（Cloud Functions 使用）
└── emailLogs/{logId}                    # 邮件发送日志（Cloud Functions 使用）
```

---

## 1. users 集合

**路径**: `users/{uid}`

**用途**: 存储用户基本信息

**字段**:

| 字段        | 类型   | 必需 | 说明                              |
| ----------- | ------ | ---- | --------------------------------- |
| uid         | string | ✅   | 用户唯一标识（Firebase Auth UID） |
| email       | string | ✅   | 用户邮箱                          |
| displayName | string | ✅   | 用户显示名称                      |
| photoURL    | string | ❌   | 用户头像 URL                      |
| createdAt   | number | ✅   | 创建时间（毫秒时间戳）            |
| lastSyncAt  | number | ✅   | 最后同步时间（毫秒时间戳）        |

**示例数据**:

```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "displayName": "张三",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "createdAt": 1704067200000,
  "lastSyncAt": 1704153600000
}
```

**访问权限**:

```javascript
match /users/{uid} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == uid;
}
```

---

## 2. userData 集合

**路径**: `userData/{uid}`

**用途**: 存储用户游戏数据（HP、功德值等）

**字段**:

| 字段            | 类型   | 必需 | 说明                           |
| --------------- | ------ | ---- | ------------------------------ |
| uid             | string | ✅   | 用户唯一标识                   |
| displayName     | string | ❌   | 用户自定义显示名称（用于邮件） |
| totalKnocks     | number | ✅   | 总敲击次数                     |
| todayKnocks     | number | ✅   | 今日敲击次数                   |
| lastKnockTime   | number | ✅   | 最后敲击时间（毫秒时间戳）     |
| merit           | number | ✅   | 功德值                         |
| hp              | number | ✅   | 生命值（0-100）                |
| consecutiveDays | number | ✅   | 连续活跃天数                   |
| status          | string | ✅   | 状态（'alive' 或 'dead'）      |
| updatedAt       | number | ✅   | 更新时间（毫秒时间戳）         |

**示例数据**:

```json
{
  "uid": "abc123xyz",
  "displayName": "张三",
  "totalKnocks": 1500,
  "todayKnocks": 10,
  "lastKnockTime": 1704067200000,
  "merit": 1500,
  "hp": 80,
  "consecutiveDays": 15,
  "status": "alive",
  "updatedAt": 1704067200000
}
```

**访问权限**:

```javascript
match /userData/{uid} {
  allow read, write: if request.auth.uid == uid;
}
```

---

## 3. userSettings 集合 ⭐

**路径**: `userSettings/{uid}`

**用途**: 存储用户配置，包括语言偏好、死亡检测配置和**多语言邮件模板**

**字段**:

| 字段                 | 类型   | 必需 | 说明                        |
| -------------------- | ------ | ---- | --------------------------- |
| uid                  | string | ✅   | 用户唯一标识                |
| language             | string | ✅   | 语言偏好（'zh_CN' 或 'en'） |
| deathDetectionConfig | object | ✅   | 死亡检测配置                |
| emailTemplate        | object | ❌   | 多语言邮件模板（中英文）    |
| version              | number | ✅   | 配置版本号                  |
| updatedAt            | number | ✅   | 更新时间（毫秒时间戳）      |

**deathDetectionConfig 结构**:

```typescript
{
  enabled: boolean // 是否启用检测
  inactivityThreshold: number // 未活跃天数阈值（默认 30）
  hpThreshold: number // HP 阈值（默认 0）
  checkInterval: number // 检查间隔（分钟，默认 60）
}
```

**emailTemplate 结构（多语言）**:

```typescript
{
  zh_CN: {
    subject: string;    // 中文邮件主题
    htmlBody: string;   // 中文 HTML 正文
    textBody: string;   // 中文纯文本正文
  },
  en: {
    subject: string;    // 英文邮件主题
    htmlBody: string;   // 英文 HTML 正文
    textBody: string;   // 英文纯文本正文
  }
}
```

**完整示例数据**:

```json
{
  "uid": "abc123xyz",
  "language": "zh_CN",
  "deathDetectionConfig": {
    "enabled": true,
    "inactivityThreshold": 30,
    "hpThreshold": 0,
    "checkInterval": 60
  },
  "emailTemplate": {
    "zh_CN": {
      "subject": "⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃",
      "htmlBody": "<!DOCTYPE html>...",
      "textBody": "⚠️ 重要通知\n\n您好，..."
    },
    "en": {
      "subject": "⚠️ Important Notice: {{userName}} has been inactive for {{inactiveDays}} days",
      "htmlBody": "<!DOCTYPE html>...",
      "textBody": "⚠️ Important Notice\n\nHello,..."
    }
  },
  "version": 1,
  "updatedAt": 1704067200000
}
```

**邮件模板变量**:

模板中可以使用以下占位符：

| 变量                 | 说明         | 示例                |
| -------------------- | ------------ | ------------------- |
| `{{userName}}`       | 用户显示名称 | 张三                |
| `{{inactiveDays}}`   | 未活跃天数   | 7                   |
| `{{lastActiveDate}}` | 最后活跃时间 | 2024-01-15 10:30:00 |
| `{{currentDate}}`    | 当前检测时间 | 2024-01-22 14:20:00 |
| `{{merit}}`          | 功德值       | 1500                |
| `{{hp}}`             | 生命值       | 20                  |

**访问权限**:

```javascript
match /userSettings/{uid} {
  allow read, write: if request.auth.uid == uid;
}
```

**重要说明**:

1. **多语言支持**: `emailTemplate` 字段包含中英文两个版本的模板
2. **可选字段**: `emailTemplate` 是可选的，如果用户没有自定义，系统会使用默认模板
3. **模板渲染**: 发送邮件时，根据用户的 `language` 设置选择对应语言的模板
4. **变量替换**: 模板中的 `{{变量名}}` 会在发送时被实际值替换

---

## 4. emergencyContacts 集合

**路径**: `emergencyContacts/{uid}`

**用途**: 存储用户的紧急联系人列表

**字段**:

| 字段      | 类型   | 必需 | 说明                   |
| --------- | ------ | ---- | ---------------------- |
| uid       | string | ✅   | 用户唯一标识           |
| contacts  | array  | ✅   | 联系人列表             |
| version   | number | ✅   | 数据版本号             |
| updatedAt | number | ✅   | 更新时间（毫秒时间戳） |

**contacts 数组元素结构**:

```typescript
{
  id: string // 联系人唯一标识
  name: string // 姓名
  email: string // 邮箱地址
  relationship: string // 关系（如：家人、朋友）
  priority: number // 优先级（1-5，1 最高）
  createdAt: number // 创建时间
  updatedAt: number // 更新时间
}
```

**示例数据**:

```json
{
  "uid": "abc123xyz",
  "contacts": [
    {
      "id": "contact_001",
      "name": "李四",
      "email": "lisi@example.com",
      "relationship": "家人",
      "priority": 1,
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    },
    {
      "id": "contact_002",
      "name": "王五",
      "email": "wangwu@example.com",
      "relationship": "朋友",
      "priority": 2,
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    }
  ],
  "version": 1,
  "updatedAt": 1704067200000
}
```

**访问权限**:

```javascript
match /emergencyContacts/{uid} {
  allow read, write: if request.auth.uid == uid;
}
```

---

## 5. knockRecords 子集合

**路径**: `knockRecords/{uid}/records/{recordId}`

**用途**: 存储用户的敲击记录

**字段**:

| 字段            | 类型   | 必需 | 说明                   |
| --------------- | ------ | ---- | ---------------------- |
| id              | string | ✅   | 记录唯一标识           |
| timestamp       | number | ✅   | 敲击时间（毫秒时间戳） |
| merit           | number | ✅   | 本次获得的功德值       |
| totalMerit      | number | ✅   | 敲击时的总功德值       |
| hp              | number | ✅   | 敲击时的 HP            |
| consecutiveDays | number | ✅   | 敲击时的连续天数       |

**示例数据**:

```json
{
  "id": "knock_1704067200000_abc",
  "timestamp": 1704067200000,
  "merit": 1,
  "totalMerit": 1500,
  "hp": 80,
  "consecutiveDays": 15
}
```

**访问权限**:

```javascript
match /knockRecords/{uid}/records/{recordId} {
  allow read, write: if request.auth.uid == uid;
}
```

---

## 6. dailyStats 子集合

**路径**: `dailyStats/{uid}/stats/{date}`

**用途**: 存储用户的每日统计数据

**字段**:

| 字段   | 类型   | 必需 | 说明               |
| ------ | ------ | ---- | ------------------ |
| date   | string | ✅   | 日期（YYYY-MM-DD） |
| knocks | number | ✅   | 当日敲击次数       |
| merit  | number | ✅   | 当日获得功德值     |
| hp     | number | ✅   | 当日结束时的 HP    |

**示例数据**:

```json
{
  "date": "2024-01-15",
  "knocks": 50,
  "merit": 50,
  "hp": 80
}
```

**访问权限**:

```javascript
match /dailyStats/{uid}/stats/{date} {
  allow read, write: if request.auth.uid == uid;
}
```

---

## 7. deathNotifications 集合（Cloud Functions 使用）

**路径**: `deathNotifications/{uid}`

**用途**: 存储死亡检测结果和邮件发送状态

**字段**:

| 字段            | 类型    | 必需 | 说明                                    |
| --------------- | ------- | ---- | --------------------------------------- |
| uid             | string  | ✅   | 用户唯一标识                            |
| isDead          | boolean | ✅   | 是否判定为死亡                          |
| reason          | string  | ✅   | 死亡原因                                |
| detectedAt      | number  | ✅   | 检测时间（毫秒时间戳）                  |
| emailSent       | boolean | ✅   | 是否已发送邮件                          |
| emailSentAt     | number  | ❌   | 邮件发送时间                            |
| emailRecipients | array   | ❌   | 收件人列表                              |
| emailStatus     | string  | ❌   | 邮件状态（'pending', 'sent', 'failed'） |
| emailError      | string  | ❌   | 邮件发送错误信息                        |
| lastCheckedAt   | number  | ✅   | 最后检查时间                            |

**示例数据**:

```json
{
  "uid": "abc123xyz",
  "isDead": true,
  "reason": "HP 低于阈值 (0 <= 0)",
  "detectedAt": 1704067200000,
  "emailSent": true,
  "emailSentAt": 1704067260000,
  "emailRecipients": ["lisi@example.com", "wangwu@example.com"],
  "emailStatus": "sent",
  "lastCheckedAt": 1704067200000
}
```

**访问权限**:

```javascript
match /deathNotifications/{uid} {
  allow read: if request.auth.uid == uid;
  allow write: if request.auth.token.admin == true; // 仅 Cloud Functions
}
```

---

## 8. emailLogs 集合（Cloud Functions 使用）

**路径**: `emailLogs/{logId}`

**用途**: 记录所有邮件发送历史

**字段**:

| 字段              | 类型   | 必需 | 说明                       |
| ----------------- | ------ | ---- | -------------------------- |
| id                | string | ✅   | 日志唯一标识               |
| uid               | string | ✅   | 用户唯一标识               |
| recipients        | array  | ✅   | 收件人列表                 |
| subject           | string | ✅   | 邮件主题                   |
| sentAt            | number | ✅   | 发送时间（毫秒时间戳）     |
| status            | string | ✅   | 状态（'sent' 或 'failed'） |
| error             | string | ❌   | 错误信息（如果失败）       |
| sendGridMessageId | string | ❌   | SendGrid 消息 ID           |

**示例数据**:

```json
{
  "id": "log_1704067260000_xyz",
  "uid": "abc123xyz",
  "recipients": ["lisi@example.com", "wangwu@example.com"],
  "subject": "⚠️ 重要通知：张三 已经 10 天没有活跃",
  "sentAt": 1704067260000,
  "status": "sent",
  "sendGridMessageId": "abc123xyz"
}
```

**访问权限**:

```javascript
match /emailLogs/{logId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true; // 仅 Cloud Functions
}
```

---

## 完整的 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 用户基本信息
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // 用户游戏数据
    match /userData/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // 用户配置（包含多语言邮件模板）⭐
    match /userSettings/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // 紧急联系人
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // 敲击记录（子集合）
    match /knockRecords/{uid}/records/{recordId} {
      allow read, write: if request.auth.uid == uid;
    }

    // 每日统计（子集合）
    match /dailyStats/{uid}/stats/{date} {
      allow read, write: if request.auth.uid == uid;
    }

    // 死亡通知（Cloud Functions 使用）
    match /deathNotifications/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.token.admin == true;
    }

    // 邮件日志（Cloud Functions 使用）
    match /emailLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 数据同步策略

### 双向同步的集合

以下集合支持本地 ↔ 云端双向同步（基于 `updatedAt` 时间戳）：

1. **userData** - 用户游戏数据
2. **userSettings** - 用户配置（包含多语言邮件模板）⭐
3. **emergencyContacts** - 紧急联系人

### 仅上传的集合

以下集合仅从本地上传到云端（不下载）：

1. **knockRecords** - 敲击记录
2. **dailyStats** - 每日统计

### 仅云端的集合

以下集合仅由 Cloud Functions 写入：

1. **deathNotifications** - 死亡检测结果
2. **emailLogs** - 邮件发送日志

---

## 数据迁移

### 首次登录迁移

当用户首次登录时，会自动将本地数据迁移到云端：

1. 检查 `dataMigrated` 标记
2. 如果未迁移，执行以下步骤：
   - 上传 userData
   - 上传 userSettings（包含多语言邮件模板）⭐
   - 上传 emergencyContacts
   - 上传最近 100 条 knockRecords
   - 上传最近 30 天 dailyStats
3. 标记 `dataMigrated = true`

### 旧数据迁移

如果用户有旧的单语言邮件模板，会自动转换为多语言格式：

```typescript
// 检测旧模板
const oldTemplate = await storage.get<EmailTemplate>('customEmailTemplate')

if (oldTemplate && oldTemplate.subject) {
  // 转换为多语言格式
  const multiLangTemplate = {
    zh_CN: language === 'zh_CN' ? oldTemplate : defaultZhTemplate,
    en: language === 'en' ? oldTemplate : defaultEnTemplate,
  }

  await storage.set('customEmailTemplate', multiLangTemplate)
}
```

---

## 存储成本估算

### 免费额度（Spark Plan）

- **存储**: 1 GB
- **读取**: 50,000 次/天
- **写入**: 20,000 次/天
- **删除**: 20,000 次/天

### 单用户数据大小估算

| 集合              | 文档大小 | 数量 | 总计            |
| ----------------- | -------- | ---- | --------------- |
| users             | ~500 B   | 1    | 500 B           |
| userData          | ~300 B   | 1    | 300 B           |
| userSettings      | ~10 KB   | 1    | 10 KB ⭐        |
| emergencyContacts | ~1 KB    | 1    | 1 KB            |
| knockRecords      | ~200 B   | 100  | 20 KB           |
| dailyStats        | ~100 B   | 30   | 3 KB            |
| **总计**          |          |      | **~35 KB/用户** |

**注意**: `userSettings` 包含多语言邮件模板，大小约 10 KB（中英文 HTML 模板）

### 1000 用户估算

- **存储**: 35 MB（远低于 1 GB 限制）
- **每日读取**: ~5000 次（远低于 50K 限制）
- **每日写入**: ~2000 次（远低于 20K 限制）

**结论**: 1000 用户以内完全在免费额度内 ✅

---

## 相关文档

- [Firebase 设置指南](./FIREBASE_SETUP_GUIDE.md)
- [Firestore 安全规则更新](./FIRESTORE_SECURITY_RULES_UPDATE.md)
- [多语言邮件模板实现](../features/MULTI_LANGUAGE_EMAIL_TEMPLATE.md)
- [用户配置同步完成](../features/USER_SETTINGS_SYNC_COMPLETION.md)
- [后端需求文档](../development/BACKEND_REQUIREMENTS.md)

---

**最后更新**: 2025-01-22
