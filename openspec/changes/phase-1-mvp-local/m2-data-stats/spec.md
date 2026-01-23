# M2：数据统计（迭代 1.7 - 1.9）

## 目标

实现数据统计和可视化功能，用户可以在统一的页面中查看关键指标和活跃日历热力图。

**里程碑价值：** 数据可视化完成，用户可以直观地回顾历史数据，增强成就感和持续使用动力。

## 时间估算

**总计：2 天**

- 迭代 1.7：敲击记录历史（0.5 天）
- 迭代 1.8：每日统计（0.5 天）
- 迭代 1.9：统计页面（关键指标 + 活跃日历）（1 天）

## 范围

### 包含
- ✅ 敲击记录历史
- ✅ 每日统计数据
- ✅ 统计页面（合并设计）
  - 关键指标卡片（总功德、连续天数、存活天数）
  - 活跃日历热力图
  - 月份切换
- ✅ Options 页面基础

### 不包含
- ❌ 统计图表（折线图、柱状图）
- ❌ 复杂的数据分析
- ❌ 数据导出功能
- ❌ 独立的数据总览页面（已合并到统计页面）

## 详细设计

### 迭代 1.7：敲击记录历史

#### 数据模型
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

#### 存储策略
- 使用数组存储记录
- 最多保存 365 天的记录
- 超过限制时删除最旧的记录

#### 功能
- 每次敲击保存详细记录
- 查询最近 N 天的记录
- 查询指定日期的记录

#### API
```typescript
class KnockService {
  async saveKnockRecord(userData: UserData): Promise<void> {
    const record: KnockRecord = {
      id: generateRecordId(),
      timestamp: Date.now(),
      merit: 1,
      totalMerit: userData.merit,
      hp: userData.hp,
      consecutiveDays: userData.consecutiveDays
    };
    
    const history = await storage.get<KnockRecord[]>(STORAGE_KEYS.KNOCK_HISTORY) || [];
    history.push(record);
    
    // 限制记录数量
    if (history.length > 365 * 100) { // 假设每天最多 100 次
      history.splice(0, history.length - 365 * 100);
    }
    
    await storage.set(STORAGE_KEYS.KNOCK_HISTORY, history);
  }
  
  async getKnockHistory(days: number): Promise<KnockRecord[]> {
    const history = await storage.get<KnockRecord[]>(STORAGE_KEYS.KNOCK_HISTORY) || [];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return history.filter(r => r.timestamp >= cutoff);
  }
}
```

### 迭代 1.8：每日统计

#### 数据模型
```typescript
interface DailyStats {
  date: string;                // 日期（YYYY-MM-DD）
  knocks: number;              // 当日敲击次数
  merit: number;               // 当日获得功德值
  hp: number;                  // 当日结束时的 HP
}
```

#### 存储策略
- 使用对象存储，key 为日期
- 每天一条记录
- 最多保存 365 天

#### 功能
- 每次敲击更新当日统计
- 跨天时创建新的统计记录
- 查询最近 N 天的统计

#### API
```typescript
class StatsService {
  async updateDailyStats(userData: UserData): Promise<void> {
    const today = formatDate(Date.now(), 'YYYY-MM-DD');
    const stats = await storage.get<Record<string, DailyStats>>(STORAGE_KEYS.DAILY_STATS) || {};
    
    if (!stats[today]) {
      stats[today] = {
        date: today,
        knocks: 0,
        merit: 0,
        hp: userData.hp
      };
    }
    
    stats[today].knocks += 1;
    stats[today].merit += 1;
    stats[today].hp = userData.hp;
    
    // 清理旧数据
    const cutoffDate = formatDate(Date.now() - 365 * 24 * 60 * 60 * 1000, 'YYYY-MM-DD');
    Object.keys(stats).forEach(date => {
      if (date < cutoffDate) {
        delete stats[date];
      }
    });
    
    await storage.set(STORAGE_KEYS.DAILY_STATS, stats);
  }
  
  async getDailyStats(days: number): Promise<DailyStats[]> {
    const stats = await storage.get<Record<string, DailyStats>>(STORAGE_KEYS.DAILY_STATS) || {};
    const cutoffDate = formatDate(Date.now() - days * 24 * 60 * 60 * 1000, 'YYYY-MM-DD');
    
    return Object.values(stats)
      .filter(s => s.date >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
```

### 迭代 1.9：统计页面（关键指标 + 活跃日历）

#### UI 设计（合并方案）
```
┌─────────────────────────────────────────┐
│  关键指标                                │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 🙏 功德  │  │ 🔥 连续  │  │ 📅 存活  │ │
│  │ 12,345  │  │ 42 天   │  │ 156 天  │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  2026 年 1 月                    [< >]  │
├─────────────────────────────────────────┤
│  日  一  二  三  四  五  六              │
│           1   2   3   4   5             │
│   6   7   8   9  10  11  12             │
│  13  14  15  16  17  18  19             │
│  20  21  22  23  24  25  26             │
│  27  28  29  30  31                     │
├─────────────────────────────────────────┤
│  图例：                                  │
│  ■■■ 敲击多  ■■ 敲击中  ■ 敲击少  □ 未敲击 │
└─────────────────────────────────────────┘
```

#### 设计理念
- **一屏展示**：用户无需切换标签，一眼看到所有关键数据
- **层次清晰**：顶部关键指标 + 底部详细日历
- **信息密度适中**：3个核心指标足够，不会信息过载

