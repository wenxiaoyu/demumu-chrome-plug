# 阶段 1：MVP 本地版 - 任务清单

## 任务列表

### 1. 数据模型和存储（1 天）

- [ ] 1.1 定义类型
  - 更新 `src/shared/types.ts`
  - 定义 `UserData` 接口（包含功德值、敲击次数等）
  - 定义 `KnockRecord` 接口
  - 定义 `DailyStats` 接口
  - 定义 `KnockResult` 接口
  - 导出所有类型

- [ ] 1.2 更新存储管理
  - 检查 `src/shared/storage.ts`
  - 确保支持新的数据结构

- [ ] 1.3 更新常量
  - 更新 `src/shared/constants.ts`
  - 更新 `STORAGE_KEYS`（添加 DAILY_STATS）
  - 保持 `HP_CONFIG` 不变
  - 更新 `NOTIFICATION_CONFIG`（敲木鱼相关通知）

### 2. 工具函数（1 天）

- [ ] 2.1 日期工具
  - 创建 `src/shared/utils/date.ts`
  - 实现 `isSameDay()` - 判断是否同一天
  - 实现 `getDaysDiff()` - 计算天数差
  - 实现 `getStartOfDay()` - 获取当天 00:00
  - 实现 `formatDate()` - 格式化日期

- [ ] 2.2 HP 计算工具
  - 创建 `src/shared/utils/hp-calculator.ts`
  - 实现 `calculateCurrentHP()` - 计算当前 HP
  - 实现 `calculateKnockReward()` - 计算敲击奖励
  - 实现 `getHPColor()` - 获取 HP 颜色
  - 实现 `getHPStatus()` - 获取 HP 状态

- [ ] 2.3 ID 生成工具
  - 创建 `src/shared/utils/id-generator.ts`
  - 实现 `generateUserId()` - 生成用户 ID
  - 实现 `generateRecordId()` - 生成记录 ID

### 3. 核心服务（3 天）

- [ ] 3.1 HP 服务
  - 创建 `src/background/services/hp-service.ts`
  - 实现 `HPService` 类
  - 实现 HP 计算逻辑
  - 实现 HP 状态判断
  - 添加单元测试（可选）

- [ ] 3.2 敲木鱼服务
  - 创建 `src/background/services/knock-service.ts`
  - 实现 `KnockService` 类
  - 实现 `knock()` 方法（核心逻辑）
  - 实现 `getKnockHistory()` 方法
  - 实现 `getDailyStats()` 方法
  - 实现连续活跃天数计算
  - 实现跨天检测和重置逻辑
  - 添加单元测试（可选）

- [ ] 3.3 通知服务
  - 创建 `src/background/services/notification-service.ts`
  - 实现 `NotificationService` 类
  - 实现 `showFirstKnockToday()` 方法
  - 实现 `showDeathWarning()` 方法
  - 实现 `showHPWarning()` 方法
  - 设计通知文案（禅意风格）

- [ ] 3.4 状态检查服务
  - 创建 `src/background/services/status-checker.ts`
  - 实现 `StatusChecker` 类
  - 实现 `checkAndUpdate()` 方法
  - 实现 `scheduleNextCheck()` 方法
  - 实现用户初始化逻辑
  - 实现跨天重置逻辑

### 4. Background Service Worker（1 天）

- [ ] 4.1 设置入口
  - 创建 `src/background/index.ts`
  - 初始化所有服务
  - 设置消息监听器

- [ ] 4.2 定时任务
  - 创建 `src/background/handlers/alarm-handler.ts`
  - 实现定时检查逻辑
  - 在 `onInstalled` 中创建 alarm
  - 在 `onAlarm` 中处理检查

- [ ] 4.3 生命周期事件
  - 监听 `onStartup` 事件
  - 监听 `onInstalled` 事件
  - 在启动时检查状态
  - 在安装时初始化数据

- [ ] 4.4 Badge 更新
  - 实现 Badge 更新逻辑
  - 根据 HP 显示不同颜色
  - 显示 HP 数值

### 5. Popup 页面（2 天）

- [ ] 5.1 基础布局
  - 创建 `src/popup/Popup.tsx`
  - 设计整体布局
  - 添加基础样式

- [ ] 5.2 木鱼组件
  - 创建 `src/popup/components/WoodenFish.tsx`
  - 实现木鱼按钮/图形
  - 添加点击交互
  - 添加简单的点击反馈（阶段 1 简单动画）
  - 显示今日敲击次数

- [ ] 5.3 HP 进度条组件
  - 创建 `src/popup/components/HPBar.tsx`
  - 实现 HP 进度条
  - 根据 HP 显示不同颜色
  - 显示 HP 数值

