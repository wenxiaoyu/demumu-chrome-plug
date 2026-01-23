# 后端开发需求：用户死亡状态检测定时任务

## 项目背景

"还活着吗"是一个 Chrome 扩展，用户通过敲击木鱼来证明自己还活着。如果用户长时间未活跃，系统需要自动检测并发送邮件通知给紧急联系人。

## 需求概述

开发一个 Firebase Cloud Function 定时任务，每天检查所有用户的死亡状态，并在检测到"死亡"时自动发送邮件通知。

---

## 技术栈

- **平台**: Firebase Cloud Functions (Node.js 16+)
- **语言**: TypeScript
- **数据库**: Firebase Firestore
- **邮件服务**: SendGrid
- **调度器**: Cloud Scheduler (Cron)

---

## 数据库结构

### 1. userData 集合（已存在）

**路径**: `userData/{uid}`

**字段说明**:
```typescript
interface UserData {
  uid: string;              // 用户 ID
  displayName?: string;     // 用户自定义显示名称
  totalKnocks: number;      // 总敲击次数
  todayKnocks: number;      // 今日敲击次数
  lastKnockTime: number;    // 最后敲击时间（毫秒时间戳）
  merit: number;            // 功德值
  hp: number;               // 生命值（HP）
  consecutiveDays: number;  // 连续天数
  status: 'alive' | 'dead'; // 状态
  updatedAt: number;        // 更新时间（毫秒时间戳）
}
```

**示例数据**:
```json
{
  "uid": "abc123",
  "displayName": "张三",
  "totalKnocks": 1500,
  "todayKnocks": 10,
  "lastKnockTime": 1704067200000,
  "merit": 1500,
  "hp": 50,
  "consecutiveDays": 15,
  "status": "alive",
  "updatedAt": 1704067200000
}
```

### 2. emergencyContacts 集合（已存在）

**路径**: `emergencyContacts/{uid}`

**字段说明**:
```typescript
interface EmergencyContactsData {
  uid: string;
  contacts: EmergencyContact[];
  version: number;
  updatedAt: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  priority: number;  // 优先级（数字越小优先级越高）
  relationship: string;
}
```

**示例数据**:
```json
{
  "uid": "abc123",
  "contacts": [
    {
      "id": "contact1",
      "name": "李四",
      "email": "lisi@example.com",
      "priority": 1,
      "relationship": "家人"
    },
    {
      "id": "contact2",
      "name": "王五",
      "email": "wangwu@example.com",
      "priority": 2,
      "relationship": "朋友"
    }
  ],
  "version": 1,
  "updatedAt": 1704067200000
}
```

### 3. deathNotifications 集合（需要创建）

**路径**: `deathNotifications/{uid}`

**字段说明**:
```typescript
interface DeathNotification {
  uid: string;
  isDead: boolean;
  reason: string;
  detectedAt: number;
  emailSent: boolean;
  emailSentAt?: number;
  emailRecipients?: string[];
  emailStatus?: 'pending' | 'sent' | 'failed';
  emailError?: string;
  lastCheckedAt: number;
}
```

**用途**: 记录每个用户的死亡检测结果和邮件发送状态

### 4. emailLogs 集合（需要创建）

**路径**: `emailLogs/{logId}`

**字段说明**:
```typescript
interface EmailLog {
  id: string;
  uid: string;
  recipients: string[];
  subject: string;
  sentAt: number;
  status: 'sent' | 'failed';
  error?: string;
  sendGridMessageId?: string;
}
```

**用途**: 记录所有邮件发送历史，便于调试和审计

---

## 死亡检测规则

### 核心概念说明

#### HP（生命值）机制

**定义**: HP 是用户的"生命值"，范围 0-100，代表用户的活跃健康状态。

**变化规则**:
- **增加**: 每天首次敲击木鱼 +10 HP（最大 100）
- **减少**: 每天不敲击木鱼 -10 HP（最小 0）

**重要**: HP 是动态计算的，不能直接使用 `userData.hp` 字段！

