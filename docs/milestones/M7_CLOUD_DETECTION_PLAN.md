# M7 云端死亡检测功能规划

## 概述

在 M7（用户认证与云端同步）的基础上，新增云端死亡检测和自动邮件通知功能。

## 新增功能

### 1. 云端定时检查
- 使用 Firebase Cloud Functions + Cloud Scheduler
- 每天 UTC 0:00（北京时间 8:00）自动运行
- 检查所有用户的 HP 和未活跃天数
- 判断用户是否"死亡"

### 2. 自动邮件发送
- 使用 SendGrid 邮件服务（免费额度 100 封/天）
- 检测到死亡用户时自动发送邮件
- 发送给最多 5 个紧急联系人（按优先级排序）
- 使用现有的邮件模板（中英文双语）

### 3. 防重复发送
- 记录邮件发送状态到 Firestore
- 每个用户只发送一次（直到恢复活跃）
- 用户恢复活跃后重置发送状态

### 4. 邮件日志
- 记录所有邮件发送历史
- 包含收件人、发送时间、状态等信息
- 便于调试和监控

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                   Firebase Cloud                        │
│                                                         │
│  Cloud Scheduler (每天 UTC 0:00)                        │
│           ↓                                             │
│  checkAllUsersStatus() Cloud Function                   │
│  - 查询所有用户数据                                      │
│  - 检查 HP 和未活跃天数                                  │
│  - 判断是否"死亡"                                        │
│  - 触发邮件发送                                          │
│           ↓                                             │
│  sendDeathNotification() Cloud Function                 │
│  - 获取紧急联系人                                        │
│  - 准备邮件内容                                          │
│  - 调用 SendGrid API                                    │
│  - 记录发送状态                                          │
│           ↓                                             │
│  SendGrid 邮件服务                                       │
│  - 发送邮件到联系人                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Firestore 数据模型扩展

### deathNotifications 集合
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

### emailLogs 集合
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

## 邮件服务选择：SendGrid

### 为什么选择 SendGrid？
- ✅ 免费额度充足：100 封/天
- ✅ API 简单易用
- ✅ 文档完善
- ✅ 支持邮件模板和变量
- ✅ 提供发送状态追踪
- ✅ 无需域名验证即可使用

### 成本估算
- 0-100 封/天：免费
- 超出后：$19.95/月（40,000 封）
- 对于 1000 用户以内完全免费

## 实施任务（新增）

### 8. 云端死亡检测和邮件通知（2 天）

#### 8.1 SendGrid 账号设置
- 注册 SendGrid 账号
- 创建 API Key
- 验证发件人邮箱（可选）
- 测试 API Key

#### 8.2 Firestore 数据模型扩展
- 创建 deathNotifications 集合
- 创建 emailLogs 集合
- 更新 Security Rules

#### 8.3 初始化 Cloud Functions 项目
- 安装 Firebase CLI
- 初始化 Functions 项目
- 安装依赖（@sendgrid/mail, firebase-admin）
- 配置 SendGrid API Key

#### 8.4 实现定时检查函数
- 创建 checkAllUsersStatus() 函数
- 配置 Cloud Scheduler（每天 UTC 0:00）
- 实现死亡检测逻辑
- 触发邮件发送

#### 8.5 实现邮件发送函数
- 创建 sendDeathNotification() 函数
- 获取紧急联系人（按优先级，最多 5 个）
- 准备邮件内容（复用现有模板）
- 调用 SendGrid API
- 记录发送状态和日志

#### 8.6 实现防重复发送逻辑
- 检查 emailSent 标记
- 用户恢复活跃后重置状态

#### 8.7 部署和测试
- 部署 Cloud Functions
- 手动触发测试
- 验证邮件发送
- 检查日志

#### 8.8 监控和日志
- 添加详细日志
- 配置 Firebase Console 日志查看
- 监控发送配额

## 验收标准（新增）

### 功能验收
- [ ] Cloud Functions 定时检查功能正常运行
- [ ] 检测到死亡用户时自动发送邮件
- [ ] 邮件成功送达紧急联系人（最多 5 个）
- [ ] 不会重复发送邮件给同一用户
- [ ] 用户恢复活跃后可以再次触发邮件
- [ ] 邮件日志正确记录到 Firestore

### 性能验收
- [ ] Cloud Functions 执行时间 < 60 秒
- [ ] 邮件发送延迟 < 10 秒

### 安全验收
- [ ] Cloud Functions 只能访问授权数据
- [ ] SendGrid API Key 安全存储在 Firebase Config
- [ ] 邮件内容不包含敏感信息

## 风险和应对

### 技术风险

1. **SendGrid 配额限制**
   - 风险：免费额度 100 封/天可能不够
   - 应对：优化检查频率，限制联系人数量，监控发送量

2. **Cloud Functions 冷启动**
   - 风险：首次调用可能较慢（5-10 秒）
   - 应对：使用定时触发保持温暖，接受冷启动延迟

3. **邮件送达率**
   - 风险：邮件可能被标记为垃圾邮件
   - 应对：使用 SendGrid 验证域名，优化邮件内容

### 产品风险

1. **误报问题**
   - 风险：用户正常但被判定为"死亡"
   - 应对：设置合理阈值（30 天），邮件内容温和

2. **联系人骚扰**
   - 风险：频繁发送邮件打扰联系人
   - 应对：每个用户只发送一次，检查频率每天一次

## 成本估算

### SendGrid
- 免费额度：100 封/天
- 假设 1000 用户，1% 死亡率，每人 5 个联系人
- 每天发送：10 × 5 = 50 封
- **结论：完全在免费额度内**

### Cloud Functions
- 免费额度：200 万次调用/月
- 每天检查 1000 用户 = 1000 次调用
- 每月 = 30,000 次调用
- **结论：完全在免费额度内**

### 总成本
- **0-1000 用户：$0/月（完全免费）**
- 1000-5000 用户：$5-20/月
- 5000+ 用户：按需付费

## 部署步骤

```bash
# 1. 安装 Firebase CLI
npm install -g firebase-tools

# 2. 登录 Firebase
firebase login

# 3. 初始化 Functions
firebase init functions

# 4. 安装依赖
cd functions
npm install @sendgrid/mail firebase-admin

# 5. 配置 SendGrid API Key
firebase functions:config:set sendgrid.key="YOUR_API_KEY"

# 6. 部署
firebase deploy --only functions

# 7. 查看日志
firebase functions:log
```

## 时间估算

- SendGrid 配置：0.5 天
- Cloud Functions 开发：1 天
- 测试和调试：0.5 天
- **总计：2 天**

## 下一步

完成后：
1. ✅ 用户认证和云端同步
2. ✅ 云端死亡检测和自动邮件通知
3. 可以进入 M8：社交功能
4. 准备发布 v0.3.0 版本

---

**"还活着吗"现在有了云端超能力和自动守护功能！☁️📧**
