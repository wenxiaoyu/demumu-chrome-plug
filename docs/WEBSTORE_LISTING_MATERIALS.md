# Chrome Web Store 发布物料

本文档包含所有 Chrome Web Store 发布所需的物料，可直接复制使用。

---

## 📦 基本信息

### 扩展名称

**中文**：还活着吗

**英文**：Are You Still Alive

### 简短描述（132 字符以内）

**中文**：

```
通过禅意的敲木鱼方式追踪生命值，长时间未活跃时自动通知紧急联系人。支持功德值累积、数据同步和多语言。
```

（60 字符）

**英文**：

```
Track your life points by knocking a wooden fish. Auto-notify emergency contacts during inactivity. Merit system & cloud sync.
```

（132 字符）

---

## 📝 详细描述

### 中文版本

```markdown
# 还活着吗 - 禅意生命追踪工具

一款独特的 Chrome 浏览器扩展，通过禅意的敲木鱼方式和功德值系统，帮助你保持活跃，并在长时间未活跃时自动通知紧急联系人。

## ✨ 核心功能

### 🪵 敲木鱼系统

- 禅意交互：点击木鱼，感受宁静的敲击体验
- 无限敲击：每天可以无限次敲击，没有次数限制
- 视觉反馈：优雅的动画效果和声波扩散
- 俯视视角：从上往下看的木鱼设计，更具禅意

### 🙏 功德值系统

功德值是一个多维度的累积系统：

- 基础功德：每次敲击 +1
- 每日首次加成：每天第一次敲击 +5
- 连击加成：3秒内连续敲击，每次额外 +1（最多+5）
- 连续天数加成：每连续一天 +0.5（最多+10）
- 里程碑奖励：达到特定次数获得大额奖励

功德等级：新手 → 初学者 → 初窥门径 → 虔诚信徒 → 修行有成 → 大德高僧 → 功德圆满

### 💯 生命值（HP）系统

- 初始值：100 HP
- 每日首次敲击：+10 HP
- 每天不敲击：-10 HP
- 状态显示：😊 存活中（HP > 0）/ 💀 已往生（HP = 0）
- 连续天数：显示连续打卡天数，配有🔥火焰图标

### 📧 紧急联系人通知

- 添加紧急联系人（姓名、邮箱、关系）
- 设置通知阈值（默认 7 天未活跃）
- 自定义邮件模板和消息
- 邮件预览功能
- 自动发送通知邮件

### ☁️ 云端同步

- Google 账号登录
- 多设备数据同步
- 联系人信息同步
- 设置和偏好同步
- 安全的数据加密

### 📊 数据统计

- 今日敲击次数
- 累积功德值
- 历史总敲击次数
- 连续活跃天数
- 日历视图展示

### 🌍 多语言支持

- 简体中文
- English（英语）
- 界面语言一键切换

## 🎨 设计理念

### 禅意美学

- 色彩：温暖的米色/茶色系，营造宁静氛围
- 字体：衬线字体，增加书卷气
- 动画：缓慢平和的动画节奏
- 装饰：禅圆、微妙纹理等禅意元素
- 透明度：毛玻璃效果，层次分明

### 交互设计

- 简洁：一键敲击，无复杂操作
- 反馈：即时的视觉和数据反馈
- 专注：去除干扰，专注当下
- 平和：柔和的色彩和动画

## 📖 使用指南

### 基础使用

1. 点击浏览器工具栏中的扩展图标
2. 点击中间的木鱼，感受禅意的敲击
3. 查看底部的数据统计
4. 每天至少敲击一次，维持生命值

### 进阶功能

1. 连击加成：快速连续敲击（3秒内），获得额外功德
2. 每日首次：每天第一次敲击有 +5 功德加成
3. 连续打卡：连续多天打卡，每天额外 +0.5 功德
4. 里程碑：达到特定敲击次数时，获得大额功德奖励

### 紧急联系人设置

1. 点击"设置"按钮进入选项页面
2. 切换到"联系人"标签
3. 点击"添加联系人"
4. 填写联系人信息（姓名、邮箱、关系）
5. 设置通知阈值（默认 7 天）
6. 自定义邮件模板（可选）

### 云端同步

1. 点击"登录"按钮
2. 使用 Google 账号登录
3. 数据自动同步到云端
4. 在其他设备登录同一账号即可同步数据

## 🔒 隐私保护

- 本地优先：核心功能无需联网即可使用
- 数据加密：所有网络传输使用 HTTPS 加密
- 用户控制：您完全控制自己的数据
- 不会出售：我们不会将您的数据出售给第三方
- 透明政策：详细的隐私政策说明

## 🆘 常见问题

**Q: 功德值会减少吗？**
A: 不会。功德值只增不减，是永久累积的。

**Q: 生命值降到0会怎样？**
A: 状态会变为"已往生"（💀），但可以继续敲木鱼，每日首次敲击仍可恢复 +10 HP。

**Q: 连击加成如何触发？**
A: 在 3 秒内连续敲击，每次可获得额外 +1 功德（最多 +5）。

**Q: 数据存储在哪里？**
A: 默认存储在本地浏览器中。登录 Google 账号后，数据会同步到云端。

**Q: 如何备份数据？**
A: 登录 Google 账号即可自动备份到云端。

**Q: 紧急联系人会收到什么邮件？**
A: 当您超过设定天数未活跃时，系统会向联系人发送您自定义的邮件，告知您可能需要关注。

## 🔗 相关链接

- 隐私政策：[查看完整隐私政策]
- GitHub 仓库：https://github.com/wenxiaoyu/demumu-chrome-plug
- 问题反馈：https://github.com/wenxiaoyu/demumu-chrome-plug/issues

## 💬 联系我们

如有问题或建议，欢迎通过以下方式联系：

- 邮箱：demumu123@gmail.com
- GitHub Issues：https://github.com/wenxiaoyu/demumu-chrome-plug/issues

---

**开发者**：wenxy
**版本**：1.0.0
**许可证**：MIT License
```

