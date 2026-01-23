# M7：用户认证与云端同步

## 目标

实现 Google 账号登录和云端数据同步功能，为邮件通知提供必要的用户认证基础。未登录用户数据存储在本地，登录后数据同步到云端。

**里程碑价值：** 
- 为邮件发送功能提供用户身份验证
- 实现数据云端备份和多设备同步
- 为后续社交功能打下基础

## 时间估算

**计划：5 天**

- Firebase 项目设置和配置（0.5 天）
- Google 登录集成（1 天）
- 数据同步服务（1 天）
- UI 集成和登录提示（0.3 天）
- 邮件发送集成（0.2 天）
- **云端死亡检测和邮件通知（2 天）**
  - 邮件服务集成（SendGrid/Mailgun）（0.5 天）
  - Cloud Functions 开发（1 天）
  - 测试和调试（0.5 天）
- 测试和优化（1 天）

## 范围

### 包含
- ✅ Firebase 项目设置
- ✅ Google 账号登录（Firebase Authentication）
- ✅ 用户数据云端存储（Firestore）
- ✅ 本地数据迁移到云端
- ✅ 数据双向同步（本地 ↔ 云端）
- ✅ 登录状态管理
- ✅ 登录提示和引导
- ✅ 离线模式支持

### 不包含
- ❌ 邮箱密码登录（仅 Google 登录）
- ❌ 好友系统（M8 或阶段 3）
- ❌ 排行榜（M8 或阶段 3）
- ❌ 社交功能（阶段 3）

### 新增功能（云端死亡检测）
- ✅ Firebase Cloud Functions 定时检查用户状态
- ✅ 自动检测用户是否"死亡"（基于 HP 和未活跃天数）
- ✅ 自动发送邮件通知给紧急联系人
- ✅ 使用真实邮件服务（SendGrid/Mailgun/Gmail SMTP）
- ✅ 防止重复发送（记录发送状态）
- ✅ 邮件发送历史记录

## 详细设计

### 1. 技术方案

#### 1.1 技术栈选择

**Firebase + Firestore（推荐方案）**

**优势：**
- **零后端开发**：使用 Firebase SDK 直接操作，无需编写后端代码
- **实时同步**：Firestore 提供实时数据同步
- **免费额度充足**：
  - Authentication: 无限用户
  - Firestore: 1GB 存储 + 50K 读取/天 + 20K 写入/天
  - 对于 1000 用户以内完全免费
- **安全规则**：通过 Firestore Security Rules 控制数据访问
- **官方支持**：Google 官方维护，文档完善

**成本估算（月）：**
- 0-1000 用户：$0（免费额度内）
- 1000-5000 用户：$5-20
- 5000+ 用户：按需付费


#### 1.2 Firebase 项目结构

```
Firebase Project: alive-checker
├── Authentication
│   └── Google Sign-In Provider
├── Firestore Database
│   ├── users/              # 用户基本信息
│   ├── userData/           # 用户数据（HP、功德值等）
│   ├── knockRecords/       # 敲击记录
│   ├── dailyStats/         # 每日统计
│   └── emergencyContacts/  # 紧急联系人
└── Security Rules          # 数据访问控制
```

#### 1.3 数据模型设计

```typescript
// Firestore Collections

// users/{uid}
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastSyncAt: number;
}

// userData/{uid}
interface UserData {
  uid: string;
  totalKnocks: number;
  todayKnocks: number;
  lastKnockTime: number;
  merit: number;
  hp: number;
  consecutiveDays: number;
  status: 'alive' | 'dead';
  updatedAt: number;
}

// knockRecords/{uid}/records/{recordId}
interface KnockRecord {
  id: string;
  timestamp: number;
  merit: number;
  hp: number;
  consecutiveDays: number;
}

// dailyStats/{uid}/stats/{date}
interface DailyStats {
  date: string; // YYYY-MM-DD
  knocks: number;
  merit: number;
  hp: number;
}

// emergencyContacts/{uid}
interface EmergencyContactsData {
  uid: string;
  contacts: EmergencyContact[];
  version: number;
  updatedAt: number;
}
```

### 2. 用户认证流程

#### 2.1 Google 登录流程