**动态计算公式**:
```typescript
const daysDiff = Math.floor(
  (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
);
const actualHP = userData.hp - (daysDiff * 10);
const finalHP = Math.max(0, actualHP);
```

**示例**:
- 用户最后敲击时 HP = 100
- 5 天后查询：实际 HP = 100 - (5 × 10) = 50
- 10 天后查询：实际 HP = 100 - (10 × 10) = 0

#### 未活跃天数

**定义**: 从最后一次敲击木鱼到现在经过的天数。

**计算方式**:
```typescript
const inactiveDays = Math.floor(
  (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
);
```

#### HP 与未活跃天数的关系

- **因果关系**: 不活跃天数增加 → HP 减少
- **独立判定**: 两者都可以独立触发死亡判定
- **双重保险**: OR 关系，满足任意一个即判定为死亡

---

### 规则 1: HP 检测

**条件**: `实际 HP <= 0`

**判定**: 用户死亡

**原因**: "HP 低于阈值 (当前HP <= 0)"

**触发时间**: 约 10 天不活跃

**完整代码**:
```typescript
// ⚠️ 重要：必须动态计算 HP，不能直接使用 userData.hp
const daysDiff = Math.floor(
  (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
);
const actualHP = Math.max(0, userData.hp - (daysDiff * 10));

if (actualHP <= 0) {
  return {
    isDead: true,
    reason: `HP 低于阈值 (${actualHP} <= 0)`
  };
}
```

---

### 规则 2: 未活跃天数检测

**条件**: `未活跃天数 >= 30 天`

**判定**: 用户死亡

**原因**: "未活跃天数超过阈值 (当前天数 >= 30)"

**触发时间**: 30 天不活跃

**完整代码**:
```typescript
const inactiveDays = Math.floor(
  (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
);

if (inactiveDays >= 30) {
  return {
    isDead: true,
    reason: `未活跃天数超过阈值 (${inactiveDays} >= 30)`
  };
}
```

---

### 规则优先级

两个规则是 **OR** 关系，满足任意一个即判定为死亡。

```typescript
if (actualHP <= 0 || inactiveDays >= 30) {
  // 判定为死亡
}
```

**为什么需要两个规则？**

1. **规则 1（HP）**: 更快速的预警（10 天），游戏化设计
2. **规则 2（活跃天数）**: 更保守的判定（30 天），防止边界情况
3. **双重保险**: 确保长期不活跃一定会被检测到

---

### 完整检测函数示例

```typescript
function checkUserDeathStatus(userData: any): {
  isDead: boolean;
  reason: string;
} {
  const config = {
    hpThreshold: 0,
    inactivityThreshold: 30
  };
  
  // 计算未活跃天数
  const daysDiff = Math.floor(
    (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
  );
  
  // 规则 1: 动态计算 HP 并检测
  const actualHP = Math.max(0, userData.hp - (daysDiff * 10));
  
  if (actualHP <= config.hpThreshold) {
    return {
      isDead: true,
      reason: `HP 低于阈值 (${actualHP} <= ${config.hpThreshold})`
    };
  }
  
  // 规则 2: 检查未活跃天数
  const inactiveDays = daysDiff;
  
  if (inactiveDays >= config.inactivityThreshold) {
    return {
      isDead: true,
      reason: `未活跃天数超过阈值 (${inactiveDays} >= ${config.inactivityThreshold})`
    };
  }
  
  return {
    isDead: false,
    reason: '状态正常'
  };
}
```

---

### 检测配置（当前硬编码）

```typescript
const config = {
  hpThreshold: 0,           // HP 阈值
  inactivityThreshold: 30,  // 未活跃天数阈值（天）
  dailyPenalty: 10          // 每天 HP 惩罚
};
```

**注意**: 未来可能从 Firestore 读取配置，当前使用硬编码值。

---

## 定时任务规格

### 执行频率

**Cron 表达式**: `'0 0 * * *'`

**执行时间**: 每天 UTC 0:00（北京时间 8:00）

**时区**: `Asia/Shanghai`

**区域**: `asia-east1`（台湾，离中国大陆用户最近）

### 执行流程

