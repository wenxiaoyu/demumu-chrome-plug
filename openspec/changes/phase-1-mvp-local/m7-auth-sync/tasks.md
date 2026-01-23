# M7：用户认证与云端同步 - 任务清单

## 任务列表

### 1. Firebase 项目设置（0.5 天）

- [ ] 1.1 创建 Firebase 项目
  - 访问 Firebase Console
  - 创建新项目 "alive-checker"
  - 添加 Web 应用
  - 复制配置信息
  - _Requirements: Firebase 项目设置_

- [ ] 1.2 启用 Authentication
  - 进入 Authentication 页面
  - 启用 Google 登录提供商
  - 配置项目公开名称
  - 配置支持邮箱
  - _Requirements: Google 登录_

- [ ] 1.3 创建 Firestore 数据库
  - 创建 Firestore 数据库（生产模式）
  - 选择数据库位置（asia-east1）
  - 配置 Security Rules
  - 创建集合结构（users, userData, knockRecords, dailyStats, emergencyContacts）
  - _Requirements: 数据存储_

- [ ] 1.4 配置 Firebase SDK
  - 安装 firebase 依赖：`npm install firebase`
  - 创建 `src/shared/config/firebase.ts`
  - 添加 Firebase 配置
  - 初始化 Firebase App
  - 导出 auth 和 db 实例
  - _Requirements: SDK 配置_

- [ ] 1.5 更新 manifest.json
  - 添加 "identity" 权限
  - 添加 Firebase 相关的 host_permissions
  - 更新 content_security_policy
  - _Requirements: 权限配置_

### 2. 认证服务实现（1 天）

- [ ] 2.1 创建认证服务
  - 创建 `src/shared/services/auth-service.ts`
  - 实现 AuthService 类
  - 实现 signInWithGoogle() 方法
  - 实现 signOut() 方法
  - 实现 getCurrentUser() 方法
  - 实现 isSignedIn() 方法
  - 实现 onAuthStateChanged() 监听器
  - _Requirements: 认证服务_

- [ ] 2.2 登录状态持久化
  - 实现 saveAuthState() 方法
  - 实现 loadAuthState() 方法
  - 实现 clearAuthState() 方法
  - 使用 Chrome Storage 保存登录状态
  - 处理 token 刷新
  - _Requirements: 状态管理_

- [ ] 2.3 创建认证类型定义
  - 创建 `src/shared/types/auth.ts`
  - 定义 User 接口
  - 定义 AuthState 接口
  - 定义 LoginPromptConfig 接口
  - _Requirements: 类型定义_

- [ ] 2.4 Background 集成
  - 在 background/index.ts 初始化 AuthService
  - 添加认证相关消息处理
  - SIGN_IN - 触发登录
  - SIGN_OUT - 退出登录
  - GET_AUTH_STATE - 获取登录状态
  - _Requirements: Background 集成_


### 3. 数据同步服务（1 天）

- [x] 3.1 创建 Firestore 服务
  - 创建 `src/shared/services/firestore-service.ts`
  - 实现 FirestoreService 类
  - 实现 getUserData() 方法
  - 实现 setUserData() 方法
  - 实现 getEmergencyContacts() 方法
  - 实现 setEmergencyContacts() 方法
  - 实现 getKnockRecords() 方法
  - 实现 addKnockRecord() 方法
  - 实现 getDailyStats() 方法
  - 实现 setDailyStats() 方法
  - _Requirements: Firestore 操作_

- [x] 3.2 创建同步服务
  - 创建 `src/shared/services/sync-service.ts`
  - 实现 SyncService 类
  - 实现 syncUserData() 方法（双向同步）
  - 实现 syncEmergencyContacts() 方法
  - 实现 syncKnockRecords() 方法
  - 实现 syncDailyStats() 方法
  - 实现 syncAll() 方法（批量同步）
  - 实现冲突解决逻辑（基于时间戳）
  - _Requirements: 数据同步_

- [x] 3.3 本地数据迁移
  - 实现 migrateLocalDataToCloud() 函数
  - 读取所有本地数据
  - 上传到 Firestore
  - 标记已迁移状态
  - 显示迁移成功提示
  - _Requirements: 数据迁移_

- [x] 3.4 同步调度器
  - 创建 `src/background/services/sync-scheduler.ts`
  - 使用 Chrome Alarms 创建定时任务
  - 每 30 分钟自动同步
  - 监听网络状态变化
  - 网络恢复时自动同步
  - 实现同步队列（防止并发）
  - _Requirements: 自动同步_

