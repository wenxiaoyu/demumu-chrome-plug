# Firebase 项目设置指南

## 任务 1.1：创建 Firebase 项目

### 步骤 1：访问 Firebase Console

1. 打开浏览器，访问：https://console.firebase.google.com/
2. 使用你的 Google 账号登录

### 步骤 2：创建新项目

1. 点击"添加项目"或"Create a project"按钮
2. 输入项目名称：`alive-checker`
3. 点击"继续"

### 步骤 3：配置 Google Analytics（可选）

1. 选择是否启用 Google Analytics（建议启用，用于后续数据分析）
2. 如果启用，选择或创建 Analytics 账号
3. 点击"创建项目"
4. 等待项目创建完成（约 30 秒）

### 步骤 4：添加 Web 应用

1. 在项目概览页面，点击 Web 图标（</>）
2. 输入应用昵称：`Alive Checker Extension`
3. **不要**勾选"同时为此应用设置 Firebase Hosting"
4. 点击"注册应用"

### 步骤 5：复制配置信息

你会看到类似这样的配置代码：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "alive-checker.firebaseapp.com",
  projectId: "alive-checker",
  storageBucket: "alive-checker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**重要：请复制这段配置，稍后会用到！**

6. 点击"继续到控制台"

---

## 任务 1.2：启用 Authentication

### 步骤 1：进入 Authentication

1. 在左侧菜单中，点击"Authentication"（身份验证）
2. 点击"Get started"或"开始使用"按钮

### 步骤 2：启用 Google 登录

1. 点击"Sign-in method"（登录方法）标签
2. 在"Sign-in providers"列表中找到"Google"
3. 点击"Google"行右侧的编辑图标（铅笔）
4. 切换"启用"开关到开启状态

### 步骤 3：配置项目信息

1. **项目公开名称**：输入 `还活着吗` 或 `Alive Checker`
2. **项目支持电子邮件**：选择你的邮箱地址
3. 点击"保存"

### 步骤 4：验证配置

1. 确认 Google 提供商状态显示为"已启用"
2. 记录下 Web 客户端 ID（如果需要）

---

## 任务 1.3：创建 Firestore 数据库

### 步骤 1：进入 Firestore

1. 在左侧菜单中，点击"Firestore Database"
2. 点击"创建数据库"按钮

### 步骤 2：选择模式

1. 选择"生产模式"（Production mode）
2. 点击"下一步"

### 步骤 3：选择位置

1. 选择数据库位置：`asia-east1 (Taiwan)`
   - 这是离中国大陆最近的区域
   - 延迟最低
2. 点击"启用"
3. 等待数据库创建完成（约 1-2 分钟）

### 步骤 4：配置 Security Rules

1. 点击"规则"标签
2. 将以下规则复制粘贴到编辑器中：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用户基本信息
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    
    // 用户数据
    match /userData/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // 敲击记录
    match /knockRecords/{uid}/records/{recordId} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // 每日统计
    match /dailyStats/{uid}/stats/{date} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // 紧急联系人
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

3. 点击"发布"按钮

### 步骤 5：创建集合结构（可选）

Firestore 会在第一次写入数据时自动创建集合，所以这一步可以跳过。

但如果你想提前创建，可以：
1. 点击"数据"标签
2. 点击"开始收集"
3. 输入集合 ID：`users`
4. 添加第一个文档（可以是测试数据）
5. 重复以上步骤创建其他集合：`userData`, `knockRecords`, `dailyStats`, `emergencyContacts`

---

## 完成检查清单

请确认以下内容已完成：

- [ ] Firebase 项目 "alive-checker" 已创建
- [ ] 已复制 Firebase 配置信息（firebaseConfig）
- [ ] Google Authentication 已启用
- [ ] 项目公开名称和支持邮箱已配置
- [ ] Firestore 数据库已创建（asia-east1）
- [ ] Security Rules 已配置并发布

---

## 下一步

完成以上步骤后，请告诉我，我会继续执行任务 1.4 和 1.5（配置 Firebase SDK 和更新 manifest.json）。

**请将你复制的 firebaseConfig 配置信息发给我，我会帮你创建配置文件。**

