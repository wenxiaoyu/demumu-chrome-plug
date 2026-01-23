# 阶段 1：MVP 本地版

## 目标

实现核心敲木鱼功能，纯本地运行，无需后端服务。用户可以每天敲木鱼积累功德，只要当天有敲击动作就算活着，体验禅意的游戏化机制。

**核心价值：** 通过敲木鱼的禅意交互验证产品概念，收集用户反馈，为后续功能打下基础。

## 范围

### 包含
- ✅ 敲木鱼系统（替代签到）
- ✅ 功德值系统（每次敲击积累）
- ✅ 生命值（HP）系统
- ✅ 状态检测和通知
- ✅ 敲击历史记录
- ✅ 数据可视化（日历、统计）
- ✅ 本地数据存储

### 不包含
- ❌ 后端服务
- ❌ 用户账号系统
- ❌ 社交功能
- ❌ 成就系统（阶段 2）
- ❌ 音效和动画（阶段 2）

## 详细设计

### 1. 数据模型

#### 1.1 用户数据
```typescript
interface UserData {
  userId: string;              // 本地生成的唯一 ID
  lastKnockTime: number;       // 最后敲木鱼时间戳
  todayKnocks: number;         // 今日敲击次数
  totalKnocks: number;         // 总敲击次数
  merit: number;               // 功德值（累计）
  consecutiveDays: number;     // 连续活跃天数
  hp: number;                  // 当前生命值 (0-100)
  status: 'alive' | 'dead';    // 存活状态
  createdAt: number;           // 创建时间
  updatedAt: number;           // 更新时间
}
```

#### 1.2 敲击记录
```typescript
interface KnockRecord {
  id: string;                  // 记录 ID
  timestamp: number;           // 敲击时间戳
  merit: number;               // 本次获得的功德值
  totalMerit: number;          // 敲击时的总功德值
  hp: number;                  // 敲击时的 HP
  consecutiveDays: number;     // 敲击时的连续天数
}
```

#### 1.3 每日统计
```typescript
interface DailyStats {
  date: string;                // 日期（YYYY-MM-DD）
  knocks: number;              // 当日敲击次数
  merit: number;               // 当日获得功德值
  hp: number;                  // 当日结束时的 HP
}
```

#### 1.4 存储键
```typescript
const STORAGE_KEYS = {
  USER_DATA: 'userData',
  KNOCK_HISTORY: 'knockHistory',
  DAILY_STATS: 'dailyStats'
} as const;
```

### 2. 核心功能

#### 2.1 敲木鱼系统

**敲木鱼规则：**
- 每天可以无限次敲木鱼
- 每次敲击获得 1 点功德值
- 只要当天有敲击动作，就算活着
- 连续活跃：相邻两天都有敲击
- 断活：超过 1 天未敲击，连续天数归零

**敲击流程：**
```
1. 用户点击木鱼
2. 播放敲击动画（阶段 1 简单动画）
3. 功德值 +1
4. 今日敲击次数 +1
5. 检查是否是今天第一次敲击：
   a. 如果是，更新连续活跃天数
   b. 更新生命值 +10
6. 保存敲击记录
7. 更新 UI 显示
```

**连续活跃天数计算：**
```typescript
function calculateConsecutiveDays(lastKnockTime: number, now: number): number {
  const lastDate = new Date(lastKnockTime).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // 今天已经敲过
    return currentConsecutiveDays;
  } else if (daysDiff === 1) {
    // 连续活跃
    return currentConsecutiveDays + 1;
  } else {
    // 断活
    return 1;
  }
}
```

**功德值系统：**
- 每次敲击 +1 功德值
- 功德值累计，不会减少
- 功德值可用于后续功能（成就、排行榜等）

#### 2.2 生命值系统

**生命值规则：**
- 初始 HP：100
- 最大 HP：100
- 最小 HP：0
- 每日首次敲击奖励：+10 HP（不超过 100）
- 未敲击惩罚：每天 -10 HP
- HP = 0：进入"死亡"状态

**HP 计算逻辑：**
```typescript
function calculateHP(lastKnockTime: number, currentHP: number, now: number): number {
  const daysSinceKnock = Math.floor((now - lastKnockTime) / (1000 * 60 * 60 * 24));
  
  if (daysSinceKnock === 0) {
    // 今天已敲过，不扣 HP
    return currentHP;
  }
  
  // 每天扣 10 HP
  const penalty = daysSinceKnock * 10;
  const newHP = Math.max(0, currentHP - penalty);
  
  return newHP;
}

function knockReward(currentHP: number): number {
  return Math.min(100, currentHP + 10);
}
```

