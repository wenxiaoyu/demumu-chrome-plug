# M2：数据统计 - 任务清单

## 迭代 1.7：敲击记录历史（0.5 天）

### 数据层
- [x] 1.7.1 定义 KnockRecord 类型
  - 在 `src/shared/types.ts` 中定义 `KnockRecord`
  - 包含：id, timestamp, merit, totalMerit, hp, consecutiveDays

- [x] 1.7.2 更新存储键
  - 在 `src/shared/constants.ts` 中添加 `STORAGE_KEYS.KNOCK_HISTORY`

### 逻辑层
- [x] 1.7.3 实现记录 ID 生成
  - 在 `src/shared/utils/id-generator.ts` 中实现 `generateRecordId()`
  - 使用时间戳 + 随机数

- [x] 1.7.4 实现记录保存
  - 在 `src/background/services/knock-service.ts` 中添加 `saveKnockRecord()`
  - 每次敲击保存记录
  - 限制记录数量（最多 365 * 100）

- [x] 1.7.5 实现记录查询
  - 实现 `getKnockHistory(days)` 方法
  - 返回最近 N 天的记录

### 集成
- [x] 1.7.6 集成到敲击流程
  - 在 useKnock 中调用 saveKnockRecord
  - 确保每次敲击都保存记录

### 验收
- [x] 1.7.7 测试记录功能
  - 每次敲击都有记录
  - 记录包含完整信息
  - 可查询历史记录

---

## 迭代 1.8：每日统计（0.5 天）

### 数据层
- [x] 1.8.1 定义 DailyStats 类型
  - 在 `src/shared/types.ts` 中定义 `DailyStats`
  - 包含：date, knocks, merit, hp

- [x] 1.8.2 更新存储键
  - 在 `src/shared/constants.ts` 中添加 `STORAGE_KEYS.DAILY_STATS`

### 工具层
- [x] 1.8.3 扩展日期工具
  - 在 `src/shared/utils/date.ts` 中添加 `formatDate(timestamp, format)`
  - 支持 'YYYY-MM-DD' 格式

### 逻辑层
- [x] 1.8.4 创建 StatsService
  - 创建 `src/background/services/stats-service.ts`
  - 实现 `StatsService` 类

- [x] 1.8.5 实现统计更新
  - 实现 `updateDailyStats(userData)` 方法
  - 每次敲击更新当日统计
  - 自动清理旧数据（> 365 天）

- [x] 1.8.6 实现统计查询
  - 实现 `getDailyStats(days)` 方法
  - 返回最近 N 天的统计

### 集成
- [x] 1.8.7 集成到敲击流程
  - 在 useKnock 中调用 updateDailyStats
  - 确保每次敲击都更新统计

### 验收
- [x] 1.8.8 测试统计功能
  - 每天有独立的统计记录
  - 统计数据准确
  - 可查询历史统计

---

## 迭代 1.9：统计页面（关键指标 + 活跃日历）（1 天）

**注：本迭代采用合并方案，将原 1.9（活跃日历）和 1.10（数据总览）合并为统一的统计页面**

### Options 页面基础
- [x] 1.9.1 创建 Options 页面
  - 创建 `src/options/Options.tsx`
  - 创建 `src/options/index.html`
  - 设置基础布局（无标签导航）

### StatsPage 组件（合并方案）
- [x] 1.9.2 创建 StatsPage 组件
  - 创建 `src/options/components/StatsPage.tsx`
  - 创建 `src/options/components/StatsPage.css`
  - 设置组件结构（关键指标 + 日历）

- [x] 1.9.3 实现关键指标区域
  - 显示 3 个关键指标卡片
  - 总功德值、连续活跃天数、存活天数
  - 实现卡片样式和动画

- [x] 1.9.4 实现月历布局
  - 实现 7x5 网格布局
  - 显示星期标题
  - 显示日期数字

- [x] 1.9.5 实现月份切换
  - 添加上一月/下一月按钮
  - 实现月份状态管理
  - 显示当前年月

- [x] 1.9.6 获取统计数据
  - 获取用户数据
  - 获取当月每日统计
  - 计算每天的敲击次数

- [x] 1.9.7 实现热力图
  - 根据敲击次数计算颜色
  - 应用颜色到日期格子
  - 实现颜色等级（4 级）

- [x] 1.9.8 添加图例
  - 显示颜色图例
  - 说明颜色含义

- [x] 1.9.9 标记今天
  - 给今天的日期添加特殊样式
  - 使用蓝色边框

### 样式
- [x] 1.9.10 实现统计页面样式
  - 设计关键指标卡片样式
  - 设计网格样式
  - 设计日期格子样式
  - 设计热力图颜色
  - 确保响应式

### 验收
- [x] 1.9.11 测试统计页面功能
  - 显示关键指标
  - 显示当月日历
  - 颜色深浅表示敲击次数
  - 可切换月份
  - 今天有特殊标记
  - 图例清晰
  - 构建成功

---

## ~~迭代 1.10：数据总览（0.5 天）~~

**已合并到迭代 1.9，采用统一的统计页面设计**

---

## 完成标准

### 必须完成
- [x] 所有迭代任务完成
- [x] 功能测试通过
- [x] Options 页面可正常打开
- [x] 数据显示准确
- [x] 构建成功无错误

### 验收检查
- [x] 敲击记录正常保存
- [x] 每日统计正确更新
- [x] 统计页面正确显示
- [x] 关键指标显示准确
- [x] 活跃日历正确显示
- [x] TypeScript 类型检查通过
- [ ] 无 Console 错误（需实际测试）
- [ ] 实际使用测试（需用户反馈）

## 重构说明

本次实现采用了**合并方案**，将原计划的"活跃日历"和"数据总览"两个独立页面合并为一个统一的"统计页面"。

**变更原因**：
- 原设计中两个页面需要标签切换，用户体验不佳
- 数据总览的用途不够清晰
- 合并后信息更完整，一屏展示所有关键数据

**详细说明**：参见 `REFACTORING.md`

## 时间安排

**实际完成时间：2 天**

- ✅ Day 1：迭代 1.7 + 1.8（敲击记录 + 每日统计）
- ✅ Day 2：迭代 1.9（统计页面 - 合并方案）

## 下一步

完成 M2 后：
1. ✅ 测试所有数据功能
2. ✅ 构建验证
3. [ ] 实际使用测试
4. [ ] 准备进入 M3：可视化增强
