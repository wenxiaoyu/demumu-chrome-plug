# Chrome Web Store 发布完整指南

本指南将帮助你从零开始将"还活着吗"扩展发布到 Chrome Web Store。

## 📋 发布前检查清单

在开始发布之前，请确保：

- [ ] 扩展功能已完成并测试通过
- [ ] 所有 Firebase 配置已正确设置
- [ ] 已运行 `npm run build` 成功构建
- [ ] 已准备好扩展的图标、截图和宣传图
- [ ] 已准备好扩展的描述文本（中英文）
- [ ] 有一个 Google 账号（用于开发者注册）
- [ ] 准备支付 $5 一次性注册费

---

## 第一部分：准备工作

### 1.1 注册 Chrome Web Store 开发者账号

#### 步骤 1：启用 Google 两步验证（必需）

Chrome Web Store 要求开发者账号必须启用两步验证。

1. 访问 https://myaccount.google.com/security
2. 找到"两步验证"并点击
3. 按照提示设置（推荐使用手机号码或 Google Authenticator）
4. 保存备用验证码

#### 步骤 2：注册开发者账号

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 使用你的 Google 账号登录
3. 阅读并同意开发者协议
4. 支付 $5 一次性注册费

**中国用户支付方案**：

- **方案 1（推荐）**：使用全币种信用卡（Visa/Mastercard）
- **方案 2**：使用 PayPal + 储蓄卡
- **方案 3**：淘宝代付服务（搜索"Chrome 开发者账号代付"）
- **方案 4**：请海外朋友代付

详细支付指南请参考 `docs/.CHROME_WEB_STORE_SETUP.md`

### 1.2 准备扩展资源

#### 图标要求

你需要准备以下尺寸的图标：

| 尺寸    | 用途                           | 文件位置                 |
| ------- | ------------------------------ | ------------------------ |
| 16x16   | 扩展图标（小）                 | `src/icons/icon-16.png`  |
| 48x48   | 扩展图标（中）                 | `src/icons/icon-48.png`  |
| 128x128 | 扩展图标（大）、Web Store 列表 | `src/icons/icon-128.png` |

✅ 项目中已包含这些图标，位于 `src/icons/` 目录。

#### 截图要求

准备 3-5 张扩展的截图：

- **尺寸**: 1280x800 或 640x400（推荐 1280x800）
- **格式**: PNG 或 JPEG
- **内容**: 展示扩展的主要功能
- **建议**:
  1. Popup 界面（敲木鱼功能）
  2. Options 页面（联系人管理）
  3. Options 页面（设置界面）
  4. Options 页面（统计数据）
  5. 邮件预览界面

**如何截图**：

1. 在 Chrome 中加载扩展
2. 打开扩展的各个界面
3. 使用截图工具（Windows: Win+Shift+S，Mac: Cmd+Shift+4）
4. 确保截图清晰、美观

#### 宣传图（可选但推荐）

- **小宣传图**: 440x280 像素
- **大宣传图**: 920x680 像素
- **侯爵宣传图**: 1400x560 像素

可以使用 Figma、Canva 等工具制作。

#### 描述文本

准备以下文本内容：

1. **简短描述**（132 字符以内）
   - 中文示例：一个有趣的生命值管理扩展，通过敲木鱼证明你还活着，并在长时间未活跃时通知紧急联系人。
   - 英文示例：A life management extension that proves you're alive by knocking a wooden fish, with emergency notifications.

2. **详细描述**（16,000 字符以内）
   - 功能介绍
   - 使用方法
   - 特色功能
   - 隐私说明

参考模板见本文档末尾。

---

## 第二部分：首次发布

### 2.1 构建扩展

```bash
# 1. 确保依赖已安装
npm install

# 2. 构建生产版本
npm run build

# 3. 检查 dist 目录
# 应该包含：manifest.json, icons/, _locales/, 以及其他构建文件
```

### 2.2 打包扩展

**Windows**:

```powershell
# 进入 dist 目录
cd dist

# 压缩为 zip（使用 7-Zip 或 WinRAR）
# 或使用 PowerShell
Compress-Archive -Path * -DestinationPath ../extension.zip
cd ..
```

**Mac/Linux**:

```bash
cd dist
zip -r ../extension.zip *
cd ..
```

**重要**:

- 确保 zip 文件的根目录直接包含 `manifest.json`
- 不要压缩 `dist` 文件夹本身，而是压缩其内容

### 2.3 上传到 Chrome Web Store

#### 步骤 1：创建新项目

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击"新增项"按钮
3. 上传 `extension.zip` 文件
4. 等待上传完成（可能需要几分钟）