- [ ] 5.4 状态显示组件
  - 创建 `src/popup/components/StatusDisplay.tsx`
  - 显示存活状态（表情 + 文字）
  - 显示连续活跃天数
  - 显示功德值

- [ ] 5.5 统计信息组件
  - 创建 `src/popup/components/Stats.tsx`
  - 显示功德值
  - 显示今日敲击次数
  - 显示总敲击次数

- [ ] 5.6 自定义 Hooks
  - 创建 `src/popup/hooks/useUserData.ts`
  - 实现用户数据获取和更新
  - 创建 `src/popup/hooks/useKnock.ts`
  - 实现敲木鱼逻辑封装

### 6. Options 页面（3 天）

- [ ] 6.1 基础布局
  - 创建 `src/options/Options.tsx`
  - 设计页面布局
  - 添加导航/标签页

- [ ] 6.2 活跃日历组件
  - 创建 `src/options/components/Calendar.tsx`
  - 实现月历视图
  - 显示敲击记录（热力图）
  - 颜色深浅表示敲击次数
  - 支持月份切换
  - 添加图例说明

- [ ] 6.3 统计图表组件
  - 创建 `src/options/components/StatsChart.tsx`
  - 实现连续活跃趋势图
  - 实现 HP 变化曲线图
  - 实现每日敲击次数趋势图
  - 实现功德值累计曲线
  - 使用简单的 SVG 或 Canvas

- [ ] 6.4 数据总览组件
  - 创建 `src/options/components/DataOverview.tsx`
  - 显示总功德值
  - 显示总敲击次数
  - 显示最长连续活跃
  - 显示平均每日敲击
  - 显示存活天数

- [ ] 6.5 设置选项（可选）
  - 添加通知设置
  - 添加数据导出功能
  - 添加数据清除功能

### 7. 样式和动画（1 天）

- [ ] 7.1 全局样式
  - 定义 CSS 变量（颜色、字体、间距）
  - 设置全局样式
  - 确保响应式设计
  - 禅意风格设计

- [ ] 7.2 组件样式
  - 完善 Popup 页面样式
  - 完善 Options 页面样式
  - 木鱼组件样式
  - 确保视觉一致性

- [ ] 7.3 动画效果
  - 木鱼点击动画（简单）
  - HP 变化动画
  - 页面过渡动画

### 8. 测试和优化（2 天）

- [ ] 8.1 功能测试
  - 测试敲木鱼流程
  - 测试功德值累计
  - 测试连续活跃计算
  - 测试跨天重置
  - 测试 HP 计算
  - 测试通知显示
  - 测试数据持久化

- [ ] 8.2 边界测试
  - 测试首次使用
  - 测试跨天敲击
  - 测试断活情况
  - 测试 HP 归零
  - 测试数据清除
  - 测试大量敲击（性能）

- [ ] 8.3 性能优化
  - 检查内存使用
  - 优化存储读写
  - 优化渲染性能

- [ ] 8.4 代码质量
  - 运行 TypeScript 类型检查
  - 运行 ESLint 检查
  - 格式化代码
  - 添加必要的注释

### 9. 文档和发布（1 天）

- [ ] 9.1 更新文档
  - 更新 README.md
  - 添加使用说明
  - 添加截图

- [ ] 9.2 准备发布
  - 构建生产版本
  - 测试打包后的插件
  - 创建 release notes

- [ ] 9.3 版本管理
  - 更新版本号为 v0.2.0
  - 创建 Git 标签
  - 推送到 GitHub

- [ ] 9.4 用户反馈
  - 准备反馈收集表单
  - 设置问题追踪
  - 准备下一阶段规划

## 完成标准

### 必须完成
- 所有核心功能任务（1-6）完成
- 功能测试通过
- 代码质量检查通过

### 可选完成
- 单元测试
- 高级动画效果
- 详细的设置选项

## 时间安排

**第 1 周：**
- Day 1-2：数据模型、工具函数、核心服务
- Day 3-4：Background Service Worker、Popup 页面
- Day 5：Options 页面（部分）

**第 2 周：**
- Day 1-2：Options 页面（完成）、样式和动画
- Day 3-4：测试和优化
- Day 5：文档和发布

## 注意事项

1. **优先级**：核心功能 > 可视化 > 动画效果
2. **测试**：每完成一个模块立即测试
3. **提交**：完成一个大任务后提交代码
4. **文档**：关键函数添加注释
5. **性能**：注意 Service Worker 的生命周期限制
6. **禅意**：保持界面简洁，文案有禅意

## 下一步

完成所有任务后：
1. 更新 `openspec/project.md` 标记阶段 1 完成
2. 创建 v0.2.0 版本标签
3. 收集用户反馈
4. 开始规划阶段 2（音效、动画、成就系统）
