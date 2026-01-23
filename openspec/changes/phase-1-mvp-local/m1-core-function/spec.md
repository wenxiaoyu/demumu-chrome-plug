# M1：核心功能（迭代 1.1 - 1.6）

## 目标

实现核心敲木鱼功能，用户可以敲木鱼、积累功德、维持生命值，系统自动检测状态并发送通知。

**里程碑价值：** 核心功能可用，可以演示和验证产品概念。

## 时间估算

**总计：4 天**

- 迭代 1.1：最小可用木鱼（0.5 天）
- 迭代 1.2：今日敲击统计（0.5 天）
- 迭代 1.3：功德值系统（0.5 天）
- 迭代 1.4：生命值系统（1 天）
- 迭代 1.5：连续活跃天数（0.5 天）
- 迭代 1.6：状态检测和通知（1 天）

## 范围

### 包含
- ✅ 敲木鱼基础功能,要求木鱼敲击交互诱人
- ✅ 今日/总敲击统计
- ✅ 功德值累积
- ✅ 生命值系统（HP）
- ✅ 连续活跃天数
- ✅ 后台状态检测
- ✅ 通知系统

### 不包含
- ❌ 敲击历史记录
- ❌ 每日统计
- ❌ 数据可视化（日历、图表）
- ❌ 复杂样式和动画

## 详细设计

### 迭代 1.1：最小可用木鱼

#### 数据模型
```typescript
interface UserData {
  userId: string;
  totalKnocks: number;
  createdAt: number;
  updatedAt: number;
}
```

#### 功能
- 点击木鱼按钮
- 总敲击次数 +1
- 数据持久化到本地存储

#### UI
```
┌─────────────────┐
│  还活着吗        │
├─────────────────┤
│   [  木鱼  ]     │
│                 │
│ 总敲击: 42 次   │
└─────────────────┘
```

### 迭代 1.2：今日敲击统计

#### 数据模型扩展
```typescript
interface UserData {
  userId: string;
  todayKnocks: number;      // 新增
  totalKnocks: number;
  lastKnockTime: number;    // 新增
  createdAt: number;
  updatedAt: number;
}
```

#### 功能
- 区分今日和总敲击
- 跨天自动重置今日次数
- 日期工具函数

#### UI
```
┌─────────────────┐
│  还活着吗        │
├─────────────────┤
│   [  木鱼  ]     │
│                 │
│ 今日: 12 次     │
│ 总计: 42 次     │
└─────────────────┘
```

### 迭代 1.3：功德值系统

#### 数据模型扩展
```typescript
interface UserData {
  userId: string;
  todayKnocks: number;
  totalKnocks: number;
  merit: number;            // 新增
  lastKnockTime: number;
  createdAt: number;
  updatedAt: number;
}
```

#### 功能
- 每次敲击功德值 +1
- 功德值永久累积
- 功德值显示

#### UI
```
┌─────────────────┐
│  还活着吗        │
├─────────────────┤
│   [  木鱼  ]     │
│                 │
│ 🙏 功德: 1,234  │
│ 今日: 12 次     │
│ 总计: 42 次     │
└─────────────────┘
```

### 迭代 1.4：生命值系统

#### 数据模型扩展
```typescript
interface UserData {
  userId: string;
  todayKnocks: number;
  totalKnocks: number;
  merit: number;
  hp: number;               // 新增
  status: 'alive' | 'dead'; // 新增
  lastKnockTime: number;
  createdAt: number;
  updatedAt: number;
}
```

#### HP 规则
- 初始 HP：100
- 最大 HP：100
- 最小 HP：0
- 每日首次敲击：+10 HP
- 未敲击惩罚：-10 HP/天
- HP = 0：进入"死亡"状态

#### HP 计算
```typescript
function calculateHP(lastKnockTime: number, currentHP: number, now: number): number {
  const daysSinceKnock = Math.floor((now - lastKnockTime) / (1000 * 60 * 60 * 24));
  
  if (daysSinceKnock === 0) {
    return currentHP; // 今天已敲过
  }
  
  const penalty = daysSinceKnock * 10;
  return Math.max(0, currentHP - penalty);
}

function knockReward(currentHP: number): number {
  return Math.min(100, currentHP + 10);
}
```

