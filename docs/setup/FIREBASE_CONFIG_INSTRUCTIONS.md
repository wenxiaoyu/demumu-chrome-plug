# Firebase 配置说明

## 步骤 1：安装 Firebase SDK

请在终端中运行以下命令：

```bash
npm install firebase
```

如果遇到权限问题，可以尝试：
```bash
npm install firebase --force
```

或者使用 pnpm：
```bash
pnpm install firebase
```

## 步骤 2：配置 Firebase

### 方法 1：直接编辑配置文件

1. 打开文件：`src/shared/config/firebase.ts`
2. 将以下占位符替换为你的实际配置：

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // 替换为你的 API Key
  authDomain: "alive-checker.firebaseapp.com",
  projectId: "alive-checker",
  storageBucket: "alive-checker.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // 替换为你的 Messaging Sender ID
  appId: "YOUR_APP_ID"                 // 替换为你的 App ID
};
```

### 方法 2：从 Firebase Console 复制

1. 访问 Firebase Console：https://console.firebase.google.com/
2. 选择你的项目 "alive-checker"
3. 点击项目设置（齿轮图标）
4. 滚动到"你的应用"部分
5. 找到你的 Web 应用
6. 复制 firebaseConfig 对象
7. 粘贴到 `src/shared/config/firebase.ts` 文件中

### 示例配置

你的配置应该类似这样：

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr678",
  authDomain: "alive-checker.firebaseapp.com",
  projectId: "alive-checker",
  storageBucket: "alive-checker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

## 步骤 3：验证配置

配置完成后，运行以下命令验证：

```bash
npm run dev
```

如果配置正确，你应该在控制台看到：
```
[Firebase] Initialized successfully
```

如果看到错误，请检查：
1. API Key 是否正确
2. Project ID 是否匹配
3. Firebase 项目是否已启用 Authentication 和 Firestore

## 安全提示

⚠️ **重要：不要将 firebase.ts 提交到 Git！**

- `firebase.ts` 已添加到 `.gitignore`
- 只提交 `firebase.example.ts` 作为模板
- 团队成员需要各自配置自己的 `firebase.ts`

## 故障排除

### 问题 1：npm install 失败

**解决方案：**
```bash
# 清理缓存
npm cache clean --force

# 重新安装
npm install firebase
```

### 问题 2：Firebase 初始化失败

**检查清单：**
- [ ] API Key 是否正确
- [ ] Project ID 是否为 "alive-checker"
- [ ] Firebase 项目是否已创建
- [ ] Authentication 是否已启用
- [ ] Firestore 是否已创建

### 问题 3：权限错误

**解决方案：**
- 检查 manifest.json 中的 permissions 和 host_permissions
- 确保包含 "identity" 权限
- 确保包含 Firebase 相关的 host_permissions

## 下一步

配置完成后，请告诉我，我会继续执行任务 2（认证服务实现）。

