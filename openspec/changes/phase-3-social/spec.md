# 阶段 3：社交功能

## 目标

引入后端服务和社交功能，让用户可以与好友互动，查看排行榜，接收邮件通知。从纯本地应用升级为云端增强应用。

**核心价值：** 通过社交互动提升用户粘性，扩大用户规模，为商业化打下基础。

## 范围

### 包含
- ✅ Google Cloud 后端服务
- ✅ 用户账号系统
- ✅ 好友系统
- ✅ 戳一戳功能
- ✅ 排行榜
- ✅ 邮件通知
- ✅ 数据同步

### 不包含
- ❌ 小队系统（阶段 4）
- ❌ 社交媒体监控（阶段 4）
- ❌ 付费功能（阶段 5）

## 详细设计

### 1. 后端架构

#### 1.1 技术栈
- **计算**：Google Cloud Functions (Gen 2)
- **数据库**：Firestore
- **认证**：Firebase Authentication
- **定时任务**：Cloud Scheduler
- **邮件**：SendGrid
- **存储**：Cloud Storage（头像等）

#### 1.2 API 设计
```
POST   /api/auth/register          # 注册
POST   /api/auth/login             # 登录
GET    /api/user/profile           # 获取用户信息
PUT    /api/user/profile           # 更新用户信息
POST   /api/checkin                # 签到（同步到云端）
GET    /api/checkin/history        # 获取签到历史
POST   /api/friends/add            # 添加好友
GET    /api/friends/list           # 好友列表
POST   /api/friends/poke           # 戳一戳
GET    /api/leaderboard            # 排行榜
POST   /api/sync                   # 数据同步
```

#### 1.3 数据模型
```typescript
// Firestore Collections

// users
interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: number;
  lastSeen: number;
}

// user_data
interface UserData {
  uid: string;
  lastCheckIn: number;
  consecutiveDays: number;
  hp: number;
  status: 'alive' | 'dead';
  totalCheckIns: number;
  achievements: string[];
  updatedAt: number;
}

// checkins
interface CheckInRecord {
  id: string;
  uid: string;
  timestamp: number;
  hp: number;
  consecutiveDays: number;
  type: 'normal' | 'mood' | 'quote' | 'question';
  metadata?: any;
}

// friendships
interface Friendship {
  id: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

// pokes
interface Poke {
  id: string;
  from: string;
  to: string;
  message?: string;
  timestamp: number;
  read: boolean;
}
```

### 2. 用户账号系统

#### 2.1 注册和登录
- 使用 Firebase Authentication
- 支持邮箱密码登录
- 支持 Google 账号登录
- 本地数据迁移到云端

#### 2.2 用户资料
```typescript
interface UserProfile {
  displayName: string;
  avatar?: string;
  bio?: string;
  privacy: {
    showInLeaderboard: boolean;
    allowFriendRequests: boolean;
  };
}
```

#### 2.3 隐私设置
- 是否显示在排行榜
- 是否接受好友请求
- 是否接收邮件通知

### 3. 好友系统

#### 3.1 添加好友
- 通过邮箱搜索
- 通过用户 ID 添加
- 发送好友请求
- 接受/拒绝请求

#### 3.2 好友列表
```typescript
interface Friend {
  uid: string;
  displayName: string;
  avatar?: string;
  status: 'alive' | 'dead';
  hp: number;
  consecutiveDays: number;
  lastCheckIn: number;
}
```

#### 3.3 好友动态
- 查看好友签到状态
- 查看好友成就
- 查看好友连续签到天数

### 4. 戳一戳功能

#### 4.1 戳一戳逻辑
```typescript
interface PokeAction {
  targetUid: string;
  message?: string;
}

interface PokeNotification {
  from: Friend;
  message?: string;
  timestamp: number;
}
```

#### 4.2 戳一戳场景
- 好友 HP 低时提醒签到
- 好友断签时鼓励
- 好友解锁成就时祝贺
- 自定义消息

#### 4.3 戳一戳限制
- 每天最多戳同一好友 3 次
- 防止骚扰

### 5. 排行榜

#### 5.1 排行榜类型
- **连续签到榜**：按连续天数排序
- **总签到榜**：按总签到次数排序
- **HP 榜**：按当前 HP 排序
- **成就榜**：按成就数量排序

#### 5.2 排行榜范围
- 全球排行榜
- 好友排行榜
- 每周/每月排行榜

#### 5.3 排行榜数据
```typescript
interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  avatar?: string;
  value: number;
  change?: number; // 排名变化
}
```

### 6. 邮件通知

#### 6.1 通知类型
- **死亡通知**：HP = 0 时发送
- **好友戳一戳**：收到戳一戳时发送
- **成就解锁**：解锁重要成就时发送
- **周报**：每周发送签到总结

#### 6.2 邮件模板
```html
<!-- 死亡通知 -->
<h1>💀 你已阵亡</h1>
<p>已经 7 天未签到，生命值归零。</p>
<a href="chrome-extension://...">立即复活</a>

<!-- 戳一戳通知 -->
<h1>👉 好友戳了你一下</h1>
<p>{{ friendName }} 提醒你签到：{{ message }}</p>
<a href="chrome-extension://...">立即签到</a>

<!-- 周报 -->
<h1>📊 本周签到总结</h1>
<p>本周签到 {{ days }} 天，连续签到 {{ consecutive }} 天。</p>
<p>当前 HP: {{ hp }}/100</p>
```

