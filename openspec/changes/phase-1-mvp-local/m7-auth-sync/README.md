# M7：用户认证与云端同步

## 概述

本提案为"还活着吗" Chrome 插件添加 Google 账号登录和云端数据同步功能，解决邮件发送需要用户身份验证的问题，同时为用户提供数据备份和多设备同步能力。

## 核心功能

### 1. Google 账号登录
- 使用 Firebase Authentication
- 一键 Google 登录
- 登录状态持久化
- 退出登录功能

### 2. 云端数据同步
- 使用 Firestore 存储用户数据
- 本地优先策略（Local-First）
- 自动双向同步
- 离线模式支持
- 冲突自动解决

### 3. 本地数据迁移
- 首次登录自动迁移本地数据
- 无缝迁移体验
- 数据完整性保证

### 4. 登录提示

**唯一提示时机：添加紧急联系人时**

当用户尝试添加紧急联系人时，如果未登录，会显示登录提示：
- 说明登录的好处（邮件通知、数据备份、多设备同步）
- 提供"使用 Google 登录"按钮
- 提供"稍后再说"选项（可以继续添加联系人，但无法发送邮件）

**设计原则：**
- 不在其他地方主动提示登录
- 不强制用户登录
- 未登录时所有本地功能正常使用

## 技术方案

### 后端服务
- **Firebase Authentication**：用户认证
- **Firestore**：数据存储
- **零后端代码**：使用 Firebase SDK 直接操作

### 数据结构
```
Firestore
├── users/{uid}              # 用户基本信息
├── userData/{uid}           # 用户数据（HP、功德值等）
├── knockRecords/{uid}/...   # 敲击记录
├── dailyStats/{uid}/...     # 每日统计
└── emergencyContacts/{uid}  # 紧急联系人
```

### 同步策略
- **本地优先**：所有操作先在本地完成
- **异步同步**：后台自动同步到云端
- **冲突解决**：以最新时间戳为准
- **离线支持**：离线时所有功能正常

## 成本估算

### Firebase 免费额度（月）
- Authentication: 无限用户
- Firestore: 1GB 存储 + 50K 读取 + 20K 写入
- **预计成本**：$0（1000 用户以内完全免费）

## 开发时间

**总计：3 天**

1. Firebase 项目设置（0.5 天）
2. 认证服务实现（1 天）
3. 数据同步服务（1 天）
4. UI 集成和登录提示（0.3 天）
5. 邮件发送集成（0.2 天）
6. 测试和优化（1 天）

## 文档

- **规格说明**：[spec.md](./spec.md) - 完整的技术设计和实现方案
- **任务清单**：[tasks.md](./tasks.md) - 详细的开发任务列表

## 快速开始

### 1. 创建 Firebase 项目

```bash
# 访问 Firebase Console
https://console.firebase.google.com/

# 创建项目 "alive-checker"
# 启用 Authentication (Google)
# 创建 Firestore 数据库
```

### 2. 安装依赖

```bash
npm install firebase
```

### 3. 配置 Firebase

```typescript
// src/shared/config/firebase.ts
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "alive-checker.firebaseapp.com",
  projectId: "alive-checker",
  // ...
};
```

### 4. 开始开发

按照 [tasks.md](./tasks.md) 中的任务顺序逐个完成。

## 验收标准

- [ ] 用户可以使用 Google 账号登录
- [ ] 首次登录时本地数据自动迁移
- [ ] 数据自动同步到云端
- [ ] 多设备数据同步正常
- [ ] 离线模式正常工作
- [ ] 添加紧急联系人时提示登录（未登录时）
- [ ] 点击"稍后再说"可以继续添加联系人
- [ ] 未登录时邮件发送被阻止
- [ ] 用户只能访问自己的数据

## 风险和应对

### 技术风险
- **Firebase 配额限制** → 监控使用量，优化查询
- **数据同步冲突** → 使用时间戳解决
- **Service Worker 限制** → 使用 Chrome Alarms

### 产品风险
- **用户隐私担忧** → 明确隐私政策，数据加密
- **登录门槛** → 不强制登录，温和提示

## 下一步

完成 M7 后可以：
1. 进入 M8：社交功能（好友、排行榜）
2. 进入 M3：优化和完善
3. 准备发布 v0.3.0 版本

---

**准备好为"还活着吗"添加云端超能力了吗？☁️**