```typescript
// 登录流程
1. 用户点击"使用 Google 登录"按钮
2. 调用 Firebase signInWithPopup(GoogleAuthProvider)
3. 获取用户信息（uid, email, displayName, photoURL）
4. 检查是否首次登录
5. 如果首次登录：
   - 创建 users/{uid} 文档
   - 迁移本地数据到云端
6. 如果已登录过：
   - 同步云端数据到本地
7. 保存登录状态到 Chrome Storage
8. 显示登录成功提示
```

#### 2.2 登录状态管理

```typescript
// src/shared/services/auth-service.ts
export class AuthService {
  private auth: Auth;
  private currentUser: User | null = null;

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    this.currentUser = result.user;
    await this.saveAuthState();
    return result.user;
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.currentUser = null;
    await this.clearAuthState();
  }

  async getCurrentUser(): Promise<User | null> {
    // 从 Chrome Storage 恢复登录状态
    return this.currentUser;
  }

  isSignedIn(): boolean {
    return this.currentUser !== null;
  }
}
```


### 3. 数据同步策略

#### 3.1 同步原则

**本地优先（Local-First）：**
- 所有操作先在本地完成，立即响应
- 后台异步同步到云端
- 离线时所有功能正常使用
- 联网后自动同步

**冲突解决：**
- 使用时间戳（updatedAt）判断最新数据
- 以最新时间戳的数据为准
- 记录同步日志便于调试

#### 3.2 同步时机

```typescript
// 自动同步时机
1. 用户登录后立即同步
2. 敲击木鱼后同步（防抖 5 秒）
3. 添加/修改紧急联系人后同步
4. 每 30 分钟自动同步一次
5. 浏览器从离线恢复时同步
6. 打开 Popup/Options 页面时同步

// 手动同步
- 设置页面提供"立即同步"按钮
- 显示最后同步时间
```

#### 3.3 同步服务实现

```typescript
// src/shared/services/sync-service.ts
export class SyncService {
  private db: Firestore;
  private authService: AuthService;
  private syncQueue: SyncTask[] = [];
  private isSyncing = false;

  // 同步用户数据
  async syncUserData(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) return;

    const localData = await storage.getUserData();
    const cloudData = await this.getCloudUserData(user.uid);

    if (!cloudData || localData.updatedAt > cloudData.updatedAt) {
      // 本地数据更新，上传到云端
      await this.uploadUserData(user.uid, localData);
    } else if (cloudData.updatedAt > localData.updatedAt) {
      // 云端数据更新，下载到本地
      await storage.setUserData(cloudData);
    }
  }

  // 同步紧急联系人
  async syncEmergencyContacts(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) return;

    const localContacts = await storage.getEmergencyContacts();
    const cloudContacts = await this.getCloudContacts(user.uid);

    if (!cloudContacts || localContacts.updatedAt > cloudContacts.updatedAt) {
      await this.uploadContacts(user.uid, localContacts);
    } else if (cloudContacts.updatedAt > localContacts.updatedAt) {
      await storage.setEmergencyContacts(cloudContacts);
    }
  }

  // 批量同步
  async syncAll(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      await this.syncUserData();
      await this.syncEmergencyContacts();
      await this.syncKnockRecords();
      await this.syncDailyStats();
      await this.updateLastSyncTime();
    } finally {
      this.isSyncing = false;
    }
  }
}
```

### 4. 本地数据迁移

#### 4.1 迁移流程

```typescript
// 首次登录时迁移本地数据
async function migrateLocalDataToCloud(uid: string): Promise<void> {
  // 1. 读取所有本地数据
  const userData = await storage.getUserData();
  const contacts = await storage.getEmergencyContacts();
  const knockRecords = await storage.getKnockRecords();
  const dailyStats = await storage.getDailyStats();

  // 2. 上传到 Firestore
  await Promise.all([
    uploadUserData(uid, userData),
    uploadContacts(uid, contacts),
    uploadKnockRecords(uid, knockRecords),
    uploadDailyStats(uid, dailyStats)
  ]);

  // 3. 标记已迁移
  await storage.set('migrated', true);
  
  // 4. 显示迁移成功提示
  showNotification('数据已成功同步到云端');
}
```