### 英文版本

```markdown
# Are You Still Alive - Zen Life Tracker

A unique Chrome extension featuring a zen wooden fish knocking experience and merit system to keep you active, with automatic emergency contact notifications during prolonged inactivity.

## ✨ Core Features

### 🪵 Wooden Fish System

- Zen Interaction: Click the wooden fish for a peaceful knocking experience
- Unlimited Knocks: No daily limit on knocking
- Visual Feedback: Elegant animations and sound wave effects
- Top-Down View: Wooden fish design viewed from above for enhanced zen feeling

### 🙏 Merit Point System

A multi-dimensional accumulation system:

- Base Merit: +1 per knock
- Daily First Bonus: +5 for first knock of the day
- Combo Bonus: +1 extra for consecutive knocks within 3 seconds (max +5)
- Streak Bonus: +0.5 per consecutive day (max +10)
- Milestone Rewards: Large bonuses at specific knock counts

Merit Levels: Novice → Beginner → Initiated → Devotee → Accomplished → Master → Enlightened

### 💯 Health Points (HP) System

- Initial Value: 100 HP
- Daily First Knock: +10 HP
- Daily Inactivity: -10 HP
- Status Display: 😊 Alive (HP > 0) / 💀 Passed Away (HP = 0)
- Streak Counter: Shows consecutive check-in days with 🔥 flame icon

### 📧 Emergency Contact Notifications

- Add emergency contacts (name, email, relationship)
- Set notification threshold (default: 7 days of inactivity)
- Customize email templates and messages
- Email preview functionality
- Automatic notification emails

### ☁️ Cloud Sync

- Google account login
- Multi-device data synchronization
- Contact information sync
- Settings and preferences sync
- Secure data encryption

### 📊 Data Statistics

- Today's knock count
- Accumulated merit points
- Total historical knocks
- Consecutive active days
- Calendar view display

### 🌍 Multi-Language Support

- Simplified Chinese (简体中文)
- English
- One-click language switching

## 🎨 Design Philosophy

### Zen Aesthetics

- Colors: Warm beige/tea tones creating a peaceful atmosphere
- Typography: Serif fonts for scholarly elegance
- Animation: Slow and peaceful animation rhythm
- Decoration: Zen circles and subtle textures
- Transparency: Frosted glass effects with clear layering

### Interaction Design

- Simplicity: One-click knocking, no complex operations
- Feedback: Immediate visual and data feedback
- Focus: Remove distractions, focus on the present
- Peace: Soft colors and animations

## 📖 User Guide

### Basic Usage

1. Click the extension icon in your browser toolbar
2. Click the wooden fish in the center for a zen knocking experience
3. View statistics at the bottom
4. Knock at least once daily to maintain HP

### Advanced Features

1. Combo Bonus: Knock rapidly (within 3 seconds) for extra merit
2. Daily First: First knock of the day grants +5 merit bonus
3. Streak Bonus: Consecutive daily check-ins earn +0.5 merit per day
4. Milestones: Reach specific knock counts for large merit rewards

### Emergency Contact Setup

1. Click "Settings" to enter options page
2. Switch to "Contacts" tab
3. Click "Add Contact"
4. Fill in contact information (name, email, relationship)
5. Set notification threshold (default: 7 days)
6. Customize email template (optional)

### Cloud Sync

1. Click "Login" button
2. Sign in with Google account
3. Data automatically syncs to cloud
4. Log in with same account on other devices to sync data

## 🔒 Privacy Protection

- Local First: Core features work offline
- Data Encryption: All network transmissions use HTTPS encryption
- User Control: You have complete control over your data
- No Selling: We never sell your data to third parties
- Transparent Policy: Detailed privacy policy available

## 🆘 FAQ

**Q: Will merit points decrease?**
A: No. Merit points only increase and accumulate permanently.

**Q: What happens when HP reaches 0?**
A: Status changes to "Passed Away" (💀), but you can continue knocking. Daily first knock still restores +10 HP.

**Q: How to trigger combo bonus?**
A: Knock consecutively within 3 seconds to earn +1 extra merit per knock (max +5).

**Q: Where is data stored?**
A: By default, data is stored locally in your browser. After logging in with Google account, data syncs to the cloud.

**Q: How to backup data?**
A: Log in with your Google account for automatic cloud backup.

**Q: What emails will emergency contacts receive?**
A: When you're inactive beyond the set threshold, the system sends your customized email to contacts, informing them you may need attention.

## 🔗 Related Links

- Privacy Policy: [View Full Privacy Policy]
- GitHub Repository: https://github.com/wenxiaoyu/demumu-chrome-plug
- Issue Tracker: https://github.com/wenxiaoyu/demumu-chrome-plug/issues

## 💬 Contact Us

For questions or suggestions, please contact us:

- Email: demumu123@gmail.com
- GitHub Issues: https://github.com/wenxiaoyu/demumu-chrome-plug/issues

---

**Developer**: wenxy
**Version**: 1.0.0
**License**: MIT License
```