#### 6.3 邮件设置
- 用户可选择接收哪些通知
- 可设置通知频率
- 可完全关闭邮件通知

### 7. 数据同步

#### 7.1 同步策略
- **本地优先**：所有操作先在本地完成
- **异步同步**：后台异步同步到云端
- **冲突解决**：以最新时间戳为准

#### 7.2 同步时机
- 签到后立即同步
- 每小时自动同步
- 打开插件时同步
- 网络恢复时同步

#### 7.3 离线支持
- 离线时所有功能仍可用
- 离线数据缓存到本地
- 联网后自动同步

### 8. Cloud Functions 实现

#### 8.1 认证函数
```typescript
// functions/auth.ts
export const register = onCall(async (request) => {
  // 创建用户
  // 初始化用户数据
  // 返回用户信息
});

export const login = onCall(async (request) => {
  // 验证用户
  // 返回 token
});
```

#### 8.2 签到函数
```typescript
// functions/checkin.ts
export const syncCheckIn = onCall(async (request) => {
  // 验证用户
  // 保存签到记录
  // 更新用户数据
  // 检查成就
  // 返回结果
});
```

#### 8.3 好友函数
```typescript
// functions/friends.ts
export const addFriend = onCall(async (request) => {
  // 验证用户
  // 创建好友请求
  // 发送通知
});

export const pokeFriend = onCall(async (request) => {
  // 验证用户
  // 创建戳一戳记录
  // 发送通知
  // 发送邮件（可选）
});
```

#### 8.4 定时任务
```typescript
// functions/scheduled.ts
export const checkDeadUsers = onSchedule('every 1 hours', async () => {
  // 查询所有用户
  // 检查 HP
  // 发送死亡通知
});

export const sendWeeklyReport = onSchedule('every sunday 20:00', async () => {
  // 查询所有用户
  // 生成周报
  // 发送邮件
});
```

## 技术实现

### 前端扩展
```
src/
├── background/
│   ├── services/
│   │   ├── auth-service.ts
│   │   ├── sync-service.ts
│   │   └── api-client.ts
├── popup/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── FriendList.tsx
│   │   └── Leaderboard.tsx
├── options/
│   ├── components/
│   │   ├── ProfileSettings.tsx
│   │   ├── FriendManagement.tsx
│   │   └── NotificationSettings.tsx
└── shared/
    ├── api/
    │   ├── auth.ts
    │   ├── checkin.ts
    │   ├── friends.ts
    │   └── leaderboard.ts
```

### 后端结构
```
functions/
├── src/
│   ├── auth.ts
│   ├── checkin.ts
│   ├── friends.ts
│   ├── leaderboard.ts
│   ├── scheduled.ts
│   └── utils/
│       ├── firestore.ts
│       ├── sendgrid.ts
│       └── validation.ts
├── package.json
└── tsconfig.json
```

## 部署指南

### 1. Google Cloud 设置
```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录
firebase login

# 初始化项目
firebase init

# 选择服务
# - Functions
# - Firestore
# - Authentication
```

### 2. Firestore 配置
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    
    match /user_data/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    
    match /checkins/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.uid;
    }
  }
}
```

### 3. 环境变量
```bash
# .env
SENDGRID_API_KEY=xxx
SENDGRID_FROM_EMAIL=noreply@alive-checker.com
```

### 4. 部署
```bash
# 部署 Functions
firebase deploy --only functions

# 部署 Firestore 规则
firebase deploy --only firestore:rules
```

## 成本估算

### Google Cloud 费用（月）
- **Cloud Functions**：免费额度 200 万次调用
- **Firestore**：免费额度 1GB 存储 + 5 万次读取
- **Cloud Scheduler**：免费额度 3 个任务
- **预计成本**：$0-10/月（1000 用户以内）

### SendGrid 费用
- **免费计划**：100 封邮件/天
- **Essentials 计划**：$19.95/月（50,000 封邮件）

## 验收标准

### 功能验收
- [ ] 用户可以注册和登录
- [ ] 本地数据可以迁移到云端
- [ ] 签到数据实时同步
- [ ] 可以添加和管理好友
- [ ] 戳一戳功能正常
- [ ] 排行榜数据准确
- [ ] 邮件通知正常发送
- [ ] 离线功能正常

### 性能验收
- [ ] API 响应时间 < 500ms
- [ ] 数据同步延迟 < 2s
- [ ] 排行榜加载时间 < 1s

## 依赖

- 阶段 2：游戏化升级完成
- Google Cloud 账号
- SendGrid 账号

## 风险

### 技术风险
1. **数据同步冲突**
   - 风险：本地和云端数据不一致
   - 应对：使用时间戳解决冲突

2. **成本超支**
   - 风险：用户增长导致成本增加
   - 应对：监控使用量，优化查询

### 产品风险
1. **用户隐私**
   - 风险：用户担心数据安全
   - 应对：明确隐私政策，数据加密

## 时间估算

**总计：3-4 周**

- 后端架构设计：2 天
- Firebase 设置：1 天
- 认证系统：3 天
- 数据同步：3 天
- 好友系统：4 天
- 排行榜：2 天
- 邮件通知：2 天
- 前端集成：5 天
- 测试和优化：4 天

## 下一步

完成阶段 3 后，进入阶段 4：高级功能
- 小队系统
- 社交互动增强
- 年度报告
- 数据分析