#### 4.2 迁移提示

```typescript
// 仅在添加紧急联系人时提示用户登录
function shouldPromptLogin(): boolean {
  // 只在用户未登录时返回 true
  // 具体提示时机由 UI 组件控制（添加联系人时）
  return !authService.isSignedIn();
}
```


### 5. UI 设计

#### 5.1 登录界面

**Popup 页面顶部：**
```
┌─────────────────────────────────┐
│  👤 未登录                       │
│  [使用 Google 登录] 按钮         │
└─────────────────────────────────┘

登录后：
┌─────────────────────────────────┐
│  👤 张三                         │
│  📧 zhang@gmail.com              │
│  🔄 最后同步：2 分钟前            │
└─────────────────────────────────┘
```

**Options 页面 - 账号设置：**
```
账号设置
├── 用户信息
│   ├── 头像
│   ├── 显示名称
│   └── 邮箱
├── 数据同步
│   ├── 最后同步时间
│   ├── [立即同步] 按钮
│   └── 自动同步开关
└── 账号操作
    ├── [退出登录] 按钮
    └── [删除账号] 按钮（危险操作）
```

#### 5.2 登录提示时机

**唯一提示场景：添加紧急联系人时**

当用户尝试添加紧急联系人时，如果未登录，显示提示：

```
┌─────────────────────────────────────┐
│ 💡 需要登录才能发送邮件通知          │
│                                     │
│ 登录后您可以：                       │
│ • 发送死亡通知邮件给紧急联系人        │
│ • 数据自动备份到云端                 │
│ • 多设备同步数据                     │
│                                     │
│ [使用 Google 登录]  [稍后再说]       │
└─────────────────────────────────────┘
```

**设计原则：**
- 不在其他地方主动提示登录
- 不强制用户登录
- 未登录时所有本地功能正常使用
- 只在需要云端功能（邮件发送）时提示

#### 5.3 同步状态指示

```typescript
// 同步状态
enum SyncStatus {
  Idle = 'idle',           // 空闲
  Syncing = 'syncing',     // 同步中
  Success = 'success',     // 同步成功
  Error = 'error',         // 同步失败
  Offline = 'offline'      // 离线
}

// 状态图标
const statusIcons = {
  idle: '⚪',
  syncing: '🔄',
  success: '✅',
  error: '❌',
  offline: '📴'
};
```

### 6. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用户基本信息
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    
    // 用户数据
    match /userData/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // 敲击记录
    match /knockRecords/{uid}/records/{recordId} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // 每日统计
    match /dailyStats/{uid}/stats/{date} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // 紧急联系人
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### 7. Firebase 配置指南

#### 7.1 创建 Firebase 项目

```bash
# 步骤 1：访问 Firebase Console
https://console.firebase.google.com/

# 步骤 2：创建新项目
- 项目名称：alive-checker
- 启用 Google Analytics（可选）

# 步骤 3：添加 Web 应用
- 应用昵称：Alive Checker Extension
- 不需要 Firebase Hosting
- 复制配置信息
```

#### 7.2 启用 Authentication

```bash
# 在 Firebase Console 中：
1. 进入 Authentication
2. 点击"开始使用"
3. 启用"Google"登录提供商
4. 配置项目公开名称和支持邮箱
5. 保存
```

#### 7.3 创建 Firestore 数据库

```bash
# 在 Firebase Console 中：
1. 进入 Firestore Database
2. 点击"创建数据库"
3. 选择"生产模式"
4. 选择数据库位置（asia-east1 - 台湾）
5. 创建
6. 配置安全规则（见上文）
```

#### 7.4 配置文件

```typescript
// src/shared/config/firebase.ts
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "alive-checker.firebaseapp.com",
  projectId: "alive-checker",
  storageBucket: "alive-checker.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// 初始化 Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```


### 8. 邮件发送集成

#### 8.1 登录检查

```typescript
// 发送邮件前检查登录状态
async function sendDeathNotificationEmail(): Promise<void> {
  const user = await authService.getCurrentUser();
  
  if (!user) {
    // 未登录，显示登录提示
    showLoginPrompt('需要登录才能发送邮件通知');
    return;
  }
  
  // 已登录，继续发送邮件
  const contacts = await getEmergencyContacts();
  await emailService.sendToContacts(contacts, user);
}
```