#### HP 颜色
- 绿色：HP > 60（健康）
- 黄色：30 < HP ≤ 60（警告）
- 红色：HP ≤ 30（危险）

#### UI
```
┌─────────────────┐
│  还活着吗        │
├─────────────────┤
│ 😊 存活中        │
│ HP: ████░ 80/100│
│                 │
│   [  木鱼  ]     │
│                 │
│ 🙏 功德: 1,234  │
│ 今日: 12 次     │
└─────────────────┘
```

### 迭代 1.5：连续活跃天数

#### 数据模型扩展
```typescript
interface UserData {
  userId: string;
  todayKnocks: number;
  totalKnocks: number;
  merit: number;
  hp: number;
  status: 'alive' | 'dead';
  consecutiveDays: number;  // 新增
  lastKnockTime: number;
  createdAt: number;
  updatedAt: number;
}
```

#### 连续天数规则
- 连续活跃：相邻两天都有敲击
- 断活：超过 1 天未敲击，重置为 1
- 今日首次敲击时更新

#### 计算逻辑
```typescript
function calculateConsecutiveDays(lastKnockTime: number, now: number, current: number): number {
  const lastDate = new Date(lastKnockTime).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    return current; // 今天已敲过
  } else if (daysDiff === 1) {
    return current + 1; // 连续
  } else {
    return 1; // 断活
  }
}
```

#### UI
```
┌─────────────────┐
│  还活着吗        │
├─────────────────┤
│ 😊 存活中        │
│ HP: ████░ 80/100│
│ 连续: 10 天     │
│                 │
│   [  木鱼  ]     │
│                 │
│ 🙏 功德: 1,234  │
│ 今日: 12 次     │
└─────────────────┘
```

### 迭代 1.6：状态检测和通知

#### Background Service Worker

**定时检查：**
- 每小时检查一次
- 浏览器启动时检查
- 插件安装时初始化

**检查逻辑：**
```typescript
async function checkStatus(): Promise<void> {
  const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
  
  if (!userData) {
    await initializeUser();
    return;
  }
  
  const now = Date.now();
  
  // 检查跨天，重置今日敲击
  const lastKnockDate = new Date(userData.lastKnockTime).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);
  if (lastKnockDate < today) {
    userData.todayKnocks = 0;
  }
  
  // 更新 HP
  const newHP = calculateHP(userData.lastKnockTime, userData.hp, now);
  
  // 检查死亡
  if (newHP === 0 && userData.status === 'alive') {
    userData.status = 'dead';
    const daysSinceKnock = Math.floor((now - userData.lastKnockTime) / (1000 * 60 * 60 * 24));
    await showDeathNotification(daysSinceKnock);
  }
  
  // 检查警告
  if (newHP < 30 && newHP > 0) {
    await showHPWarning(newHP);
  }
  
  userData.hp = newHP;
  userData.updatedAt = now;
  await storage.set(STORAGE_KEYS.USER_DATA, userData);
  
  await updateBadge(newHP);
}
```

#### 通知类型

**1. 死亡通知（HP = 0）**
```
💀 你已往生
已经 7 天未敲木鱼，生命值归零
[立即超度]
```

**2. 警告通知（HP < 30）**
```
⚠️ 生命值告急
快敲木鱼积功德！当前 HP: 20
[立即敲击]
```

**3. 首次敲击通知**
```
🙏 功德 +1
连续活跃 10 天，生命值 +10
今日已敲 1 次木鱼
```

#### Badge 显示
- 显示当前 HP 数值
- 根据 HP 显示不同颜色
  - 绿色：HP > 60
  - 黄色：30 < HP ≤ 60
  - 红色：HP ≤ 30

## 技术实现