```
1. 查询所有用户数据（userData 集合）
   ↓
2. 遍历每个用户
   ↓
3. 对每个用户执行死亡检测
   ├─ 检查 HP 是否 <= 0
   └─ 检查未活跃天数是否 >= 30
   ↓
4. 保存检测结果到 deathNotifications 集合
   ↓
5. 如果用户死亡 AND 未发送过邮件
   ↓
6. 触发邮件发送
```

### 防重复发送逻辑

**检查条件**:
```typescript
const notification = await db.collection('deathNotifications').doc(uid).get();
const notificationData = notification.data();

if (notificationData?.emailSent === true) {
  // 已发送过，跳过
  return;
}
```

**重置条件**: 当用户恢复活跃（再次敲击木鱼）时，客户端会重置 `emailSent` 标记。

---

## 邮件发送规格

### SendGrid 配置

**API Key 存储**: Firebase Functions Config

**配置命令**:
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

**代码中获取**:
```typescript
const sendGridKey = functions.config().sendgrid.key;
```

### 收件人选择

**规则**: 按优先级排序，取前 5 个联系人

**代码实现**:
```typescript
const contacts = contactsData.contacts
  .sort((a, b) => a.priority - b.priority)
  .slice(0, 5);

const recipients = contacts.map(c => c.email);
```

### 邮件内容

#### 主题（Subject）

**中文**: `⚠️ 重要通知：{userName} 已经 {inactiveDays} 天没有活跃`

**英文**: `⚠️ Important Notice: {userName} has been inactive for {inactiveDays} days`

**变量**:
- `userName`: 从 `userData.displayName` 获取，如果为空则使用 "用户"
- `inactiveDays`: 计算得出的未活跃天数

#### 邮件正文变量

```typescript
interface EmailVariables {
  userName: string;        // 用户显示名称
  inactiveDays: number;    // 未活跃天数
  lastActiveDate: string;  // 最后活跃时间（格式化）
  currentDate: string;     // 当前检测时间（格式化）
  merit: number;           // 功德值
  hp: number;              // 生命值
}
```

**日期格式化**:
```typescript
const lastActiveDate = new Date(userData.lastKnockTime).toLocaleString('zh-CN');
const currentDate = new Date().toLocaleString('zh-CN');
```

#### 邮件模板

**纯文本版本**:
```
⚠️ 重要通知

您好，

我们注意到 {userName} 已经 {inactiveDays} 天没有活跃了。
根据预先设定的规则，系统判定可能需要您的关注。

详细信息：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
最后活跃时间：{lastActiveDate}
检测时间：{currentDate}
未活跃天数：{inactiveDays} 天
功德值：{merit}
生命值：{hp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 这是什么？
这是一封自动发送的关怀提醒邮件。如果一切正常，请忽略此邮件。
如果您担心对方的安全，建议尽快联系确认。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
此邮件由"还活着吗"扩展自动发送
© 2025 还活着吗 | 关心每一个生命
```

**HTML 版本**: 见附录 A（包含完整的 HTML 模板）

### 发件人配置

**发件人邮箱**: `noreply@alive-checker.com`

**注意**: 需要在 SendGrid 中验证此邮箱，或使用 SendGrid 提供的默认发件人。

### SendGrid API 调用

```typescript
const msg = {
  to: recipients,                    // 收件人列表
  from: 'noreply@alive-checker.com', // 发件人
  subject: emailContent.subject,     // 主题
  text: emailContent.textBody,       // 纯文本正文
  html: emailContent.htmlBody        // HTML 正文
};

const response = await sgMail.sendMultiple(msg);
```

---

## 数据库操作

### 1. 查询所有用户

```typescript
const db = admin.firestore();
const usersSnapshot = await db.collection('userData').get();

usersSnapshot.docs.forEach(doc => {
  const userData = doc.data();
  const uid = doc.id;
  // 处理每个用户
});
```

### 2. 保存检测结果

```typescript
await db.collection('deathNotifications').doc(uid).set({
  uid,
  isDead: deathStatus.isDead,
  reason: deathStatus.reason,
  detectedAt: Date.now(),
  lastCheckedAt: Date.now(),
  emailSent: false
}, { merge: true });  // 使用 merge 避免覆盖已有字段
```