#### 8.2 用户信息使用

```typescript
// 邮件模板中使用用户信息
interface EmailVariables {
  userName: string;        // 从 user.displayName 获取
  userEmail: string;       // 从 user.email 获取
  inactiveDays: number;
  currentHP: number;
  lastActiveDate: string;
}

// 准备邮件变量
function prepareEmailVariables(user: User): EmailVariables {
  return {
    userName: user.displayName || '用户',
    userEmail: user.email,
    inactiveDays: calculateInactiveDays(),
    currentHP: getCurrentHP(),
    lastActiveDate: getLastActiveDate()
  };
}
```

### 9. 云端死亡检测和邮件通知

#### 9.1 架构设计

**技术方案：Firebase Cloud Functions + 邮件服务**

```
┌─────────────────────────────────────────────────────────┐
│                   Firebase Cloud                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Cloud Scheduler (每天 UTC 0:00)                  │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Cloud Function: checkAllUsersStatus()           │  │
│  │  1. 查询所有用户数据                              │  │
│  │  2. 检查每个用户的 HP 和未活跃天数                │  │
│  │  3. 判断是否"死亡"                                │  │
│  │  4. 如果死亡且未发送过邮件，触发邮件发送          │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Cloud Function: sendDeathNotification()         │  │
│  │  1. 获取用户的紧急联系人                          │  │
│  │  2. 准备邮件内容（使用模板）                      │  │
│  │  3. 调用邮件服务 API 发送邮件                     │  │
│  │  4. 记录发送状态到 Firestore                      │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  邮件服务 (SendGrid/Mailgun/Gmail SMTP)          │  │
│  │  发送邮件到紧急联系人                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 9.2 邮件服务选择

**推荐方案：SendGrid（免费额度充足）**

| 服务 | 免费额度 | 价格 | 优势 | 劣势 |
|------|---------|------|------|------|
| **SendGrid** | 100 封/天 | $19.95/月 (40K封) | API 简单，文档完善，免费额度充足 | 需要域名验证（可选） |
| Mailgun | 100 封/天 | $35/月 (50K封) | 功能强大，日志详细 | 配置复杂 |
| Gmail SMTP | 500 封/天 | 免费 | 完全免费，无需注册 | 可能被标记为垃圾邮件 |
| AWS SES | 62K 封/月 | $0.10/1000封 | 便宜，可靠 | 需要 AWS 账号，配置复杂 |

**选择 SendGrid 的理由：**
- 免费额度 100 封/天，足够 100 个用户使用
- API 简单易用，文档完善
- 支持邮件模板和变量替换
- 提供邮件发送状态追踪
- 无需域名验证即可使用（使用 SendGrid 域名）

#### 9.3 Firestore 数据模型扩展

```typescript
// deathNotifications/{uid}
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

// emailLogs/{logId}
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

#### 9.4 Cloud Functions 实现

**函数 1：定时检查所有用户状态**

```typescript
// functions/src/checkAllUsersStatus.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const checkAllUsersStatus = functions
  .region('asia-east1')
  .pubsub
  .schedule('0 0 * * *') // 每天 UTC 0:00 (北京时间 8:00)
  .timeZone('Asia/Shanghai')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // 1. 获取所有用户数据
    const usersSnapshot = await db.collection('userData').get();
    
    console.log(`Checking ${usersSnapshot.size} users...`);
    
    // 2. 检查每个用户
    const checkPromises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      const uid = doc.id;
      
      // 3. 判断是否死亡
      const deathStatus = await checkUserDeathStatus(userData);
      
      // 4. 保存检测结果
      await db.collection('deathNotifications').doc(uid).set({
        uid,
        isDead: deathStatus.isDead,
        reason: deathStatus.reason,
        detectedAt: Date.now(),
        lastCheckedAt: Date.now(),
        emailSent: false
      }, { merge: true });
      
      // 5. 如果死亡且未发送过邮件，触发邮件发送
      if (deathStatus.isDead) {
        const notification = await db.collection('deathNotifications').doc(uid).get();
        const notificationData = notification.data();
        
        if (!notificationData?.emailSent) {
          console.log(`User ${uid} is dead, sending notification...`);
          await sendDeathNotification(uid, userData);
        }
      }
    });
    
    await Promise.all(checkPromises);
    
    console.log('All users checked successfully');
  });

// 检查用户死亡状态
async function checkUserDeathStatus(userData: any): Promise<{
  isDead: boolean;
  reason: string;
}> {
  // 获取死亡检测配置（从 Firestore 或使用默认值）
  const config = {
    hpThreshold: 0,
    inactivityThreshold: 30
  };
  
  // 检查 HP
  if (userData.hp <= config.hpThreshold) {
    return {
      isDead: true,
      reason: `HP 低于阈值 (${userData.hp} <= ${config.hpThreshold})`
    };
  }
  
  // 检查未活跃天数
  const inactiveDays = Math.floor(
    (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
  );
  
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

**函数 2：发送死亡通知邮件**

```typescript
// functions/src/sendDeathNotification.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// 初始化 SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

