# Google 登录问题修复总结

## 问题原因

Chrome 扩展使用 Google 登录时遇到多个错误：

1. **"Invalid OAuth2 Client ID"** - Google 不再为未发布的扩展提供 Chrome 应用类型的 OAuth2 Client ID
2. **"bad client id"** - Firebase Web Client ID 无法直接用于 Chrome Identity API 的 `getAuthToken`
3. **CSP 违规** - Firebase 需要加载外部脚本，但被 Chrome 扩展的 Content Security Policy 阻止

## 最终解决方案

采用 **Chrome Identity API 的 launchWebAuthFlow** 方案，这是 Chrome 官方推荐的认证方式。

### 工作原理

```
LoginButton (Popup)
    ↓ 发送 SIGN_IN 消息
Background Service Worker
    ↓ 调用 authService.signInWithGoogle()
Auth Service
    ↓ 调用 chrome.identity.launchWebAuthFlow()
    ↓ 打开 Google OAuth2 页面
    ↓ 用户授权后获取 id_token
    ↓ 使用 id_token 登录 Firebase
    ↓ 返回用户信息
Background → LoginButton
```

### 关键技术点

1. **launchWebAuthFlow**：Chrome 提供的官方 OAuth2 认证 API
   - 打开独立的认证窗口
   - 不受 CSP 限制
   - 安全可靠

2. **ID Token 认证**：使用 Google OAuth2 的 `id_token` 而不是 `access_token`
   - Firebase 支持使用 ID token 登录
   - 避免了 Chrome Identity API 的 Client ID 类型限制

3. **Redirect URL**：使用 `chrome.identity.getRedirectURL()` 获取扩展的重定向 URL
   - 格式：`https://<extension-id>.chromiumapp.org/`
   - 自动处理，无需手动配置

## 实现的改动

### 修改的文件

1. **src/manifest.json**
   - 保留 `identity` 权限
   - 移除 `oauth2` 配置（不需要）
   - 移除 `offscreen` 权限和相关配置

2. **src/shared/services/auth-service.ts**
   - 实现 `launchWebAuthFlow()` 方法
   - 使用 `signInWithCredential()` 而不是 `signInWithPopup()`
   - 添加 `generateNonce()` 用于安全性

3. **src/background/index.ts**
   - 简化认证消息处理
   - 移除 offscreen document 相关代码

4. **src/popup/components/LoginButton.tsx**
   - 添加错误自动消失（5秒）

5. **vite.config.ts**
   - 移除 offscreen 相关入口

### 删除的文件
- `src/offscreen/index.html`
- `src/offscreen/index.ts`
- `src/offscreen/auth-iframe.html`
- `src/offscreen/auth-iframe.ts`

## 配置要求

### Google Cloud Console 配置

1. **OAuth 2.0 客户端 ID**
   - 类型：Web 应用
   - 已有的 Client ID：`681396856351-la69jc71l4b3msoop2ckuo6jt5ao2q3t.apps.googleusercontent.com`

2. **授权的重定向 URI**（重要！）
   需要在 Google Cloud Console 中添加扩展的重定向 URI：
   
   ```
   https://<your-extension-id>.chromiumapp.org/
   ```
   
   获取扩展 ID 的方法：
   - 在 `chrome://extensions/` 中查看
   - 或使用 `chrome.identity.getRedirectURL()` 获取完整 URL

   **步骤：**
   1. 访问 [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials?project=alive-checker-d24ea)
   2. 点击你的 Web 应用 OAuth 2.0 客户端 ID
   3. 在"已获授权的重定向 URI"中添加：`https://<extension-id>.chromiumapp.org/`
   4. 保存

## 测试步骤

### 1. 配置重定向 URI

首先需要获取扩展 ID 并配置重定向 URI：

```javascript
// 在浏览器控制台中运行（扩展的任何页面）
console.log(chrome.identity.getRedirectURL());
// 输出类似：https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/
```

将这个 URL 添加到 Google Cloud Console 的授权重定向 URI 中。

### 2. 重新加载扩展

1. 打开 `chrome://extensions/`
2. 找到你的扩展
3. 点击刷新图标 🔄

### 3. 测试登录

1. 点击扩展图标打开 popup
2. 点击"使用 Google 登录"按钮
3. 会打开一个新窗口显示 Google 登录页面
4. 选择账号并授权
5. 窗口自动关闭，登录成功

### 4. 验证功能

- ✅ 登录成功后显示用户头像和名称
- ✅ 错误消息会在 5 秒后自动消失
- ✅ 登录状态持久化
- ✅ 不再有 CSP 违规错误
- ✅ 不再有安全警告

## 技术优势

### 相比之前的方案

1. **更安全**
   - 不需要 sandboxed iframe
   - 不会有 `allow-scripts` + `allow-same-origin` 的安全风险
   - 使用 Chrome 官方 API

2. **更简单**
   - 不需要 offscreen document
   - 不需要复杂的消息传递
   - 代码更少，更易维护

3. **更可靠**
   - Chrome 官方推荐的方式
   - 不受 CSP 限制
   - 兼容性更好

4. **用户体验更好**
   - 独立的认证窗口
   - 不会被 popup 限制
   - 认证完成后自动关闭

## 常见问题

### 1. 错误：redirect_uri_mismatch

**原因**：重定向 URI 未在 Google Cloud Console 中配置

**解决方案**：
1. 获取扩展的重定向 URL：`chrome.identity.getRedirectURL()`
2. 在 Google Cloud Console 中添加这个 URL 到授权重定向 URI

### 2. 错误：invalid_client

**原因**：Client ID 不正确或未启用

**解决方案**：
1. 检查 `auth-service.ts` 中的 Client ID 是否正确
2. 确认 Google Cloud Console 中该 Client ID 已启用

### 3. 登录窗口一闪而过

**原因**：可能是重定向 URI 配置问题

**解决方案**：
1. 检查浏览器控制台的错误信息
2. 确认重定向 URI 完全匹配（包括末尾的 `/`）

### 4. 用户取消登录

这是正常行为，会返回 `USER_CANCELLED` 错误，错误消息会在 5 秒后自动消失。

## 安全性说明

1. **Nonce**：每次认证请求都生成随机 nonce，防止重放攻击
2. **HTTPS Only**：所有通信都通过 HTTPS
3. **Chrome Identity API**：使用 Chrome 的安全沙箱
4. **ID Token**：使用短期有效的 ID token，不存储敏感凭证

## 生产环境注意事项

1. **扩展 ID 变化**：
   - 开发时每次加载扩展 ID 可能变化
   - 发布到 Chrome Web Store 后 ID 固定
   - 发布后需要更新 Google Cloud Console 中的重定向 URI

2. **OAuth 同意屏幕**：
   - 测试阶段需要添加测试用户
   - 发布前需要提交 OAuth 同意屏幕审核

3. **Client ID**：
   - 当前使用的是 Firebase 项目的 Web Client ID
   - 生产环境可以继续使用，无需更改

## 后续优化建议

1. 添加登录加载状态的更好视觉反馈
2. 实现自动刷新 token 机制
3. 添加登录失败的详细错误提示
4. 考虑添加其他登录方式（邮箱/密码等）
5. 添加登出时清除 Chrome Identity 缓存