- [x] 3.5 同步状态管理
  - 定义 SyncStatus 枚举
  - 实现 getSyncStatus() 方法
  - 实现 getLastSyncTime() 方法
  - 实现 updateSyncStatus() 方法
  - 保存同步状态到 Chrome Storage
  - _Requirements: 状态管理_

### 4. UI 集成（0.5 天）

- [x] 4.1 创建登录按钮组件
  - 创建 `src/popup/components/LoginButton.tsx`
  - 显示"使用 Google 登录"按钮
  - 处理登录点击事件
  - 显示登录加载状态
  - 显示登录错误提示
  - _Requirements: 登录 UI_

- [x] 4.2 创建用户信息组件
  - 创建 `src/popup/components/UserProfile.tsx`
  - 显示用户头像
  - 显示用户名称
  - 显示用户邮箱
  - 显示最后同步时间
  - 显示同步状态图标
  - _Requirements: 用户信息 UI_

- [x] 4.3 Popup 页面集成
  - 在 Popup.tsx 顶部添加用户信息区域
  - 未登录时显示 LoginButton
  - 已登录时显示 UserProfile
  - 添加样式（禅意风格）
  - _Requirements: Popup 集成_

- [x] 4.4 创建账号设置页面
  - 创建 `src/options/components/AccountSettings.tsx`
  - 显示用户信息
  - 显示数据同步状态
  - 添加"立即同步"按钮
  - 添加"退出登录"按钮
  - 添加"删除账号"按钮（危险操作）
  - _Requirements: 账号设置_

- [x] 4.5 Options 页面集成
  - 在 Options.tsx 添加"账号"标签
  - 集成 AccountSettings 组件
  - 添加样式
  - _Requirements: Options 集成_

- [x] 4.6 创建同步状态组件
  - 创建 `src/options/components/SyncStatus.tsx`
  - 显示同步状态（空闲/同步中/成功/失败/离线）
  - 显示最后同步时间
  - 显示同步进度（可选）
  - _Requirements: 同步状态 UI_

### 5. 登录提示和引导（0.3 天）

- [x] 5.1 添加紧急联系人时提示
  - 在 ContactForm.tsx 添加登录检查
  - 未登录时显示登录提示对话框
  - 说明登录的好处（邮件通知、数据备份、多设备同步）
  - 提供"使用 Google 登录"按钮
  - 提供"稍后再说"选项
  - 点击"稍后再说"后可以继续添加联系人（但无法发送邮件）
  - _Requirements: 联系人提示_

- [x] 5.2 发送邮件时检查登录
  - 在 EmailService 添加登录检查
  - 未登录时记录日志但不发送邮件
  - 不显示额外提示（已在添加联系人时提示过）
  - _Requirements: 邮件发送检查_


### 6. 邮件发送集成（0.5 天）

- [ ] 6.1 更新邮件服务
  - 修改 `src/background/services/email-service.ts`
  - 添加登录状态检查
  - 使用用户信息（displayName, email）
  - 未登录时返回错误
  - _Requirements: 邮件集成_

- [ ] 6.2 更新邮件模板
  - 修改 `src/shared/templates/death-notification-email.ts`
  - 使用 user.displayName 作为 userName
  - 使用 user.email 作为发件人信息
  - 更新模板变量
  - _Requirements: 模板更新_

- [ ] 6.3 更新死亡检测服务
  - 修改 `src/background/services/death-detection-service.ts`
  - 在触发邮件发送前检查登录状态
  - 未登录时记录日志但不发送
  - 已登录时正常发送
  - _Requirements: 检测服务更新_

- [ ] 6.4 更新邮件预览组件
  - 修改 `src/options/components/EmailPreview.tsx`
  - 显示登录状态
  - 未登录时显示登录提示
  - 已登录时显示用户信息
  - 使用真实用户名预览邮件
  - _Requirements: 预览组件更新_

### 7. 测试和优化（1 天）

- [ ] 7.1 功能测试
  - 测试 Google 登录流程
  - 测试首次登录数据迁移
  - 测试数据同步（上传和下载）
  - 测试离线模式
  - 测试网络恢复后自动同步
  - 测试退出登录
  - 测试添加紧急联系人时的登录提示
  - 测试点击"稍后再说"后可以继续添加联系人
  - 测试未登录时邮件发送被阻止
  - _Requirements: 功能测试_

- [ ] 7.2 多设备测试
  - 在设备 A 登录并修改数据
  - 在设备 B 登录同一账号
  - 验证数据是否同步
  - 在设备 B 修改数据
  - 验证设备 A 是否收到更新
  - _Requirements: 多设备测试_