async function sendDeathNotification(uid: string, userData: any): Promise<void> {
  const db = admin.firestore();
  
  try {
    // 1. 获取紧急联系人
    const contactsDoc = await db.collection('emergencyContacts').doc(uid).get();
    const contactsData = contactsDoc.data();
    
    if (!contactsData || !contactsData.contacts || contactsData.contacts.length === 0) {
      console.log(`No emergency contacts found for user ${uid}`);
      return;
    }
    
    // 2. 按优先级排序，取前 5 个
    const contacts = contactsData.contacts
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 5);
    
    const recipients = contacts.map((c: any) => c.email);
    
    // 3. 准备邮件内容
    const emailContent = prepareEmailContent(userData);
    
    // 4. 发送邮件
    const msg = {
      to: recipients,
      from: 'noreply@alive-checker.com', // 需要在 SendGrid 验证
      subject: emailContent.subject,
      text: emailContent.textBody,
      html: emailContent.htmlBody
    };
    
    const response = await sgMail.sendMultiple(msg);
    
    console.log(`Email sent to ${recipients.length} recipients for user ${uid}`);
    
    // 5. 更新发送状态
    await db.collection('deathNotifications').doc(uid).update({
      emailSent: true,
      emailSentAt: Date.now(),
      emailRecipients: recipients,
      emailStatus: 'sent'
    });
    
    // 6. 记录邮件日志
    await db.collection('emailLogs').add({
      uid,
      recipients,
      subject: emailContent.subject,
      sentAt: Date.now(),
      status: 'sent',
      sendGridMessageId: response[0].headers['x-message-id']
    });
    
  } catch (error) {
    console.error(`Failed to send email for user ${uid}:`, error);
    
    // 记录失败状态
    await db.collection('deathNotifications').doc(uid).update({
      emailStatus: 'failed',
      emailError: error.message
    });
    
    await db.collection('emailLogs').add({
      uid,
      recipients: [],
      subject: '',
      sentAt: Date.now(),
      status: 'failed',
      error: error.message
    });
  }
}