#### 步骤 2：填写商店信息

**1. 商品详情**

- **商品名称**: 还活着吗 / Are You Still Alive
- **摘要**: （填写简短描述）
- **详细说明**: （填写详细描述，见模板）
- **类别**:
  - 主类别：生产力工具（Productivity）
  - 次类别：健康与健身（Health & Fitness）

**2. 图形资源**

- 上传 128x128 图标（必需）
- 上传截图（至少 1 张，推荐 3-5 张）
- 上传宣传图（可选）

**3. 隐私权**

- **单一用途**: 描述扩展的主要用途

  ```
  这是一个生命值管理和紧急通知扩展，帮助用户通过敲木鱼证明活跃状态，并在长时间未活跃时通知紧急联系人。
  ```

- **权限说明**: 说明为什么需要各项权限

  ```
  - storage: 存储用户数据（敲击记录、联系人等）
  - alarms: 定时检查用户活跃状态
  - identity: Google 账号登录和数据同步
  ```

- **主机权限**: 说明为什么需要访问外部主机

  ```
  - https://identitytoolkit.googleapis.com/*: Firebase 身份验证
  - https://firestore.googleapis.com/*: 云端数据同步
  - https://securetoken.googleapis.com/*: 安全令牌管理
  ```

- **数据使用**: 说明如何使用用户数据

  ```
  我们收集和使用以下数据：
  - 用户的敲击记录和统计数据
  - 紧急联系人信息
  - Google 账号信息（用于身份验证）

  所有数据仅用于提供扩展功能，不会分享给第三方。
  详细隐私政策：[你的隐私政策链接]
  ```

- **认证**: 说明是否经过认证
  - 如果使用 Firebase，选择"是"并提供 Firebase 项目信息

**4. 分发**

- **可见性**:
  - 公开：任何人都可以搜索和安装
  - 不公开：只有知道链接的人可以安装
  - 私有：仅限指定的 Google 账号

- **地区**: 选择所有地区或特定地区

- **定价**: 免费

**5. 语言**

- 添加中文（简体）和英文（美国）
- 为每种语言提供翻译的描述

#### 步骤 3：提交审核

1. 检查所有信息是否填写完整
2. 点击"提交审核"按钮
3. 等待 Google 审核（通常 1-3 个工作日）

**审核状态**：

- **待审核**: 已提交，等待审核
- **审核中**: Google 正在审核
- **已发布**: 审核通过，已上架
- **被拒绝**: 审核未通过，查看拒绝原因并修改

---

## 第三部分：审核和发布

### 3.1 审核过程

Google 会检查以下内容：

1. **功能性**: 扩展是否正常工作
2. **权限**: 是否只请求必要的权限
3. **隐私**: 是否符合隐私政策
4. **内容**: 是否包含违规内容
5. **元数据**: 描述是否准确

### 3.2 常见拒绝原因

1. **权限过多**: 请求了不必要的权限
   - **解决**: 在隐私权说明中详细解释每个权限的用途

2. **描述不清**: 功能描述不够详细
   - **解决**: 补充详细的功能说明和使用方法

3. **截图不足**: 截图太少或不清晰
   - **解决**: 添加更多高质量截图

4. **隐私政策缺失**: 没有提供隐私政策链接
   - **解决**: 创建隐私政策页面并添加链接

5. **单一用途不明确**: 扩展功能太多或不聚焦
   - **解决**: 明确说明扩展的主要用途

### 3.3 审核通过后

1. 扩展会自动发布到 Chrome Web Store
2. 用户可以搜索和安装你的扩展
3. 你会收到邮件通知

### 3.4 获取扩展链接

发布后，你的扩展链接格式为：

```
https://chrome.google.com/webstore/detail/[extension-id]
```

Extension ID 可以在 Developer Dashboard 中找到。

---

## 第四部分：发布后管理

### 4.1 监控和分析

在 Developer Dashboard 中可以查看：

- **安装量**: 总安装数和活跃用户数
- **评分**: 用户评分和评论
- **崩溃报告**: 扩展崩溃统计
- **使用情况**: 用户使用数据

### 4.2 更新扩展

当需要发布新版本时：

1. 更新 `package.json` 和 `src/manifest.json` 中的版本号
2. 运行 `npm run build` 构建新版本
3. 打包为 zip 文件
4. 在 Developer Dashboard 中上传新版本
5. 填写更新说明
6. 提交审核

**版本号规则**：