**HP 可视化：**
- 进度条显示当前 HP
- 颜色变化：
  - 绿色：HP > 60
  - 黄色：30 < HP ≤ 60
  - 红色：HP ≤ 30
- 插件图标 Badge 显示 HP 值

#### 2.3 状态检测

**检测时机：**
- 浏览器启动时
- 插件安装时
- 每小时定时检查（使用 chrome.alarms）

**检测逻辑：**
```typescript
async function checkStatus(): Promise<void> {
  const userData = await storage.get<UserData>(STORAGE_KEYS.USER_DATA);
  
  if (!userData) {
    // 首次使用，初始化数据
    await initializeUser();
    return;
  }
  
  const now = Date.now();
  const daysSinceKnock = Math.floor((now - userData.lastKnockTime) / (1000 * 60 * 60 * 24));
  
  // 更新 HP
  const newHP = calculateHP(userData.lastKnockTime, userData.hp, now);
  
  // 检查是否死亡
  if (newHP === 0 && userData.status === 'alive') {
    userData.status = 'dead';
    await showDeathNotification(daysSinceKnock);
  }
  
  // 检查是否跨天，重置今日敲击次数
  const lastKnockDate = new Date(userData.lastKnockTime).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);
  if (lastKnockDate < today) {
    userData.todayKnocks = 0;
  }
  
  // 更新数据
  userData.hp = newHP;
  userData.updatedAt = now;
  await storage.set(STORAGE_KEYS.USER_DATA, userData);
  
  // 更新 Badge
  await updateBadge(newHP);
}
```

**通知类型：**
1. **死亡通知**（HP = 0）
   ```
   💀 你已往生
   已经 7 天未敲木鱼，生命值归零
   [立即超度] [稍后提醒]
   ```

2. **警告通知**（HP < 30）
   ```
   ⚠️ 生命值告急
   快敲木鱼积功德！当前 HP: 20
   [立即敲击]
   ```

3. **每日首次敲击通知**
   ```
   🙏 功德 +1
   连续活跃 10 天，生命值 +10
   今日已敲 1 次木鱼
   ```

#### 2.4 数据可视化

**Popup 页面：**
```
┌─────────────────────────────┐
│  还活着吗                    │
├─────────────────────────────┤
│  😊 存活中                   │
│  HP: ████████░░ 80/100      │
│  连续活跃: 10 天             │
│                             │
│      [   🪵 木鱼   ]         │
│                             │
│  功德值: 1,234              │
│  今日敲击: 42 次             │
│  总敲击: 5,678 次            │
└─────────────────────────────┘
```

**Options 页面：**
- **活跃日历**：热力图显示每日敲击记录
  - 颜色深浅表示敲击次数
  - 深色 = 敲击多，浅色 = 敲击少
- **统计图表**：
  - 连续活跃天数趋势
  - HP 变化曲线
  - 每日敲击次数趋势
  - 功德值累计曲线
- **数据总览**：
  - 总功德值
  - 总敲击次数
  - 最长连续活跃
  - 平均每日敲击
  - 存活天数

**活跃日历设计：**
```
2026 年 1 月
日 一 二 三 四 五 六
         1  2  3  4
 5  6  7  8  9 10 11
12 13 14 15 16 17 18
19 20 21 22 23 24 25
26 27 28 29 30 31

图例：
■■■ 敲击多  ■■ 敲击中  ■ 敲击少  □ 未敲击  ○ 今天
```

### 3. 技术实现

#### 3.1 项目结构
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
│   │   ├── StatusDisplay.tsx       # 状态显示
│   │   └── Stats.tsx               # 统计信息
│   ├── hooks/
│   │   ├── useUserData.ts          # 用户数据 Hook
│   │   └── useKnock.ts             # 敲木鱼 Hook
│   └── index.html
├── options/
│   ├── Options.tsx                 # 设置页面
│   ├── components/
│   │   ├── Calendar.tsx            # 活跃日历
│   │   ├── StatsChart.tsx          # 统计图表
│   │   └── DataOverview.tsx        # 数据总览
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

#### 3.2 核心服务实现

**KnockService（敲木鱼服务）**
```typescript
class KnockService {
  async knock(): Promise<KnockResult> {
    // 1. 获取用户数据
    // 2. 检查是否跨天（重置今日敲击次数）
    // 3. 功德值 +1
    // 4. 今日敲击次数 +1
    // 5. 总敲击次数 +1
    // 6. 如果是今天第一次敲击：
    //    - 计算连续活跃天数
    //    - 更新生命值 +10
    // 7. 保存敲击记录
    // 8. 更新用户数据
    // 9. 显示通知（首次敲击）
    // 10. 返回结果
  }
  
  async getKnockHistory(days: number): Promise<KnockRecord[]> {
    // 获取最近 N 天的敲击记录
  }
  
  async getDailyStats(days: number): Promise<DailyStats[]> {
    // 获取最近 N 天的统计数据
  }
}
```

