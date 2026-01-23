# Firebase 初始化测试指南

## 当前状态
✅ Firebase SDK 已安装 (v12.8.0)
✅ Firebase 配置已填写
✅ Firebase 初始化代码已添加到 background/index.ts
✅ 构建成功 (211.25 kB bundle 包含 Firebase 模块)

## 测试步骤

### 1. 在 Chrome 中加载/重新加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 确保右上角 "开发者模式" 已开启
4. 如果扩展已加载：
   - 点击扩展卡片上的 "刷新" 按钮 🔄
5. 如果扩展未加载：
   - 点击 "加载已解压的扩展程序"
   - 选择项目的 `dist` 文件夹

### 2. 查看 Service Worker 控制台

1. 在扩展卡片上找到 "Service Worker" 链接
2. 点击 "Service Worker" 旁边的蓝色链接（可能显示为 "检查视图"）
3. 这会打开 DevTools 控制台

### 3. 检查日志

在 Service Worker 控制台中，你应该看到：

```
[Background] Service worker loaded
[Firebase] Initialized successfully
[Background] Language initialized
[Background] All listeners set up
```

### 4. 如果看到错误

#### 错误类型 1: Firebase 配置错误
```
[Firebase] Initialization error: FirebaseError: ...
```
**解决方案**: 检查 `src/shared/config/firebase.ts` 中的配置是否正确

#### 错误类型 2: 权限错误
```
Refused to connect to 'https://firebaseapp.com'
```
**解决方案**: 检查 `src/manifest.json` 中的 `host_permissions` 是否包含 Firebase 域名

#### 错误类型 3: 模块加载错误
```
Cannot find module 'firebase/app'
```
**解决方案**: 运行 `npm install` 重新安装依赖

### 5. 验证 Firebase 功能

在 Service Worker 控制台中运行以下命令测试：

```javascript
// 测试 Firebase 是否可用
chrome.runtime.getBackgroundPage((bg) => {
  console.log('Firebase app:', bg.app);
  console.log('Firebase auth:', bg.auth);
  console.log('Firebase db:', bg.db);
});
```

## 下一步

一旦看到 `[Firebase] Initialized successfully` 日志：

1. ✅ 任务 1.4 完成
2. ✅ 任务 1.5 完成
3. 📝 更新 `TASK_1_SUMMARY.md` 标记完成
4. 🚀 开始任务 2: 实现认证服务

## 常见问题

### Q: 我看不到 Service Worker 链接
A: 扩展可能没有正确加载。检查是否有错误提示，确保 `dist` 文件夹存在且包含 `manifest.json`

### Q: Service Worker 显示 "inactive"
A: 点击扩展图标或刷新扩展来激活 Service Worker

### Q: 控制台没有任何日志
A: Service Worker 可能还没有启动。尝试：
- 点击扩展图标
- 刷新扩展
- 重启 Chrome

### Q: 日志显示但没有 Firebase 相关内容
A: 检查构建输出，确保 Firebase 模块被打包（应该看到 ~211 kB 的 bundle）