### 3. 获取紧急联系人

```typescript
const contactsDoc = await db.collection('emergencyContacts').doc(uid).get();
const contactsData = contactsDoc.data();

if (!contactsData || !contactsData.contacts || contactsData.contacts.length === 0) {
  console.log(`No emergency contacts found for user ${uid}`);
  return;
}
```

### 4. 更新邮件发送状态

```typescript
await db.collection('deathNotifications').doc(uid).update({
  emailSent: true,
  emailSentAt: Date.now(),
  emailRecipients: recipients,
  emailStatus: 'sent'
});
```

### 5. 记录邮件日志

```typescript
await db.collection('emailLogs').add({
  uid,
  recipients,
  subject: emailContent.subject,
  sentAt: Date.now(),
  status: 'sent',
  sendGridMessageId: response[0].headers['x-message-id']
});
```

---

## 错误处理

### 1. 邮件发送失败

```typescript
try {
  await sgMail.sendMultiple(msg);
  // 成功处理
} catch (error) {
  console.error(`[SendEmail] Failed to send email for user ${uid}:`, error);
  
  // 记录失败状态
  await db.collection('deathNotifications').doc(uid).update({
    emailStatus: 'failed',
    emailError: error.message
  });
  
  // 记录失败日志
  await db.collection('emailLogs').add({
    uid,
    recipients: [],
    subject: '',
    sentAt: Date.now(),
    status: 'failed',
    error: error.message
  });
}
```

### 2. 无紧急联系人

```typescript
if (!contactsData || !contactsData.contacts || contactsData.contacts.length === 0) {
  console.log(`[SendEmail] No emergency contacts found for user ${uid}`);
  return;  // 直接返回，不发送邮件
}
```

### 3. 数据库操作失败

```typescript
try {
  const usersSnapshot = await db.collection('userData').get();
  // 处理数据
} catch (error) {
  console.error('[CheckUsers] Failed to fetch users:', error);
  throw error;  // 让 Cloud Functions 重试
}
```

---

## 日志规范

### 日志级别

- `console.log()`: 普通信息
- `console.warn()`: 警告信息
- `console.error()`: 错误信息

### 日志格式

**推荐格式**: `[模块名] 消息内容`

**示例**:
```typescript
console.log('[CheckUsers] Starting check for all users');
console.log(`[CheckUsers] Found ${usersSnapshot.size} users`);
console.log(`[CheckUsers] User ${uid}: isDead=${deathStatus.isDead}`);
console.log(`[SendEmail] Sending to ${recipients.length} recipients`);
console.log(`[SendEmail] Email sent successfully, message ID: ${messageId}`);
console.error(`[SendEmail] Failed to send email:`, error);
```

### 关键日志点

1. 函数开始执行
2. 查询到的用户数量
3. 每个用户的检测结果
4. 邮件发送触发
5. 邮件发送成功/失败
6. 函数执行完成

---

## 性能要求

### 执行时间

- **目标**: < 60 秒
- **最大**: 540 秒（9 分钟，Cloud Functions 最大限制）

### 并发处理

**推荐**: 使用 `Promise.all()` 并行处理用户

```typescript
const checkPromises = usersSnapshot.docs.map(async (doc) => {
  // 处理单个用户
});

await Promise.all(checkPromises);
```

### 内存限制

**默认**: 256MB

**如果需要更多**: 在函数配置中指定

```typescript
export const checkAllUsersStatus = functions
  .runWith({
    memory: '512MB',  // 或 '1GB'
    timeoutSeconds: 300
  })
  .pubsub.schedule('0 0 * * *')
  // ...
```

---

## 安全要求

### 1. Firestore Security Rules

确保 Cloud Functions 可以访问所有集合：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户数据：用户只能访问自己的，Cloud Functions 可以访问所有
    match /userData/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read, write: if request.auth.token.admin == true;
    }
    
    // 紧急联系人：同上
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read, write: if request.auth.token.admin == true;
    }
    
    // 死亡通知：用户只读，Cloud Functions 可写
    match /deathNotifications/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.token.admin == true;
    }
    
    // 邮件日志：用户只读，Cloud Functions 可写
    match /emailLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

