# 阶段 2：游戏化升级

## 目标

在 MVP 基础上增加游戏化元素，提升趣味性和用户粘性。通过多样化的签到方式、成就系统、挑战任务等机制，让用户保持长期活跃。

**核心价值：** 增强用户参与度，提高留存率，为社交功能打下基础。

## 范围

### 包含
- ✅ 创意签到方式（心情、语录、问题）
- ✅ 成就系统
- ✅ 浏览器活动检测
- ✅ 挑战任务系统
- ✅ 主题系统
- ✅ 签到提醒优化

### 不包含
- ❌ 后端服务
- ❌ 社交功能（阶段 3）
- ❌ 小队系统（阶段 4）

## 详细设计

### 1. 创意签到方式

#### 1.1 心情签到
```typescript
interface MoodCheckIn extends CheckInRecord {
  type: 'mood';
  mood: 'happy' | 'sad' | 'tired' | 'excited' | 'calm';
  emoji: string;
}
```

**交互流程：**
1. 用户点击签到
2. 弹出心情选择器（5 种心情 + emoji）
3. 用户选择心情
4. 完成签到，记录心情

**心情统计：**
- 在 Options 页面显示心情分布图
- 分析用户情绪趋势

#### 1.2 语录签到
```typescript
interface QuoteCheckIn extends CheckInRecord {
  type: 'quote';
  quote: string;
  author?: string;
}
```

**语录库：**
- 预设 100+ 励志/搞笑语录
- 每日随机展示
- 用户可收藏喜欢的语录

#### 1.3 问题签到
```typescript
interface QuestionCheckIn extends CheckInRecord {
  type: 'question';
  question: string;
  answer: string;
}
```

**问题类型：**
- 今天做了什么有趣的事？
- 今天学到了什么？
- 今天最感激的事是什么？

### 2. 成就系统

#### 2.1 成就类型
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  reward: number; // HP 奖励
  unlocked: boolean;
  unlockedAt?: number;
}

type AchievementCondition = 
  | { type: 'consecutive_days'; days: number }
  | { type: 'total_checkins'; count: number }
  | { type: 'perfect_week'; weeks: number }
  | { type: 'mood_variety'; moods: number }
  | { type: 'hp_maintain'; hp: number; days: number };
```

#### 2.2 成就列表
- 🔥 **连续签到**：连续 7/30/100 天
- 🎯 **签到达人**：总签到 50/100/365 次
- 💯 **完美一周**：一周 7 天全签到
- 🌈 **情绪丰富**：使用所有心情签到
- 💪 **生命力旺盛**：HP 保持 90+ 连续 7 天
- 🌅 **早起鸟**：早上 6-8 点签到 10 次
- 🌙 **夜猫子**：晚上 22-24 点签到 10 次

#### 2.3 成就展示
- Popup 页面显示最新解锁成就
- Options 页面显示成就墙
- 解锁成就时显示动画和通知

### 3. 浏览器活动检测

#### 3.1 活动指标
```typescript
interface BrowserActivity {
  date: string;
  activeTime: number;      // 活跃时长（分钟）
  tabsOpened: number;      // 打开标签数
  pagesVisited: number;    // 访问页面数
}
```

#### 3.2 检测逻辑
- 使用 `chrome.tabs` API 监听标签活动
- 使用 `chrome.idle` API 检测空闲状态
- 每小时统计一次活动数据

#### 3.3 活动奖励
- 每日活跃 > 2 小时：额外 +5 HP
- 连续 7 天活跃：解锁"活跃用户"成就

### 4. 挑战任务系统

#### 4.1 任务类型
```typescript
interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  condition: ChallengeCondition;
  reward: number;
  expiresAt: number;
  completed: boolean;
}

type ChallengeCondition =
  | { type: 'checkin_before'; hour: number }
  | { type: 'checkin_with_mood'; mood: string }
  | { type: 'active_time'; minutes: number }
  | { type: 'consecutive_days'; days: number };
```

#### 4.2 每日挑战
- 早起签到（8 点前）：+5 HP
- 心情签到：+3 HP
- 活跃 2 小时：+5 HP

#### 4.3 每周挑战
- 连续 7 天签到：+20 HP
- 完成所有每日挑战：+30 HP

#### 4.4 特殊挑战
- 节日挑战（春节、圣诞等）
- 限时挑战（周末特别任务）

### 5. 主题系统

#### 5.1 主题定义
```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  icons: {
    alive: string;
    dead: string;
    warning: string;
  };
}
```

#### 5.2 预设主题
- 🌞 **明亮模式**（默认）
- 🌙 **暗黑模式**
- 🌸 **樱花粉**
- 🌊 **海洋蓝**
- 🍂 **秋日橙**

#### 5.3 主题切换
- 在 Options 页面选择主题
- 支持跟随系统主题
- 主题设置保存到本地

### 6. 签到提醒优化

#### 6.1 智能提醒
- 根据用户习惯推荐签到时间
- 在用户常用时段提醒
- 避免打扰时段（深夜、工作时间）

#### 6.2 提醒方式
- 浏览器通知
- Badge 闪烁
- 插件图标变化

#### 6.3 提醒设置
- 用户可自定义提醒时间
- 可关闭提醒
- 可设置提醒频率

## 技术实现

### 项目结构扩展
```
src/
├── background/
│   ├── services/
│   │   ├── achievement-service.ts
│   │   ├── challenge-service.ts
│   │   ├── activity-tracker.ts
│   │   └── theme-service.ts
├── popup/
│   ├── components/
│   │   ├── MoodSelector.tsx
│   │   ├── QuoteDisplay.tsx
│   │   ├── AchievementBadge.tsx
│   │   └── ChallengeList.tsx
├── options/
│   ├── components/
│   │   ├── AchievementWall.tsx
│   │   ├── MoodChart.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── ActivityStats.tsx
└── shared/
    ├── data/
    │   ├── quotes.ts
    │   ├── achievements.ts
    │   └── challenges.ts
```

## 验收标准

### 功能验收
- [ ] 用户可以选择不同签到方式
- [ ] 成就系统正常工作
- [ ] 浏览器活动检测准确
- [ ] 挑战任务正确触发和完成
- [ ] 主题切换正常
- [ ] 智能提醒工作正常

### 用户体验验收
- [ ] 签到方式有趣且不繁琐
- [ ] 成就解锁有成就感
- [ ] 挑战任务有吸引力
- [ ] 主题美观且一致
- [ ] 提醒不过度打扰

## 依赖

- 阶段 1：MVP 本地版完成

## 风险

### 产品风险
1. **功能过载**
   - 风险：功能太多导致用户困惑
   - 应对：保持核心流程简单，高级功能可选

2. **用户疲劳**
   - 风险：挑战任务太多导致用户疲劳
   - 应对：控制任务数量，保持适度

## 时间估算

**总计：2-3 周**

- 创意签到方式：3 天
- 成就系统：4 天
- 浏览器活动检测：2 天
- 挑战任务系统：3 天
- 主题系统：2 天
- 签到提醒优化：2 天
- 测试和优化：2 天

## 下一步

完成阶段 2 后，进入阶段 3：社交功能
- 搭建后端服务
- 用户系统
- 好友系统
- 排行榜