#### 关键指标（精简版）
1. **总功德值**：累计功德，体现总体成就
2. **连续活跃天数**：当前连续天数，激励持续使用
3. **存活天数**：从创建到现在的天数，展示陪伴时长

**为什么只保留3个指标？**
- 总敲击次数：与功德值高度相关（1次=1功德），冗余
- 平均每日敲击：计算值，不如直接看日历热力图直观
- 最长连续活跃：历史数据，不如当前连续天数有激励作用

#### 热力图颜色
- **未敲击**：浅灰色 `#eee`
- **敲击少**（1-10 次）：浅绿色 `#c6e48b`
- **敲击中**（11-30 次）：中绿色 `#7bc96f`
- **敲击多**（31+ 次）：深绿色 `#239a3b`
- **今天**：蓝色边框

#### 功能
- 显示3个关键指标卡片
- 显示当月日历热力图
- 根据敲击次数显示颜色
- 支持月份切换（上一月/下一月）
- 悬停显示详细信息

#### 实现
```typescript
interface KeyMetrics {
  totalMerit: number;
  consecutiveDays: number;
  aliveDays: number;
}

interface CalendarDay {
  date: string;              // YYYY-MM-DD
  knocks: number;            // 敲击次数
  color: string;             // 颜色
  isToday: boolean;          // 是否今天
}

function StatsPage() {
  // 加载用户数据和统计数据
  // 计算关键指标
  // 生成日历数据
  // 渲染指标卡片 + 日历
}
```

## 技术实现

### 项目结构扩展
```
src/
├── background/
│   └── services/
│       ├── knock-service.ts        # 敲击记录服务（新增）
│       └── stats-service.ts        # 统计服务（新增）
├── options/
│   ├── Options.tsx                 # Options 页面（新增）
│   ├── Options.css                 # Options 样式（新增）
│   ├── components/
│   │   └── StatsPage.tsx           # 统计页面组件（新增）
│   ├── index.tsx                   # Options 入口（新增）
│   └── index.html                  # Options HTML（新增）
├── shared/
│   ├── types.ts                    # 扩展类型
│   └── utils/
│       ├── date.ts                 # 扩展日期工具
│       └── id-generator.ts         # ID 生成工具（新增）
```

### Options 页面结构
```typescript
// Options.tsx - 简化版，无标签导航
export function Options() {
  return (
    <div className="options-container">
      <header className="options-header">
        <h1>还活着吗 - 数据统计</h1>
      </header>
      <main className="options-main">
        <StatsPage />
      </main>
    </div>
  );
}

// StatsPage.tsx - 合并了关键指标和日历
export function StatsPage() {
  // 加载数据
  // 渲染关键指标卡片（3个）
  // 渲染活跃日历
}
```

## 验收标准

### 功能验收
- [x] 每次敲击保存记录
- [x] 可查询历史记录
- [x] 每日统计正确更新
- [x] 统计页面正确显示
- [x] 关键指标显示准确（总功德、连续天数、存活天数）
- [x] 活跃日历正确显示
- [x] 颜色深浅表示敲击次数
- [x] 可切换月份
- [x] 指标计算准确

### 技术验收
- [x] TypeScript 类型检查通过
- [x] 构建成功无错误
- [ ] 无 Console 错误
- [ ] 数据存储正常
- [ ] Options 页面可正常打开

### 用户体验验收
- [x] 统计页面布局清晰
- [x] 关键指标一目了然
- [x] 日历显示清晰
- [x] 颜色区分明显
- [x] 数据卡片美观
- [x] 页面响应迅速
- [x] 响应式设计适配移动端

## 依赖

- M1：核心功能完成
- 敲击记录和统计数据

## 风险

### 技术风险
1. **数据量过大**
   - 风险：存储大量记录可能影响性能
   - 应对：限制记录数量，定期清理

2. **日历渲染性能**
   - 风险：大量 DOM 元素可能影响性能
   - 应对：使用虚拟滚动或简化渲染

### 产品风险
1. **用户可能想看更多指标**
   - 风险：只显示3个关键指标可能不够
   - 应对：后续可以添加"展开更多"功能，或在 M3 中增加趋势图表

2. **日历信息密度**
   - 风险：用户可能想看更详细的单日数据
   - 应对：后续可以添加点击日期查看详情的功能

## 设计决策

### 为什么合并数据总览和日历？

**问题**：原设计中数据总览和日历是两个独立的标签页，用户需要切换才能看到不同的数据。

**方案对比**：
1. ❌ **独立标签页**：用户需要切换，信息割裂
2. ✅ **合并为一页**：一屏展示所有关键信息，体验流畅

**合并的优势**：
- **信息完整性**：用户一眼看到总体情况（指标）和详细情况（日历）
- **减少操作**：无需切换标签，降低认知负担
- **视觉层次**：顶部概览 + 底部详情，符合用户阅读习惯
- **简化导航**：移除标签导航，界面更简洁

### 为什么只保留3个关键指标？

**原设计有6个指标**：
1. 总功德值 ✅
2. 总敲击次数 ❌（与功德值1:1对应，冗余）
3. 连续活跃天数 ✅
4. 平均每日敲击 ❌（计算值，不如看日历直观）
5. 存活天数 ✅
6. 最长连续活跃 ❌（历史数据，激励作用不如当前连续）

**精简原则**：
- 保留最有价值的核心指标
- 避免信息过载
- 每个指标都有明确的用户价值

## 下一步

完成 M2 后，进入 M3：可视化增强
- 趋势图表（折线图、柱状图）
- 更多数据分析维度
- 成就系统集成