### 2. SendGrid API Key 安全

- ✅ 使用 Firebase Functions Config 存储
- ❌ 不要硬编码在代码中
- ❌ 不要提交到 Git

### 3. 邮件内容安全

- ✅ 不包含用户密码或敏感信息
- ✅ 只包含公开的用户信息（显示名称、统计数据）
- ✅ 邮件内容温和，不使用"死亡"等敏感词

---

## 测试要求

### 1. 单元测试

测试死亡检测逻辑：

```typescript
// 测试 HP 检测
const userData1 = { hp: 0, lastKnockTime: Date.now() };
const result1 = checkUserDeathStatus(userData1);
assert(result1.isDead === true);

// 测试未活跃天数检测
const userData2 = { 
  hp: 100, 
  lastKnockTime: Date.now() - 31 * 24 * 60 * 60 * 1000 
};
const result2 = checkUserDeathStatus(userData2);
assert(result2.isDead === true);

// 测试正常用户
const userData3 = { hp: 100, lastKnockTime: Date.now() };
const result3 = checkUserDeathStatus(userData3);
assert(result3.isDead === false);
```

### 2. 集成测试

1. 创建测试用户数据
2. 手动触发函数
3. 验证 deathNotifications 集合更新
4. 验证邮件发送（使用测试邮箱）
5. 验证 emailLogs 记录

### 3. 手动测试步骤

```bash
# 1. 部署函数
firebase deploy --only functions:checkAllUsersStatus

# 2. 在 Firebase Console 手动触发

# 3. 查看日志
firebase functions:log --only checkAllUsersStatus

# 4. 检查 Firestore 数据
# 访问 Firebase Console > Firestore Database
# 查看 deathNotifications 和 emailLogs 集合

# 5. 检查邮件
# 查看测试邮箱是否收到邮件
```

---

## 部署清单

### 部署前检查

- [ ] Firebase CLI 已安装并登录
- [ ] SendGrid API Key 已配置
- [ ] 代码已通过 TypeScript 编译
- [ ] 依赖已安装（firebase-admin, @sendgrid/mail）
- [ ] 区域设置为 asia-east1
- [ ] Cron 表达式正确
- [ ] 时区设置为 Asia/Shanghai

### 部署命令

```bash
# 部署所有函数
firebase deploy --only functions

# 仅部署检查函数
firebase deploy --only functions:checkAllUsersStatus

# 查看部署状态
firebase functions:list
```

### 部署后验证

- [ ] 函数在 Firebase Console 中可见
- [ ] Cloud Scheduler 任务已创建
- [ ] 手动触发测试成功
- [ ] 日志正常输出
- [ ] 测试邮件发送成功

---

## 监控和维护

### 1. 日志监控

```bash
# 实时查看日志
firebase functions:log

# 查看特定函数日志
firebase functions:log --only checkAllUsersStatus

# 在 Firebase Console 查看
# Functions > Logs
```

### 2. 性能监控

在 Firebase Console 查看：
- 执行次数
- 执行时间
- 错误率
- 内存使用

### 3. 成本监控

- Cloud Functions 调用次数
- SendGrid 邮件发送量
- Firestore 读写次数

### 4. 告警设置（可选）

在 Firebase Console 设置告警：
- 函数执行失败
- 执行时间超过阈值
- 错误率超过阈值

---

## 附录 A: HTML 邮件模板

见 `CLOUD_FUNCTIONS_GUIDE.md` 中的完整 HTML 模板代码。

---

## 附录 B: 完整代码示例

见 `CLOUD_FUNCTIONS_GUIDE.md` 中的完整函数实现。

---

## 联系方式

如有技术问题，请联系：
- 项目负责人：[你的联系方式]
- 技术文档：`CLOUD_FUNCTIONS_GUIDE.md`
- 项目规格：`openspec/changes/phase-1-mvp-local/m7-auth-sync/spec.md`

---

**祝开发顺利！🚀**