- [ ] 7.3 冲突测试
  - 在两个设备同时修改数据
  - 验证冲突解决逻辑
  - 检查是否以最新时间戳为准
  - 验证数据一致性
  - _Requirements: 冲突测试_


- [ ] 7.5 安全测试
  - 验证 Firestore Security Rules
  - 测试用户只能访问自己的数据
  - 测试未授权访问被拒绝
  - 检查敏感信息是否加密
  - _Requirements: 安全测试_

- [ ] 7.6 错误处理
  - 测试网络错误处理
  - 测试 Firebase 错误处理
  - 测试登录失败处理
  - 添加友好的错误提示
  - 添加错误日志
  - _Requirements: 错误处理_

- [ ] 7.7 国际化
  - 添加登录相关翻译键
  - 更新中文翻译
  - 更新英文翻译
  - 测试中英文显示
  - _Requirements: 国际化_

### 8. 云端死亡检测和邮件通知（2 天）

- [ ] 8.1 SendGrid 账号设置
  - 注册 SendGrid 账号
  - 创建 API Key（Full Access 或 Mail Send 权限）
  - 验证发件人邮箱（可选）
  - 测试 API Key 可用性
  - _Requirements: 邮件服务配置_

- [ ] 8.2 Firestore 数据模型扩展
  - 创建 deathNotifications 集合结构
  - 创建 emailLogs 集合结构
  - 更新 Security Rules（用户只读，Cloud Functions 可写）
  - 测试数据读写权限
  - _Requirements: 数据模型_

- [ ] 8.3 初始化 Cloud Functions 项目
  - 安装 Firebase CLI：`npm install -g firebase-tools`
  - 登录 Firebase：`firebase login`
  - 初始化 Functions：`firebase init functions`
  - 选择 TypeScript
  - 安装依赖：`@sendgrid/mail`, `firebase-admin`
  - 配置 SendGrid API Key：`firebase functions:config:set sendgrid.key="xxx"`
  - _Requirements: Cloud Functions 设置_

- [ ] 8.4 实现定时检查函数
  - 创建 `functions/src/checkAllUsersStatus.ts`
  - 实现 checkAllUsersStatus() Cloud Function
  - 配置 Cloud Scheduler（每天 UTC 0:00）
  - 实现 checkUserDeathStatus() 辅助函数
  - 查询所有用户数据
  - 检查 HP 和未活跃天数
  - 保存检测结果到 deathNotifications 集合
  - 触发邮件发送（如果死亡且未发送过）
  - _Requirements: 定时检查_

- [ ] 8.5 实现邮件发送函数
  - 创建 `functions/src/sendDeathNotification.ts`
  - 实现 sendDeathNotification() 函数
  - 获取紧急联系人（按优先级排序，取前 5 个）
  - 准备邮件内容（复用现有模板）
  - 调用 SendGrid API 发送邮件
  - 更新 deathNotifications 发送状态
  - 记录邮件日志到 emailLogs 集合
  - 实现错误处理和重试逻辑
  - _Requirements: 邮件发送_

- [ ] 8.6 实现防重复发送逻辑
  - 检查 emailSent 标记
  - 如果已发送，跳过
  - 实现用户恢复活跃后重置发送状态
  - 添加发送时间记录
  - _Requirements: 防重复发送_

- [ ] 8.7 部署和测试
  - 部署 Cloud Functions：`firebase deploy --only functions`
  - 查看部署日志
  - 手动触发函数测试
  - 验证邮件发送成功
  - 检查 Firestore 数据更新
  - 查看 Cloud Functions 日志
  - _Requirements: 部署测试_

- [ ] 8.8 监控和日志
  - 添加详细日志输出
  - 配置 Firebase Console 日志查看
  - 设置错误告警（可选）
  - 监控 SendGrid 发送状态
  - 监控 Cloud Functions 调用次数
  - _Requirements: 监控日志_

### 9. 文档和发布（0.5 天）

- [ ] 9.1 更新用户文档
  - 更新 docs/USER_GUIDE.md
  - 添加登录说明
  - 添加数据同步说明
  - 添加隐私政策说明
  - 添加常见问题
  - _Requirements: 用户文档_

- [ ] 9.2 更新开发文档
  - 更新 README.md
  - 添加 Firebase 设置指南
  - 添加环境变量配置说明
  - 添加部署指南
  - _Requirements: 开发文档_

- [ ] 9.3 创建隐私政策
  - 创建 docs/PRIVACY_POLICY.md
  - 说明数据收集范围
  - 说明数据使用方式
  - 说明数据存储位置
  - 说明用户权利
  - _Requirements: 隐私政策_

- [ ] 9.4 更新 CHANGELOG
  - 添加 M7 完成记录
  - 列出新增功能
  - 列出技术变更
  - _Requirements: 更新日志_