---

## 🖼️ 图片资源

### 图标文件（已准备）

- ✅ `dist/icons/icon-16.png` (16x16)
- ✅ `dist/icons/icon-48.png` (48x48)
- ✅ `dist/icons/icon-128.png` (128x128)

### 截图文件（已调整尺寸）

- ✅ `images/screenshot-01-1280x800.png` (1280x800, 24-bit RGB)
- ✅ `images/screenshot-02-en-1280x800.png` (1280x800, 24-bit RGB)

### 宣传图片（已调整尺寸）

- ✅ `images/440x280.png` (440x280, 24-bit RGB) - 小型宣传图
- ✅ `images/1400x560_01.png` (1400x560) - 大型宣传图

---

## 🏷️ 分类和标签

### 推荐类别

**主类别**：Workflow & Planning（工作流与规划）

**备选类别**：

- Fun（娱乐）
- Social & Communication（社交与通讯）

### 标签建议

```
check-in, habit tracker, productivity, gamification, zen, wooden fish,
life tracker, emergency contact, cloud sync, merit system
```

---

## 🔑 权限说明

### 必需权限及理由

#### storage

**用途**：存储用户的打卡记录和设置信息

**详细说明**：

```
存储用户的每日打卡时间、紧急联系人信息和扩展设置。
这是实现活跃状态追踪的核心功能所必需的。
```

**英文**：

```
Store user's daily check-in times, emergency contact information, and extension settings.
Essential for implementing activity status tracking.
```

---

#### notifications

**用途**：提醒用户打卡

**详细说明**：

```
当用户长时间未打卡时，发送浏览器通知提醒用户。
这是活跃状态追踪功能的重要组成部分。
```

**英文**：

```
Send browser notifications to remind users to check in when they haven't done so for a while.
An important part of the activity tracking feature.
```

---

#### alarms

**用途**：定时检查用户活跃状态

**详细说明**：

```
定期检查用户的打卡状态，判断是否需要发送紧急通知。
这是自动通知紧急联系人功能的核心机制。
```

**英文**：

```
Periodically check user's check-in status to determine if emergency notifications are needed.
Core mechanism for automatic emergency contact notification.
```

---

#### identity

**用途**：Google 账号登录（可选功能）

**详细说明**：

```
允许用户使用 Google 账号登录以启用云端数据同步功能。
这是可选功能，用户可以选择仅使用本地存储。
```

**英文**：

```
Allow users to log in with Google account to enable cloud data synchronization.
This is optional - users can choose to use local storage only.
```

---

### 主机权限说明

#### https://_.firebaseapp.com/_

**用途**：Firebase 身份验证

**详细说明**：

```
用于 Google 账号登录的身份验证服务。
仅在用户选择使用云端同步功能时使用。
```

