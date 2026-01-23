# Firebase Cloud Functions 开发指南

## 目录
1. [环境准备](#环境准备)
2. [初始化项目](#初始化项目)
3. [开发第一个函数](#开发第一个函数)
4. [定时触发函数](#定时触发函数)
5. [部署和测试](#部署和测试)
6. [调试和日志](#调试和日志)
7. [最佳实践](#最佳实践)

---

## 环境准备

### 1. 安装 Node.js
确保安装了 Node.js 16 或更高版本：
```bash
node --version  # 应该显示 v16.x.x 或更高
```

### 2. 安装 Firebase CLI
```bash
npm install -g firebase-tools
```

验证安装：
```bash
firebase --version
```

### 3. 登录 Firebase
```bash
firebase login
```
这会打开浏览器，选择你的 Google 账号登录。

---

## 初始化项目

### 1. 在项目根目录初始化 Functions
```bash
# 在你的项目根目录运行
firebase init functions
```

### 2. 选择配置选项
```
? Select a default Firebase project: alive-checker-d24ea
? What language would you like to use? TypeScript
? Do you want to use ESLint? Yes
? Do you want to install dependencies now? Yes
```

### 3. 项目结构
初始化后会创建以下结构：
```
your-project/
├── functions/
│   ├── src/
│   │   └── index.ts          # 函数入口文件
│   ├── package.json          # 依赖配置
│   ├── tsconfig.json         # TypeScript 配置
│   └── .eslintrc.js          # ESLint 配置
├── firebase.json             # Firebase 配置
└── .firebaserc              # 项目别名
```

---

## 开发第一个函数

### 1. 安装依赖
```bash
cd functions
npm install firebase-admin @sendgrid/mail
```

### 2. 编写简单的 HTTP 函数

编辑 `functions/src/index.ts`：

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// 初始化 Firebase Admin
admin.initializeApp();

// 简单的 HTTP 函数
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

// 访问 Firestore 的函数
export const getUsers = functions.https.onRequest(async (request, response) => {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('userData').get();
  
  const users = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  response.json({ count: users.length, users });
});
```

### 3. 本地测试（可选）

安装 Firebase Emulator：
```bash
firebase init emulators
# 选择 Functions 和 Firestore
```

启动模拟器：
```bash
firebase emulators:start
```

访问：`http://localhost:5001/alive-checker-d24ea/us-central1/helloWorld`

---

## 定时触发函数

### 1. 创建定时检查函数

创建 `functions/src/checkAllUsersStatus.ts`：

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const checkAllUsersStatus = functions
  .region('asia-east1')  // 选择离用户近的区域
  .pubsub
  .schedule('0 0 * * *')  // Cron 表达式：每天 UTC 0:00
  .timeZone('Asia/Shanghai')  // 时区：北京时间
  .onRun(async (context) => {
    const db = admin.firestore();
    
    console.log('[CheckUsers] Starting check for all users');
    
    // 获取所有用户数据
    const usersSnapshot = await db.collection('userData').get();
    console.log(`[CheckUsers] Found ${usersSnapshot.size} users`);
    
    // 检查每个用户
    const checkPromises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      const uid = doc.id;
      
      // 判断是否死亡
      const deathStatus = checkUserDeathStatus(userData);
      
      console.log(`[CheckUsers] User ${uid}: isDead=${deathStatus.isDead}`);
      
      // 保存检测结果
      await db.collection('deathNotifications').doc(uid).set({
        uid,
        isDead: deathStatus.isDead,
        reason: deathStatus.reason,
        detectedAt: Date.now(),
        lastCheckedAt: Date.now(),
        emailSent: false
      }, { merge: true });
      
      // 如果死亡且未发送过邮件，触发邮件发送
      if (deathStatus.isDead) {
        const notification = await db.collection('deathNotifications').doc(uid).get();
        const notificationData = notification.data();
        
        if (!notificationData?.emailSent) {
          console.log(`[CheckUsers] User ${uid} is dead, triggering email...`);
          // 这里调用邮件发送函数
          await sendDeathNotification(uid, userData);
        }
      }
    });
    
    await Promise.all(checkPromises);
    
    console.log('[CheckUsers] All users checked successfully');
    return null;
  });

// 检查用户死亡状态
function checkUserDeathStatus(userData: any): {
  isDead: boolean;
  reason: string;
} {
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

// 发送死亡通知邮件（占位符，后面实现）
async function sendDeathNotification(uid: string, userData: any): Promise<void> {
  console.log(`[SendEmail] Sending notification for user ${uid}`);
  // 实现邮件发送逻辑
}
```

### 2. Cron 表达式说明

```
格式：分 时 日 月 周
     * * * * *

示例：
'0 0 * * *'      # 每天 0:00
'0 */12 * * *'   # 每 12 小时
'0 */6 * * *'    # 每 6 小时
'0 * * * *'      # 每小时
'*/30 * * * *'   # 每 30 分钟
'0 0 * * 1'      # 每周一 0:00
```

### 3. 在 index.ts 中导出

编辑 `functions/src/index.ts`：

```typescript
export { checkAllUsersStatus } from './checkAllUsersStatus';
```

---

## 邮件发送函数

### 1. 配置 SendGrid API Key

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

查看配置：
```bash
firebase functions:config:get
```

### 2. 创建邮件发送函数

创建 `functions/src/sendDeathNotification.ts`：

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// 初始化 SendGrid
const sendGridKey = functions.config().sendgrid?.key;
if (sendGridKey) {
  sgMail.setApiKey(sendGridKey);
}

export async function sendDeathNotification(
  uid: string, 
  userData: any
): Promise<void> {
  const db = admin.firestore();
  
  try {
    console.log(`[SendEmail] Processing user ${uid}`);
    
    // 1. 获取紧急联系人
    const contactsDoc = await db.collection('emergencyContacts').doc(uid).get();
    const contactsData = contactsDoc.data();
    
    if (!contactsData || !contactsData.contacts || contactsData.contacts.length === 0) {
      console.log(`[SendEmail] No emergency contacts found for user ${uid}`);
      return;
    }
    
    // 2. 按优先级排序，取前 5 个
    const contacts = contactsData.contacts
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 5);
    
    const recipients = contacts.map((c: any) => c.email);
    console.log(`[SendEmail] Sending to ${recipients.length} recipients`);
    
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
    
    console.log(`[SendEmail] Email sent successfully, message ID: ${response[0].headers['x-message-id']}`);
    
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
    
  } catch (error: any) {
    console.error(`[SendEmail] Failed to send email for user ${uid}:`, error);
    
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

---

## 部署和测试

### 1. 部署所有函数

```bash
# 在 functions 目录外运行
firebase deploy --only functions
```

部署特定函数：
```bash
firebase deploy --only functions:checkAllUsersStatus
firebase deploy --only functions:helloWorld
```

### 2. 查看部署的函数

访问 Firebase Console：
- https://console.firebase.google.com/
- 选择你的项目
- 进入 Functions 页面

### 3. 手动触发测试

在 Firebase Console 中：
1. 找到你的函数
2. 点击"测试"按钮
3. 查看执行日志

或使用 Firebase CLI：
```bash
# 调用 HTTP 函数
curl https://asia-east1-alive-checker-d24ea.cloudfunctions.net/helloWorld

# 手动触发定时函数（需要在 Console 中操作）
```

### 4. 查看日志

实时查看日志：
```bash
firebase functions:log
```

查看特定函数的日志：
```bash
firebase functions:log --only checkAllUsersStatus
```

在 Firebase Console 查看：
- Functions > Logs
- 可以按时间、严重程度、函数名筛选

---

## 调试和日志

### 1. 添加日志

```typescript
// 不同级别的日志
console.log('[Info] Normal log message');
console.warn('[Warning] Warning message');
console.error('[Error] Error message');

// 结构化日志
console.log({
  severity: 'INFO',
  message: 'User checked',
  uid: 'user123',
  isDead: false
});
```

### 2. 本地调试

使用 Firebase Emulator：
```bash
firebase emulators:start --only functions
```

在代码中添加断点（使用 VS Code）：
1. 安装 Firebase Emulator 扩展
2. 在代码中设置断点
3. 启动调试模式

### 3. 错误处理

```typescript
export const myFunction = functions.https.onRequest(async (req, res) => {
  try {
    // 你的代码
    const result = await someAsyncOperation();
    res.json({ success: true, result });
  } catch (error) {
    console.error('[Error] Function failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

---

## 最佳实践

### 1. 性能优化

```typescript
// ✅ 好：并行处理
const promises = users.map(user => processUser(user));
await Promise.all(promises);

// ❌ 差：串行处理
for (const user of users) {
  await processUser(user);  // 慢！
}
```

### 2. 超时设置

```typescript
export const longRunningFunction = functions
  .runWith({
    timeoutSeconds: 540,  // 最大 9 分钟
    memory: '1GB'         // 增加内存
  })
  .https.onRequest(async (req, res) => {
    // 长时间运行的任务
  });
```

### 3. 环境变量

```bash
# 设置配置
firebase functions:config:set someservice.key="THE API KEY"

# 获取配置
firebase functions:config:get

# 在代码中使用
const apiKey = functions.config().someservice.key;
```

### 4. 区域选择

```typescript
// 选择离用户近的区域
export const myFunction = functions
  .region('asia-east1')  // 台湾
  // .region('us-central1')  // 美国中部
  // .region('europe-west1')  // 比利时
  .https.onRequest((req, res) => {
    // ...
  });
```

### 5. 成本控制

```typescript
// 限制并发执行
export const expensiveFunction = functions
  .runWith({
    maxInstances: 10  // 最多 10 个实例同时运行
  })
  .https.onRequest(async (req, res) => {
    // 昂贵的操作
  });
```

---

## 常见问题

### 1. 函数部署失败

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 16

# 检查依赖
cd functions
npm install

# 清理并重新部署
npm run build
firebase deploy --only functions
```

### 2. 函数超时

```typescript
// 增加超时时间
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 })  // 5 分钟
  .https.onRequest(async (req, res) => {
    // ...
  });
```

### 3. 权限错误

确保 Firestore Security Rules 允许 Cloud Functions 访问：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许 Cloud Functions 访问
    match /{document=**} {
      allow read, write: if request.auth != null || request.auth.token.admin == true;
    }
  }
}
```

### 4. SendGrid 邮件发送失败

```typescript
// 检查 API Key 配置
firebase functions:config:get

// 测试 SendGrid API Key
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_API_KEY');

const msg = {
  to: 'test@example.com',
  from: 'verified@yourdomain.com',
  subject: 'Test',
  text: 'Test email'
};

sgMail.send(msg)
  .then(() => console.log('Email sent'))
  .catch(error => console.error(error));
```

---

## 下一步

1. ✅ 完成 Cloud Functions 开发
2. ✅ 部署到 Firebase
3. ✅ 测试定时触发
4. ✅ 验证邮件发送
5. ✅ 监控日志和性能

**祝你开发顺利！🚀**
