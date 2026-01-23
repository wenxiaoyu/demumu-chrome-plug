# 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2025-01-15

### 新增 ✨

#### 核心功能
- 🪵 **敲木鱼系统**
  - 俯视视角的3D木鱼设计
  - 点击动画和声波效果
  - 冲击波扩散效果
  - 鼠标悬停呼吸动画
  - 木鱼震动和形变动画

- 🙏 **功德值系统**
  - 多维度功德计算算法
  - 基础功德：每次 +1
  - 每日首次加成：+5
  - 连击加成：3秒窗口，最多 +5
  - 连续天数加成：每天 +0.5，最多 +10
  - 里程碑奖励：10/50/100/500/1000/5000次
  - 功德等级系统：7个等级称号

- 💯 **生命值（HP）系统**
  - 初始 100 HP
  - 每日首次敲击 +10 HP
  - 每天不敲击 -10 HP
  - 状态显示：存活/往生
  - 连续天数统计
  - 时间惩罚机制

- 📊 **数据统计**
  - 今日敲击次数
  - 总敲击次数
  - 功德值累积
  - 连续打卡天数

#### UI设计
- 🎨 **禅意美学**
  - 温暖的米色/茶色系背景
  - 毛玻璃效果（backdrop-filter）
  - 禅圆装饰元素
  - 微妙的背景纹理
  - 衬线字体设计

- ⚡ **动画效果**
  - 缓慢平和的动画节奏（4-6秒）
  - 木鱼呼吸动画
  - 冲击波扩散动画
  - 声波纹路动画
  - 数值增加动画
  - 图标旋转动画

- 📱 **响应式设计**
  - 固定尺寸：360×600px
  - 无滚动条设计
  - 所有元素在一屏内显示

#### 技术实现
- ⚙️ **项目架构**
  - React 19 + TypeScript
  - Vite 7 构建工具
  - Chrome Extension Manifest V3
  - Chrome Storage API 数据持久化
  - ESLint + Prettier 代码规范

- 📦 **代码组织**
  - 模块化组件设计
  - 工具函数封装
  - 类型定义完善
  - 常量配置管理

### 文档 📖
- README.md - 项目介绍和快速开始
- docs/USER_GUIDE.md - 详细的用户使用指南
- docs/MERIT_SYSTEM.md - 功德值系统详解
- CHANGELOG.md - 更新日志

### 技术细节 🔧
- 功德值计算器：`src/shared/utils/merit-calculator.ts`
- HP计算器：`src/shared/utils/hp-calculator.ts`
- 日期工具：`src/shared/utils/date.ts`
- 数据存储：`src/shared/storage.ts`
- 类型定义：`src/shared/types.ts`

## [未来计划]

### [0.2.0] - 音效和动画增强
- 木鱼敲击音效
- 更多动画效果
- 音效开关设置

### [0.3.0] - 数据可视化
- 活跃日历
- 统计图表
- 趋势分析

### [0.4.0] - 成就系统
- 成就列表
- 成就解锁
- 成就展示

### [0.5.0] - 主题系统
- 多种主题可选
- 自定义主题
- 主题商店

### [1.0.0] - 云端同步
- 用户账号系统
- 数据云端同步
- 多设备同步

---

## 版本说明

- **主版本号（Major）**：重大功能更新或不兼容的API变更
- **次版本号（Minor）**：新增功能，向下兼容
- **修订号（Patch）**：问题修复，向下兼容

## 链接

- [项目主页](https://github.com/wenxiaoyu/alive-checker)
- [问题反馈](https://github.com/wenxiaoyu/alive-checker/issues)
- [讨论区](https://github.com/wenxiaoyu/alive-checker/discussions)