**英文**：

```
Used for Google account authentication service.
Only used when users choose to enable cloud sync.
```

---

#### https://_.googleapis.com/_

**用途**：Google API 服务

**详细说明**：

```
用于访问 Google 身份验证和 Firestore 数据库服务。
仅在用户选择使用云端同步功能时使用。
```

**英文**：

```
Used to access Google authentication and Firestore database services.
Only used when users choose to enable cloud sync.
```

---

#### https://securetoken.googleapis.com/*

**用途**：安全令牌验证

**详细说明**：

```
用于验证用户的登录令牌，确保账号安全。
仅在用户选择使用云端同步功能时使用。
```

**英文**：

```
Used to verify user login tokens to ensure account security.
Only used when users choose to enable cloud sync.
```

---

#### https://identitytoolkit.googleapis.com/*

**用途**：身份验证工具包

**详细说明**：

```
Google 身份验证工具包的 API 端点。
仅在用户选择使用云端同步功能时使用。
```

**英文**：

```
API endpoint for Google Identity Toolkit.
Only used when users choose to enable cloud sync.
```

---

### 权限使用总结

**核心功能权限**（必需）：

- `storage` - 存储打卡记录
- `notifications` - 提醒用户打卡
- `alarms` - 定时检查活跃状态

**可选功能权限**（用户可选择不使用）：

- `identity` + 主机权限 - 云端同步功能

所有权限都直接支持扩展的单一用途：帮助用户通过每日打卡保持活跃，并在长时间未活跃时自动通知紧急联系人。

---

## 📋 单一用途说明

### 中文

```
帮助用户通过每日打卡保持活跃，并在长时间未活跃时自动通知紧急联系人。
```

### 英文

```
Help users stay active through daily check-ins and automatically notify emergency contacts during prolonged inactivity.
```

### 详细说明（如需要）

**中文**：

```
本扩展是一个活跃状态追踪工具。用户通过点击木鱼进行每日打卡，扩展会追踪用户的活跃状态。
当用户超过设定天数未打卡时，扩展会自动向用户预设的紧急联系人发送通知邮件。
所有其他功能（数据统计、云端同步、多语言支持）都是为了支持这一核心用途。
```

**英文**：

```
This extension is an activity tracking tool. Users check in daily by clicking a wooden fish,
and the extension tracks their activity status. When users haven't checked in for a set number
of days, the extension automatically sends notification emails to preset emergency contacts.
All other features (statistics, cloud sync, multi-language support) support this core purpose.
```

---

## 🌐 隐私政策链接

**完整隐私政策文档**：`PRIVACY_POLICY.md`

**在线链接**（发布后需要提供）：

```
https://github.com/wenxiaoyu/demumu-chrome-plug/blob/main/PRIVACY_POLICY.md
```

---

## 📦 发布检查清单

### 文件准备

- [x] extension.zip（从 dist 目录打包）
- [x] 图标文件（16x16, 48x48, 128x128）
- [x] 截图文件（至少 1 张，1280x800）
- [x] 宣传图片（440x280, 1400x560）
- [x] 隐私政策文档

### 信息准备

- [x] 扩展名称（中英文）
- [x] 简短描述（132 字符以内）
- [x] 详细描述（中英文）
- [x] 分类选择
- [x] 权限说明
- [x] 单一用途说明
- [x] 隐私政策链接

### 测试验证

- [ ] 在 Chrome 中加载测试
- [ ] 所有功能正常工作
- [ ] 无控制台错误
- [ ] 权限请求合理
- [ ] 隐私政策可访问

---

## 🚀 发布步骤

1. **构建扩展**

   ```bash
   pnpm build
   cd dist
   # Windows PowerShell
   Compress-Archive -Path * -DestinationPath ../extension.zip -Force
   cd ..
   ```

2. **访问 Chrome Web Store Developer Dashboard**
   https://chrome.google.com/webstore/devconsole

3. **上传扩展包**
   - 点击"新增项"
   - 上传 `extension.zip`

4. **填写商店信息**
   - 复制本文档中的对应内容
   - 上传图片资源
   - 填写权限说明

5. **提交审核**
   - 检查所有信息
   - 提交审核
   - 等待 1-3 个工作日

---

## 📞 支持信息

**开发者邮箱**：demumu123@gmail.com

**支持网站**：https://github.com/wenxiaoyu/demumu-chrome-plug

**问题反馈**：https://github.com/wenxiaoyu/demumu-chrome-plug/issues

---

**最后更新**：2025-01-23
**版本**：1.0.0