### 项目结构
```
src/
├── background/
│   ├── index.ts                    # Service Worker 入口
│   ├── services/
│   │   ├── knock-service.ts        # 敲木鱼服务
│   │   ├── hp-service.ts           # HP 计算服务
│   │   ├── notification-service.ts # 通知服务
│   │   └── status-checker.ts       # 状态检查服务
│   └── handlers/
│       └── alarm-handler.ts        # 定时任务处理
├── popup/
│   ├── Popup.tsx                   # 主界面
│   ├── components/
│   │   ├── WoodenFish.tsx          # 木鱼组件
│   │   ├── HPBar.tsx               # HP 进度条
│   │   └── StatusDisplay.tsx       # 状态显示
│   ├── hooks/
│   │   ├── useUserData.ts          # 用户数据 Hook
│   │   └── useKnock.ts             # 敲木鱼 Hook
│   └── index.html
├── shared/
│   ├── types.ts                    # 类型定义
│   ├── storage.ts                  # 存储管理
│   ├── constants.ts                # 常量定义
│   └── utils/
│       ├── date.ts                 # 日期工具
│       ├── hp-calculator.ts        # HP 计算
│       └── id-generator.ts         # ID 生成
└── manifest.json
```

### 核心服务

#### KnockService
```typescript
class KnockService {
  async knock(): Promise<KnockResult> {
    const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
    const now = Date.now();
    
    // 检查跨天
    const isNewDay = !isSameDay(userData.lastKnockTime, now);
    const isFirstKnockToday = isNewDay || userData.todayKnocks === 0;
    
    if (isNewDay) {
      userData.todayKnocks = 0;
      userData.consecutiveDays = calculateConsecutiveDays(
        userData.lastKnockTime,
        now,
        userData.consecutiveDays
      );
    }
    
    // 更新数据
    userData.todayKnocks += 1;
    userData.totalKnocks += 1;
    userData.merit += 1;
    userData.lastKnockTime = now;
    
    // 首次敲击奖励 HP
    if (isFirstKnockToday) {
      userData.hp = Math.min(100, userData.hp + 10);
      userData.status = 'alive';
      await notificationService.showFirstKnockToday(
        userData.consecutiveDays,
        userData.hp,
        userData.todayKnocks
      );
    }
    
    userData.updatedAt = now;
    await storage.set(STORAGE_KEYS.USER_DATA, userData);
    
    return {
      success: true,
      message: '功德 +1',
      data: {
        merit: userData.merit,
        totalMerit: userData.merit,
        todayKnocks: userData.todayKnocks,
        consecutiveDays: userData.consecutiveDays,
        hp: userData.hp,
        status: userData.status,
        isFirstKnockToday
      }
    };
  }
}
```

## 验收标准

### 功能验收
- [ ] 可以点击木鱼
- [ ] 每次敲击功德值 +1
- [ ] 今日敲击次数正确累加
- [ ] 跨天后今日次数重置为 0
- [ ] 总敲击次数持续累加
- [ ] 今日首次敲击 HP +10
- [ ] 今日再次敲击 HP 不变
- [ ] 跨天未敲击 HP -10
- [ ] HP 颜色正确变化
- [ ] 连续活跃天数正确计算
- [ ] 断活后连续天数重置为 1
- [ ] HP = 0 时显示死亡通知
- [ ] HP < 30 时显示警告通知
- [ ] 今日首次敲击显示通知
- [ ] Badge 显示当前 HP

### 技术验收
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 无 Console 错误
- [ ] 数据持久化正常
- [ ] 后台服务正常运行

### 用户体验验收
- [ ] 点击响应迅速
- [ ] UI 显示清晰
- [ ] 通知文案友好
- [ ] 无明显 bug

## 依赖

- 阶段 0：项目搭建完成
- Chrome Extension Manifest V3
- Chrome Storage API
- Chrome Notifications API
- Chrome Alarms API

## 风险

### 技术风险
1. **Service Worker 生命周期**
   - 风险：可能被浏览器休眠
   - 应对：使用 chrome.alarms

2. **时区问题**
   - 风险：跨时区可能导致计算错误
   - 应对：统一使用本地时间

### 产品风险
1. **功能过于简单**
   - 风险：用户可能觉得无聊
   - 应对：快速迭代到 M2，增加可视化

## 下一步

完成 M1 后，进入 M2：数据统计
- 敲击记录历史
- 每日统计
- 活跃日历
- 数据总览