- [ ] 9.5 构建和测试
  - 运行 `npm run build`
  - 验证构建成功
  - 在 Chrome 中加载测试
  - 验证所有功能正常
  - _Requirements: 构建测试_

## 完成标准

### 必须完成
- [ ] Firebase 项目创建并配置完成
- [ ] Google 登录功能正常
- [ ] 首次登录时本地数据自动迁移
- [ ] 数据双向同步正常
- [ ] 离线模式正常工作
- [ ] 登录提示在合适时机显示
- [ ] 邮件发送需要登录
- [ ] 用户可以退出登录
- [ ] Firestore Security Rules 配置正确
- [ ] **SendGrid 账号配置完成**
- [ ] **Cloud Functions 部署成功**
- [ ] **定时检查功能正常运行**
- [ ] **死亡检测逻辑正确**
- [ ] **邮件自动发送功能正常**
- [ ] **防重复发送逻辑有效**
- [ ] TypeScript 类型检查通过
- [ ] 构建成功无错误

### 验收检查
- [ ] 用户可以使用 Google 账号登录
- [ ] 登录后显示用户信息
- [ ] 数据自动同步到云端
- [ ] 在另一设备登录可以看到同步的数据
- [ ] 离线时所有功能正常
- [ ] 联网后自动同步
- [ ] 添加紧急联系人时提示登录（未登录时）
- [ ] 点击"稍后再说"可以继续添加联系人
- [ ] 未登录时邮件发送被阻止
- [ ] 用户只能访问自己的数据
- [ ] 中英文显示正常
- [ ] **Cloud Functions 每天自动运行**
- [ ] **检测到死亡用户时自动发送邮件**
- [ ] **邮件成功送达紧急联系人**
- [ ] **不会重复发送邮件给同一用户**
- [ ] **用户恢复活跃后可以再次触发邮件**
- [ ] **邮件日志正确记录**
- [ ] **Firebase Console 可以查看运行日志**

## 技术依赖

- Firebase SDK (firebase)
- Firebase Admin SDK (firebase-admin) - Cloud Functions
- SendGrid SDK (@sendgrid/mail) - 邮件发送
- Firebase CLI (firebase-tools) - 部署工具
- Chrome Extension Manifest V3
- Chrome Identity API
- Chrome Storage API
- Chrome Alarms API

## 注意事项

### Firebase 配置
1. **不要提交配置文件到 Git**
   - 将 `firebase.ts` 添加到 `.gitignore`
   - 使用环境变量或配置文件模板

2. **Security Rules 很重要**
   - 确保用户只能访问自己的数据
   - 测试未授权访问被拒绝

3. **免费额度监控**
   - 监控 Firestore 读写次数
   - 优化查询减少读取
   - 使用本地缓存

### 数据同步
1. **冲突解决**
   - 使用时间戳判断最新数据
   - 记录同步日志便于调试

2. **性能优化**
   - 使用防抖减少同步频率
   - 批量操作减少网络请求
   - 使用 Firestore 离线持久化

3. **错误处理**
   - 网络错误时重试
   - 记录失败的同步任务
   - 提供手动同步选项

### 用户体验
1. **不强制登录**
   - 本地功能完整可用
   - 温和提示登录好处

2. **隐私保护**
   - 明确说明数据用途
   - 提供数据导出和删除

3. **国际化**
   - 所有文本使用 t() 函数
   - 添加中英文翻译

### 云端功能
1. **邮件服务配置**
   - 使用 SendGrid 免费额度（100 封/天）
   - 配置发件人邮箱验证
   - 监控发送配额使用情况

2. **Cloud Functions 优化**
   - 使用 Cloud Scheduler 定时触发
   - 批量处理用户检查
   - 添加详细日志便于调试
   - 实现错误重试机制

3. **成本控制**
   - 监控 Cloud Functions 调用次数
   - 监控 SendGrid 邮件发送量
   - 优化检查频率（每天一次）
   - 使用免费额度内的资源

4. **测试策略**
   - 本地测试 Cloud Functions（Firebase Emulator）
   - 手动触发函数测试
   - 创建测试用户数据
   - 验证邮件发送和日志记录

## 下一步

完成 M7 后：
1. ✅ 用户认证和云端同步已完成
2. ✅ 云端死亡检测和自动邮件通知已完成
3. 可以进入 M8：社交功能（好友、排行榜）
4. 可以进入 M3：优化和完善
5. 准备发布 v0.3.0 版本（包含云端同步和自动邮件通知）

**"还活着吗"现在有了云端超能力和自动守护功能！☁️📧**