// 准备邮件内容
function prepareEmailContent(userData: any): {
  subject: string;
  textBody: string;
  htmlBody: string;
} {
  const userName = userData.displayName || '用户';
  const inactiveDays = Math.floor(
    (Date.now() - userData.lastKnockTime) / (1000 * 60 * 60 * 24)
  );
  const lastActiveDate = new Date(userData.lastKnockTime).toLocaleString('zh-CN');
  const currentDate = new Date().toLocaleString('zh-CN');
  
  // 使用现有的邮件模板
  // 这里简化处理，实际应该复用 src/shared/templates/death-notification-email.ts
  
  const subject = `⚠️ 重要通知：${userName} 已经 ${inactiveDays} 天没有活跃`;
  
  const textBody = `
⚠️ 重要通知

您好，

我们注意到 ${userName} 已经 ${inactiveDays} 天没有活跃了。
根据预先设定的规则，系统判定可能需要您的关注。

详细信息：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
最后活跃时间：${lastActiveDate}
检测时间：${currentDate}
未活跃天数：${inactiveDays} 天
功德值：${userData.merit}
生命值：${userData.hp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 这是什么？
这是一封自动发送的关怀提醒邮件。如果一切正常，请忽略此邮件。
如果您担心对方的安全，建议尽快联系确认。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
此邮件由"还活着吗"扩展自动发送
© 2025 还活着吗 | 关心每一个生命
  `.trim();
  
  const htmlBody = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 8px; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; margin-bottom: 30px; }
    .header h1 { color: #d32f2f; margin: 0; font-size: 24px; }
    .message { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
    .details { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .details-item { margin: 8px 0; display: flex; justify-content: space-between; }
    .details-label { font-weight: bold; color: #666; }
    .details-value { color: #333; }
    .note { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; font-size: 14px; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ 重要通知</h1>
    </div>
    <div class="content">
      <div class="greeting">您好，</div>
      <div class="message">
        <p>我们注意到 <strong>${userName}</strong> 已经 <strong>${inactiveDays}</strong> 天没有活跃了。</p>
        <p>根据预先设定的规则，系统判定可能需要您的关注。</p>
      </div>
      <div class="details">
        <div class="details-item">
          <span class="details-label">最后活跃时间：</span>
          <span class="details-value">${lastActiveDate}</span>
        </div>
        <div class="details-item">
          <span class="details-label">检测时间：</span>
          <span class="details-value">${currentDate}</span>
        </div>
        <div class="details-item">
          <span class="details-label">未活跃天数：</span>
          <span class="details-value">${inactiveDays} 天</span>
        </div>
        <div class="details-item">
          <span class="details-label">功德值：</span>
          <span class="details-value">${userData.merit}</span>
        </div>
        <div class="details-item">
          <span class="details-label">生命值：</span>
          <span class="details-value">${userData.hp}</span>
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
  
  return { subject, textBody, htmlBody };
}
```

#### 9.5 部署 Cloud Functions

```bash
# 1. 安装 Firebase CLI
npm install -g firebase-tools

# 2. 登录 Firebase
firebase login

# 3. 初始化 Functions
firebase init functions
# 选择 TypeScript
# 安装依赖

# 4. 安装 SendGrid SDK
cd functions
npm install @sendgrid/mail

# 5. 配置 SendGrid API Key
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"

# 6. 部署 Functions
firebase deploy --only functions

# 7. 查看日志
firebase functions:log
```

#### 9.6 SendGrid 配置

```bash
# 1. 注册 SendGrid 账号
https://signup.sendgrid.com/

# 2. 创建 API Key
Settings > API Keys > Create API Key
- Name: alive-checker-cloud-functions
- Permissions: Full Access (或 Mail Send)
- 复制 API Key

# 3. 验证发件人邮箱（可选）
Settings > Sender Authentication > Single Sender Verification
- 填写发件人信息
- 验证邮箱

# 4. 配置到 Firebase
firebase functions:config:set sendgrid.key="SG.xxx..."
```

#### 9.7 检查频率配置

**推荐：每天检查一次（UTC 0:00 / 北京时间 8:00）**

理由：
- 死亡检测不需要实时性，每天检查一次足够
- 减少 Cloud Functions 调用次数，节省成本
- 避免频繁发送邮件打扰联系人

可选频率：
- 每 12 小时：`'0 */12 * * *'`
- 每 6 小时：`'0 */6 * * *'`
- 每小时：`'0 * * * *'`（不推荐，成本高）

#### 9.8 防止重复发送

```typescript
// 检查是否已发送过邮件
async function shouldSendEmail(uid: string): Promise<boolean> {
  const db = admin.firestore();
  const notification = await db.collection('deathNotifications').doc(uid).get();
  const data = notification.data();
  
  // 如果已发送过，不再发送
  if (data?.emailSent) {
    console.log(`Email already sent for user ${uid} at ${new Date(data.emailSentAt).toISOString()}`);
    return false;
  }
  
  return true;
}

// 用户恢复活跃后，重置发送状态
async function resetEmailSentStatus(uid: string): Promise<void> {
  const db = admin.firestore();
  await db.collection('deathNotifications').doc(uid).update({
    isDead: false,
    emailSent: false,
    emailSentAt: admin.firestore.FieldValue.delete(),
    emailRecipients: admin.firestore.FieldValue.delete()
  });
}
```

#### 9.9 成本估算

**SendGrid 免费额度：100 封/天**

假设场景：
- 用户数：1000
- 死亡率：1%（10 个用户）
- 每个用户 5 个联系人
- 每天发送：10 × 5 = 50 封邮件

**结论：免费额度完全够用**

如果超出免费额度：
- SendGrid Essentials: $19.95/月（40,000 封）
- 平均成本：$0.0005/封

**Cloud Functions 成本：**
- 免费额度：200 万次调用/月
- 每天检查 1000 用户 = 1000 次调用
- 每月 = 30,000 次调用
- **完全在免费额度内**

#### 9.10 监控和日志

```typescript
// 添加详细日志
console.log('[CheckUsers] Starting check for all users');
console.log(`[CheckUsers] Found ${usersSnapshot.size} users`);
console.log(`[CheckUsers] User ${uid} is dead: ${deathStatus.isDead}`);
console.log(`[SendEmail] Sending to ${recipients.length} recipients`);
console.log(`[SendEmail] Email sent successfully, message ID: ${messageId}`);
console.error(`[SendEmail] Failed to send email:`, error);

// 在 Firebase Console 查看日志
// Functions > Logs
// 可以按时间、严重程度、函数名筛选
```

## 技术实现

### 项目结构

```
src/
├── shared/
│   ├── config/
│   │   └── firebase.ts           # Firebase 配置
│   ├── services/
│   │   ├── auth-service.ts       # 认证服务
│   │   ├── sync-service.ts       # 同步服务
│   │   └── firestore-service.ts  # Firestore 操作
│   └── types/
│       └── auth.ts               # 认证相关类型
├── popup/
│   └── components/
│       ├── LoginButton.tsx       # 登录按钮
│       └── UserProfile.tsx       # 用户信息卡片
├── options/
│   └── components/
│       ├── AccountSettings.tsx   # 账号设置页面
│       └── SyncStatus.tsx        # 同步状态组件
└── background/
    └── services/
        └── sync-scheduler.ts     # 同步调度器
```

### 依赖安装

```bash
# 安装 Firebase SDK
npm install firebase

# 类型定义已包含在 firebase 包中
```

### manifest.json 更新

```json
{
  "permissions": [
    "storage",
    "notifications",
    "alarms",
    "identity"  // 新增：用于 Google 登录
  ],
  "host_permissions": [
    "https://*.firebaseapp.com/*",
    "https://*.googleapis.com/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

## 开发指南

### 1. 本地开发设置

```bash
# 1. 创建 Firebase 项目（见上文）

# 2. 复制配置到项目
# 创建 src/shared/config/firebase.ts
# 粘贴 Firebase 配置

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 5. 在 Chrome 中加载插件测试
```

### 2. 测试登录流程

```bash
# 1. 点击"使用 Google 登录"
# 2. 选择 Google 账号
# 3. 授权应用
# 4. 查看 Firestore 中是否创建了用户数据
# 5. 查看本地数据是否已迁移
```

### 3. 测试同步功能

```bash
# 1. 登录后敲击木鱼
# 2. 查看 Firestore 中数据是否更新
# 3. 在另一台设备登录同一账号
# 4. 查看数据是否同步
```

### 4. 测试离线模式

```bash
# 1. 断开网络
# 2. 敲击木鱼（应该正常工作）
# 3. 恢复网络
# 4. 查看数据是否自动同步
```

## 验收标准

### 功能验收
- [ ] 用户可以使用 Google 账号登录
- [ ] 登录后显示用户信息（头像、名称、邮箱）
- [ ] 首次登录时本地数据自动迁移到云端
- [ ] 敲击木鱼后数据自动同步到云端
- [ ] 添加紧急联系人后数据自动同步
- [ ] 在设置页面可以手动触发同步
- [ ] 显示最后同步时间
- [ ] 离线时所有功能正常使用
- [ ] 联网后自动同步离线期间的数据
- [ ] 添加紧急联系人时提示登录（未登录时）
- [ ] 点击"稍后再说"可以继续添加联系人
- [ ] 未登录时发送邮件会被阻止（静默失败，记录日志）
- [ ] 用户可以退出登录
- [ ] 退出登录后本地数据保留
- [ ] **Cloud Functions 定时检查功能正常运行**
- [ ] **检测到死亡用户时自动发送邮件**
- [ ] **邮件成功送达紧急联系人（最多 5 个）**
- [ ] **不会重复发送邮件给同一用户**
- [ ] **用户恢复活跃后可以再次触发邮件**
- [ ] **邮件日志正确记录到 Firestore**

### 性能验收
- [ ] 登录响应时间 < 3 秒
- [ ] 数据同步延迟 < 5 秒
- [ ] 离线操作无延迟
- [ ] **Cloud Functions 执行时间 < 60 秒**
- [ ] **邮件发送延迟 < 10 秒**

### 安全验收
- [ ] 用户只能访问自己的数据
- [ ] Firestore Security Rules 正确配置
- [ ] 敏感信息不在客户端明文存储
- [ ] **Cloud Functions 只能访问授权数据**
- [ ] **SendGrid API Key 安全存储在 Firebase Config**
- [ ] **邮件内容不包含敏感信息**

## 依赖

- M5：死亡通知系统（邮件发送功能）
- Firebase 项目（免费计划）
- Google Cloud 账号

## 风险

### 技术风险

1. **Firebase 配额限制**
   - **风险**：免费额度不够用
   - **应对**：监控使用量，优化查询次数
   - **备选**：升级到 Blaze 计划（按需付费）

2. **数据同步冲突**
   - **风险**：多设备同时修改数据
   - **应对**：使用时间戳解决冲突，记录同步日志

3. **Chrome Extension 限制**
   - **风险**：Service Worker 生命周期限制
   - **应对**：使用 Chrome Alarms 定时唤醒

4. **SendGrid 配额限制**
   - **风险**：免费额度 100 封/天可能不够
   - **应对**：
     - 优化检查频率（每天一次）
     - 限制每个用户最多 5 个联系人
     - 监控发送量
     - 必要时升级到付费计划
   - **成本**：$19.95/月（40,000 封）

5. **Cloud Functions 冷启动**
   - **风险**：首次调用可能较慢（5-10 秒）
   - **应对**：
     - 使用定时触发保持温暖
     - 优化函数代码减少依赖
     - 接受冷启动延迟（非实时场景）

6. **邮件送达率**
   - **风险**：邮件可能被标记为垃圾邮件
   - **应对**：
     - 使用 SendGrid 验证域名（可选）
     - 优化邮件内容和格式
     - 添加退订链接（可选）
     - 监控 SendGrid 送达率报告

### 产品风险

1. **用户隐私担忧**
   - **风险**：用户担心数据安全
   - **应对**：
     - 明确隐私政策
     - 说明数据用途
     - 提供数据导出和删除功能

2. **登录门槛**
   - **风险**：强制登录可能流失用户
   - **应对**：
     - 不强制登录，本地功能完整可用
     - 在合适时机温和提示
     - 说明登录的好处（数据备份、邮件通知）

3. **误报问题**
   - **风险**：用户正常但被判定为"死亡"
   - **应对**：
     - 设置合理的阈值（30 天未活跃）
     - 邮件内容温和，不使用"死亡"等敏感词
     - 提供用户反馈机制
     - 允许用户自定义检测规则

4. **联系人骚扰**
   - **风险**：频繁发送邮件打扰联系人
   - **应对**：
     - 每个用户只发送一次（直到恢复活跃）
     - 检查频率设置为每天一次
     - 邮件内容清晰说明是自动提醒

## 后续优化

### Phase 2（可选）
- 添加邮箱密码登录
- 添加其他第三方登录（GitHub、Microsoft）
- 数据加密存储

### Phase 3（阶段 3）
- 好友系统
- 排行榜
- 社交互动

## 参考资料

### Firebase 文档
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore 入门](https://firebase.google.com/docs/firestore/quickstart)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Chrome Extension
- [Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

### 最佳实践
- [Offline-First Architecture](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Data Sync Patterns](https://firebase.google.com/docs/firestore/solutions/sync)

---

**准备好开始了吗？让我们为"还活着吗"添加云端超能力！☁️**