**HPService**
```typescript
class HPService {
  calculateCurrentHP(lastCheckIn: number, currentHP: number): number {
    // 计算当前 HP
  }
  
  calculateCheckInReward(currentHP: number): number {
    // 计算签到奖励
  }
  
  getHPColor(hp: number): string {
    // 根据 HP 返回颜色
  }
  
  getHPStatus(hp: number): 'healthy' | 'warning' | 'critical' {
    // 根据 HP 返回状态
  }
}
```

**NotificationService**
```typescript
class NotificationService {
  async showFirstKnockToday(consecutiveDays: number, hp: number, todayKnocks: number): Promise<void> {
    // 显示今日首次敲击通知
  }
  
  async showDeathWarning(daysSinceKnock: number): Promise<void> {
    // 显示死亡警告
  }
  
  async showHPWarning(hp: number): Promise<void> {
    // 显示 HP 警告
  }
}
```

**StatusChecker**
```typescript
class StatusChecker {
  async checkAndUpdate(): Promise<void> {
    // 检查并更新用户状态
  }
  
  async scheduleNextCheck(): Promise<void> {
    // 安排下次检查
  }
}
```

#### 3.3 存储管理

```typescript
class Storage {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }
  
  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key);
  }
  
  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }
}
```

#### 3.4 定时任务

```typescript
// background/index.ts
chrome.runtime.onInstalled.addListener(() => {
  // 创建定时任务：每小时检查一次
  chrome.alarms.create('checkStatus', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkStatus') {
    statusChecker.checkAndUpdate();
  }
});

// 浏览器启动时检查
chrome.runtime.onStartup.addListener(() => {
  statusChecker.checkAndUpdate();
});
```

## 验收标准

### 功能验收
- [ ] 用户可以点击木鱼
- [ ] 每次敲击功德值 +1
- [ ] 今日首次敲击时 HP +10
- [ ] 连续活跃天数计算正确
- [ ] 断活后连续天数归零
- [ ] HP 增减逻辑正确
- [ ] HP = 0 时显示死亡通知
- [ ] HP < 30 时显示警告通知
- [ ] 今日首次敲击显示通知
- [ ] 插件 Badge 显示当前 HP
- [ ] 活跃日历正确显示历史记录（颜色深浅表示敲击次数）
- [ ] 统计数据准确（功德值、敲击次数等）

### 技术验收
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 代码格式化符合规范
- [ ] 关键函数有单元测试（可选）
- [ ] 插件可以正常加载
- [ ] 无 Console 错误
- [ ] 性能良好，响应迅速

### 用户体验验收
- [ ] UI 简洁美观
- [ ] 操作流畅，无卡顿
- [ ] 通知不过度打扰
- [ ] 数据可视化清晰
- [ ] 错误提示友好

## 依赖

- 阶段 0：项目搭建完成
- Chrome Extension Manifest V3
- Chrome Storage API
- Chrome Notifications API
- Chrome Alarms API

## 风险

### 技术风险
1. **Service Worker 生命周期**
   - 风险：Service Worker 可能被浏览器休眠
   - 应对：使用 chrome.alarms 而不是 setInterval

2. **时区问题**
   - 风险：用户跨时区可能导致签到计算错误
   - 应对：统一使用本地时间，以 00:00 为界

3. **数据丢失**
   - 风险：用户清除浏览器数据导致签到记录丢失
   - 应对：阶段 1 接受此风险，阶段 3 引入云端备份

### 产品风险
1. **用户留存**
   - 风险：纯本地功能可能不够吸引人
   - 应对：快速迭代，收集反馈，准备阶段 2

2. **功能单一**
   - 风险：功能过于简单，用户失去兴趣
   - 应对：强调 MVP 定位，快速推进到阶段 2

## 时间估算

**总计：1-2 周**

- 数据模型和存储：1 天
- 签到服务：2 天
- HP 系统：1 天
- 状态检测和通知：2 天
- Popup UI：2 天
- Options 页面：3 天
- 测试和优化：2 天

## 下一步

完成阶段 1 后，进入阶段 2：游戏化升级
- 创意签到方式
- 成就系统
- 浏览器活动检测
- 挑战任务
- 主题系统
