# 玩法说明功能实现总结

## 概述

根据用户需求，在设置页面中：
1. 移除了死亡检测的"当前状态"显示和"立即检测"功能
2. 移除了"检测间隔"配置（改为服务端自动检测）
3. 保留了死亡检测的核心配置（启用开关、未活跃天数阈值、HP阈值）
4. 添加了玩法说明区域，帮助用户理解插件的核心玩法和规则

## 实现内容

### 1. 移除的功能

从 `SettingsPage.tsx` 中移除了以下功能：

- ❌ "当前状态"显示区域（状态卡片）
- ❌ "立即检测"按钮
- ❌ 检测间隔配置（下拉选择框）
- ❌ 相关的状态管理代码（status, checking 状态）

### 2. 保留的死亡检测配置

✅ 保留了核心配置功能：

- 启用/禁用死亡检测开关
- 未活跃天数阈值设置（滑块，3-30天）
- HP 阈值设置（滑块，0-100）

**说明更新**：
- 描述文本更新为"服务端会根据您的配置自动检测活跃状态"
- 开关说明更新为"开启后服务端将定期检测您的活跃状态"

### 3. 新增的玩法说明

添加了完整的玩法说明区域，包含以下内容：

#### 如何玩 🪵
- 点击弹窗中的木鱼图标即可敲击
- 每次敲击都会增加功德值
- 每天第一次敲击会获得额外奖励

#### 功德值系统 🙏
- 基础功德：每次敲击 +1
- 首次奖励：每天第一次敲击 +5
- 连击奖励：连续敲击可获得额外功德
- 里程碑奖励：达到特定次数可获得大量功德

#### 生命值系统 ❤️
- 初始生命值：100
- 每日奖励：每天第一次敲击 +10 HP
- 未活跃惩罚：每天未敲击 -10 HP
- 生命值归零：将触发死亡检测

#### 连续打卡 🔥
- 连续多天敲击木鱼可以累积连续天数
- 连续天数越长，获得的奖励越多
- 中断后需要重新开始累积

#### 小贴士 💡
- 每天至少敲击一次木鱼，保持生命值不归零
- 连续打卡可以获得更多奖励，尽量不要中断
- 登录账号可以将数据同步到云端，在多设备间同步

### 3. 国际化支持

按照项目规范，所有文本都支持中英文双语：

#### 中文翻译键（zh_CN/messages.json）
- `gameplay_title` - 玩法说明
- `gameplay_intro` - 欢迎使用说明
- `gameplay_knock_title` - 如何玩
- `gameplay_knock_desc` - 敲击说明
- `gameplay_merit_title` - 功德值系统
- `gameplay_merit_desc` - 功德值描述
- `gameplay_merit_base` - 基础功德
- `gameplay_merit_first` - 首次奖励
- `gameplay_merit_combo` - 连击奖励
- `gameplay_merit_milestone` - 里程碑奖励
- `gameplay_hp_title` - 生命值系统
- `gameplay_hp_desc` - 生命值描述
- `gameplay_hp_initial` - 初始生命值
- `gameplay_hp_reward` - 每日奖励
- `gameplay_hp_penalty` - 未活跃惩罚
- `gameplay_hp_death` - 生命值归零
- `gameplay_streak_title` - 连续打卡
- `gameplay_streak_desc` - 连续打卡描述
- `gameplay_tips_title` - 小贴士
- `gameplay_tip1` - 提示1
- `gameplay_tip2` - 提示2
- `gameplay_tip3` - 提示3

#### 英文翻译（translate-en.js）
所有翻译键都已添加对应的英文翻译，并通过 `node scripts/translate-en.js` 生成到 `en/messages.json`。

### 4. 样式更新

在 `SettingsPage.css` 中：

- 保留了死亡检测配置相关的样式（toggle switch、setting controls 等）
- 移除了状态卡片相关的样式
- 添加了玩法说明的样式：
  - `.gameplay-guide` - 主容器样式
  - `.gameplay-intro` - 介绍文本样式
  - `.gameplay-item` - 每个玩法项的布局
  - `.gameplay-icon` - 图标样式
  - `.gameplay-content` - 内容区域样式
  - `.gameplay-list` - 列表样式
  - `.gameplay-tips` - 提示框样式
- 添加了响应式设计，适配移动端显示

### 5. 保留的功能

设置页面仍然保留以下功能：

- 语言选择器（LanguageSelector）
- 数据同步状态（SyncStatus）
- 死亡检测配置（启用开关、阈值设置）
- 邮件预览（EmailPreview）

## 架构变更说明

### 服务端检测模式

项目已从本地定时检测改为服务端检测模式：

**之前（本地检测）**：
- 客户端配置检测间隔（30分钟、1小时等）
- 客户端通过 Chrome Alarms API 定时执行检测
- 需要浏览器保持运行

**现在（服务端检测）**：
- 客户端只配置检测规则（阈值）
- 服务端自动定期检测用户活跃状态
- 无需客户端定时任务
- 更可靠，不依赖浏览器运行状态

### 配置同步

用户的死亡检测配置会通过 Firestore 同步到服务端：
- 启用/禁用状态
- 未活跃天数阈值
- HP 阈值

服务端根据这些配置自动执行检测逻辑。

## 文件修改清单

### 修改的文件
1. `src/options/components/SettingsPage.tsx` - 移除死亡检测 UI，添加玩法说明
2. `src/options/components/SettingsPage.css` - 更新样式
3. `src/_locales/zh_CN/messages.json` - 添加中文翻译
4. `scripts/translate-en.js` - 添加英文翻译
5. `src/_locales/en/messages.json` - 自动生成的英文翻译

### 新增的文件
- `docs/features/GAMEPLAY_GUIDE_IMPLEMENTATION.md` - 本文档

## 测试建议

### 功能测试
1. 打开 Options 页面，切换到设置标签
2. 验证玩法说明区域正确显示
3. 验证所有图标和文本正确显示
4. 验证响应式布局在不同屏幕尺寸下正常工作

### 国际化测试
1. 在设置中切换到英文
2. 验证所有玩法说明文本正确显示为英文
3. 切换回中文，验证文本正确显示为中文

### 构建测试
1. 运行 `npm run build` 验证构建成功
2. 检查 `dist/_locales/` 目录下的翻译文件

## 注意事项

1. **服务端检测模式**：死亡检测已改为服务端执行，客户端只负责配置规则
2. **配置同步**：配置修改后会自动标记为待同步，通过 Firestore 同步到服务端
3. **邮件预览保留**：邮件预览功能仍然保留，因为它与紧急联系人功能相关
4. **国际化完整性**：所有新增和修改的文本都已完成中英文翻译

## 完成时间

2026-01-22

## 相关任务

- Task 5: 删除设置功能里面的状态检测功能；同时增加一个合理区域显示说明此插件功能的玩法