- 格式：`major.minor.patch`
- 示例：`1.0.0` → `1.0.1`（修复 bug）
- 示例：`1.0.0` → `1.1.0`（新功能）
- 示例：`1.0.0` → `2.0.0`（重大更新）

### 4.3 回复用户评论

- 及时回复用户的问题和反馈
- 感谢用户的好评
- 对差评提供解决方案

### 4.4 处理用户报告

如果用户报告问题：

1. 在 Developer Dashboard 查看详细信息
2. 尝试重现问题
3. 修复并发布更新
4. 回复用户告知已修复

---

## 第五部分：自动化发布（可选）

如果你想实现自动化发布，可以配置 GitHub Actions。

详细步骤请参考 `docs/.CHROME_WEB_STORE_SETUP.md`

**优点**：

- 自动构建和上传
- 减少人工操作
- 版本管理更规范

**缺点**：

- 配置较复杂
- 需要管理 API 凭证

---

## 附录 A：描述文本模板

### 中文描述

**简短描述**：

```
一个有趣的生命值管理扩展，通过敲木鱼证明你还活着，并在长时间未活跃时通知紧急联系人。
```

**详细描述**：

```
# 还活着吗 - 生命值管理扩展

## 🎯 核心功能

### 1. 敲木鱼证明活跃
- 点击木鱼图标证明你还活着
- 每次敲击获得功德值
- 每天首次敲击恢复 10 点生命值（HP）
- 连续活跃天数统计

### 2. 生命值（HP）系统
- 初始 HP：100
- 每天不敲击：-10 HP
- HP 归零：系统判定为"死亡"
- 实时显示当前 HP 状态

### 3. 紧急联系人通知
- 添加紧急联系人（家人、朋友）
- 长时间未活跃时自动发送邮件通知
- 可自定义通知阈值（默认 30 天）
- 支持中英文邮件模板

### 4. 数据统计
- 每日敲击次数统计
- 功德值累计
- 连续活跃天数
- 可视化图表展示

### 5. 云端同步
- Google 账号登录
- 数据自动同步到云端
- 多设备数据共享
- 离线模式支持

## 🌟 特色功能

- **游戏化设计**: 通过敲木鱼的方式让健康管理变得有趣
- **关怀提醒**: 长时间未活跃时通知亲友，体现人文关怀
- **隐私保护**: 所有数据加密存储，不分享给第三方
- **多语言支持**: 完整的中英文双语界面
- **简洁美观**: 精心设计的用户界面

## 📖 使用方法

1. **安装扩展**: 点击"添加至 Chrome"
2. **敲木鱼**: 点击扩展图标，开始敲击木鱼
3. **添加联系人**: 在设置页面添加紧急联系人
4. **登录同步**: 使用 Google 账号登录以启用云端同步
5. **查看统计**: 在统计页面查看你的活跃数据

## 🔒 隐私说明

我们非常重视您的隐私：

- 所有数据仅存储在您的设备和 Google Firebase 中
- 不会收集任何个人敏感信息
- 不会将数据分享给第三方
- 您可以随时删除所有数据

详细隐私政策：[链接]

## 💡 适用场景

- 独居人士的安全保障
- 远程工作者的活跃证明
- 关心家人朋友的健康状态
- 有趣的日常打卡工具

## 🆘 支持

如有问题或建议，请联系：
- 邮箱：[你的邮箱]
- GitHub：[你的 GitHub 仓库]

## 📝 更新日志

### v1.0.0 (2025-01-22)
- 首次发布
- 基础敲木鱼功能
- 生命值系统
- 紧急联系人通知
- 云端数据同步
- 中英文双语支持
```

### 英文描述

**Short Description**:

```
A life management extension that proves you're alive by knocking a wooden fish, with emergency notifications for long inactivity.
```

**Detailed Description**:

```
# Are You Still Alive - Life Management Extension

## 🎯 Core Features

### 1. Knock the Wooden Fish
- Click the wooden fish icon to prove you're alive
- Earn merit points with each knock
- First knock of the day restores 10 HP
- Track consecutive active days

### 2. HP (Health Points) System
- Initial HP: 100
- Daily penalty: -10 HP for inactivity
- HP reaches 0: System marks as "deceased"
- Real-time HP status display

### 3. Emergency Contact Notifications
- Add emergency contacts (family, friends)
- Automatic email notifications for prolonged inactivity
- Customizable notification threshold (default: 30 days)
- Support for bilingual email templates

### 4. Data Statistics
- Daily knock count statistics
- Cumulative merit points
- Consecutive active days
- Visual charts and graphs

### 5. Cloud Sync
- Google account login
- Automatic cloud synchronization
- Multi-device data sharing
- Offline mode support

## 🌟 Highlights

- **Gamification**: Makes health management fun through wooden fish knocking
- **Care Reminder**: Notifies loved ones during prolonged inactivity
- **Privacy Protection**: All data encrypted, never shared with third parties
- **Multilingual**: Full Chinese and English interface
- **Beautiful Design**: Carefully crafted user interface

## 📖 How to Use

1. **Install Extension**: Click "Add to Chrome"
2. **Knock the Fish**: Click extension icon to start knocking
3. **Add Contacts**: Add emergency contacts in settings
4. **Login & Sync**: Sign in with Google account for cloud sync
5. **View Stats**: Check your activity data in statistics page

## 🔒 Privacy

We take your privacy seriously:

- All data stored only on your device and Google Firebase
- No collection of personal sensitive information
- No data sharing with third parties
- You can delete all data anytime

Privacy Policy: [link]

## 💡 Use Cases

- Safety assurance for people living alone
- Activity proof for remote workers
- Health monitoring for family and friends
- Fun daily check-in tool

## 🆘 Support

For questions or suggestions:
- Email: [your email]
- GitHub: [your GitHub repo]

## 📝 Changelog

### v1.0.0 (2025-01-22)
- Initial release
- Basic wooden fish knocking
- HP system
- Emergency contact notifications
- Cloud data sync
- Bilingual support (Chinese/English)
```

---

## 附录 B：隐私政策模板

你需要创建一个隐私政策页面（可以托管在 GitHub Pages 或你的网站上）：

```markdown
# 隐私政策

最后更新：2025-01-22

## 数据收集

我们收集以下数据：

1. **用户活动数据**
   - 敲击木鱼的时间和次数
   - 功德值和生命值
   - 连续活跃天数

2. **联系人信息**
   - 紧急联系人的姓名和邮箱
   - 联系人关系和优先级

3. **账号信息**
   - Google 账号的基本信息（邮箱、显示名称）
   - 用于身份验证和数据同步

## 数据使用

我们使用收集的数据用于：

1. 提供扩展的核心功能
2. 在长时间未活跃时发送通知
3. 同步数据到云端
4. 改进扩展功能

## 数据存储

- 本地数据存储在 Chrome Storage
- 云端数据存储在 Google Firebase
- 所有数据传输使用 HTTPS 加密

## 数据分享

我们不会将您的数据分享给任何第三方，除非：

1. 获得您的明确同意
2. 法律要求

## 数据删除

您可以随时：

1. 在扩展设置中删除本地数据
2. 注销账号以删除云端数据
3. 联系我们请求删除所有数据

## 联系我们

如有隐私相关问题，请联系：

- 邮箱：[你的邮箱]

## 政策更新

我们可能会更新此隐私政策。更新后会在扩展中通知用户。
```

---

## 附录 C：常见问题

### Q1: 审核需要多长时间？

**A**: 通常 1-3 个工作日，复杂的扩展可能需要更长时间。

### Q2: 审核被拒绝怎么办？

**A**: 查看拒绝原因，修改后重新提交。可以在 Developer Dashboard 中查看详细的拒绝理由。

### Q3: 可以修改已发布的扩展吗？

**A**: 可以。上传新版本并提交审核即可。

### Q4: 如何删除已发布的扩展？

**A**: 在 Developer Dashboard 中选择扩展，点击"删除"按钮。注意：删除后无法恢复。

### Q5: 扩展被下架了怎么办？

**A**: 查看下架原因，修复问题后申请重新审核。

### Q6: 可以更改扩展的 Extension ID 吗？

**A**: 不可以。Extension ID 是永久的，无法更改。

### Q7: 如何处理用户的差评？

**A**:

1. 礼貌回复，了解问题
2. 如果是 bug，修复并发布更新
3. 如果是误解，耐心解释
4. 请求用户更新评价

### Q8: 扩展可以收费吗？

**A**: 可以，但需要使用 Chrome Web Store 的付费系统。本扩展目前是免费的。

---

## 附录 D：有用的链接

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store 政策](https://developer.chrome.com/docs/webstore/program-policies/)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 总结

发布到 Chrome Web Store 的主要步骤：

1. ✅ 注册开发者账号（$5）
2. ✅ 准备扩展资源（图标、截图、描述）
3. ✅ 构建并打包扩展
4. ✅ 上传到 Chrome Web Store
5. ✅ 填写商店信息
6. ✅ 提交审核
7. ✅ 等待审核通过
8. ✅ 发布成功！

祝你发布顺利！🎉

如有问题，欢迎随时咨询。
