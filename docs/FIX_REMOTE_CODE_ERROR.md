# 修复"远程托管代码"错误

## 🚨 问题

Chrome Web Store 提示：**"Manifest V3 产品包含远程托管代码"**

## 🔍 原因分析

这个错误通常由以下原因引起：

1. **host_permissions 被误判**：`googleapis.com` 权限可能被误认为要加载远程代码
2. **Firebase SDK**：使用 Firebase 可能触发检测
3. **构建产物中的外部引用**：构建后的代码中可能包含外部 URL 引用

## ✅ 解决方案

### 方案一：添加详细的权限说明（推荐）

在 Chrome Web Store 的"隐私权实践"部分，详细说明每个权限的用途。

#### 步骤：

1. 在 Developer Dashboard 中，找到"隐私权实践"部分
2. 对于每个 host_permission，添加详细说明：

**https://_.firebaseapp.com/_**

```
用途：Firebase 身份验证
说明：此权限用于 Google 账号登录的身份验证服务。
我们使用 Firebase Authentication 提供安全的用户登录功能。
所有通信都通过 HTTPS 加密，不会加载或执行远程代码。
```

**https://_.googleapis.com/_**

```
用途：Google API 服务
说明：此权限用于访问 Google 身份验证和 Firestore 数据库 API。
仅用于数据传输（JSON 格式），不会加载或执行任何远程代码。
所有代码都打包在扩展中，不从远程服务器加载。
```

**https://securetoken.googleapis.com/***

```
用途：安全令牌验证
说明：此权限用于验证用户的登录令牌，确保账号安全。
仅用于 API 调用，不会加载或执行远程代码。
```

**https://identitytoolkit.googleapis.com/***

```
用途：身份验证工具包
说明：Google Identity Toolkit 的 API 端点。
仅用于身份验证相关的 API 调用，不会加载或执行远程代码。
```

3. 在"单一用途"部分强调：

```
本扩展的所有代码都打包在扩展包中，不会从远程服务器加载或执行任何代码。
host_permissions 仅用于与 Firebase 服务进行 API 通信（数据传输），
所有通信都使用 HTTPS 加密，符合 Manifest V3 的安全要求。
```

---

### 方案二：添加 Content Security Policy（可选）

虽然 Manifest V3 默认有严格的 CSP，但可以显式声明以增强信任。

#### 修改 src/manifest.json：

```json
{
  "manifest_version": 3,
  "name": "__MSG_extensionName__",
  "version": "1.1.0",
  "description": "__MSG_extensionDescription__",
  "default_locale": "en",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "src/background/index.js",
    "type": "module"
  },
  "options_page": "src/options/index.html",
  "permissions": ["storage", "identity"],
  "host_permissions": [
    "https://*.firebaseapp.com/*",
    "https://*.googleapis.com/*",
    "https://securetoken.googleapis.com/*",
    "https://identitytoolkit.googleapis.com/*"
  ]
}
```

**说明**：

- `script-src 'self'`：只允许加载扩展包内的脚本
- `object-src 'self'`：只允许加载扩展包内的对象

---

### 方案三：提供技术说明文档

创建一个公开的技术说明文档，解释扩展的架构。

#### 创建 TECHNICAL_DETAILS.md：

````markdown
# 技术说明

## 代码托管

本扩展的所有代码都打包在扩展包中，不从远程服务器加载任何代码。

## Firebase 使用说明

我们使用 Firebase SDK 进行以下操作：

1. **身份验证**：使用 Firebase Authentication 进行 Google 账号登录
2. **数据存储**：使用 Firestore 存储用户数据

### Firebase SDK 集成方式

- Firebase SDK 通过 npm 安装：`firebase@12.8.0`
- 在构建时打包到扩展中（见 package.json）
- 不使用 CDN 或外部脚本标签

### API 通信

所有与 Firebase 的通信都是通过 HTTPS API 调用：

- 发送/接收 JSON 数据
- 不加载或执行远程代码
- 符合 Manifest V3 的安全要求

## 构建过程

```bash
npm run build
```
````

构建过程：

1. TypeScript 编译
2. Vite 打包（将所有依赖打包到扩展中）
3. 生成 dist/ 目录

## 验证

您可以检查 dist/ 目录中的所有文件：

- 所有 JavaScript 代码都在扩展包中
- 没有 `<script src="https://...">` 标签
- 没有动态加载远程代码的逻辑

```

将此文档上传到 GitHub，并在 Chrome Web Store 的说明中提供链接。

---

### 方案四：联系 Chrome Web Store 支持

如果以上方案都不行，直接联系审核团队。

#### 步骤：

1. 在 Developer Dashboard 中找到"支持"或"帮助"按钮
2. 提交申诉，说明：

```

主题：关于"远程托管代码"错误的说明

内容：
您好，

我的扩展（ID: [你的扩展ID]）被标记为"包含远程托管代码"，
但实际上我们的扩展完全符合 Manifest V3 的要求。

说明：

1. 所有代码都打包在扩展包中，没有从远程加载代码
2. host_permissions 仅用于与 Firebase API 通信（数据传输）
3. 我们使用 Firebase SDK（通过 npm 安装并打包）
4. 没有使用 eval()、new Function() 或动态脚本加载

技术细节：

- Firebase SDK 版本：12.8.0（通过 npm 安装）
- 构建工具：Vite 7.3.1
- 所有依赖都打包在扩展中

请求：
请重新审核我们的扩展，或告知具体哪部分被认为是"远程托管代码"，
以便我们进行修正。

谢谢！

````

---

## 🔍 自查清单

在提交申诉前，确认以下内容：

- [ ] 没有使用 `<script src="https://...">` 加载外部脚本
- [ ] 没有使用 `eval()` 或 `new Function()`
- [ ] 没有使用 `importScripts()` 加载远程脚本
- [ ] Firebase SDK 通过 npm 安装并打包
- [ ] 所有代码都在 dist/ 目录中
- [ ] manifest.json 中没有 `web_accessible_resources` 指向外部 URL
- [ ] 没有使用 `chrome.scripting.executeScript()` 加载远程代码

---

## 📋 检查构建产物

### 检查 HTML 文件：

```bash
# 检查是否有外部脚本引用
grep -r "src=\"http" dist/
grep -r "href=\"http" dist/

# 应该没有任何输出
````

### 检查 JavaScript 文件：

```bash
# 检查是否有动态加载代码
grep -r "eval(" dist/
grep -r "new Function" dist/
grep -r "importScripts" dist/

# 应该没有任何输出
```

### 检查 manifest.json：

```bash
cat dist/manifest.json | jq .
```

确认：

- `background.service_worker` 指向本地文件
- `host_permissions` 仅用于 API 通信
- 没有 `externally_connectable` 指向不安全的域

---

## 💡 最佳实践

### 1. 在提交时添加说明

在"提交审核"时的备注中写明：

```
本扩展使用 Firebase 进行身份验证和数据存储。
所有代码都打包在扩展中，host_permissions 仅用于 API 通信。
Firebase SDK 通过 npm 安装（firebase@12.8.0）并在构建时打包。
不会从远程服务器加载或执行任何代码。
```

### 2. 提供源代码链接

如果你的项目是开源的，提供 GitHub 链接：

```
源代码：https://github.com/wenxiaoyu/demumu-chrome-plug
构建说明：见 README.md
```

### 3. 提供构建验证

在 README 中添加：

```markdown
## 构建验证

本扩展的所有代码都打包在扩展中：

1. 克隆仓库：`git clone ...`
2. 安装依赖：`npm install`
3. 构建：`npm run build`
4. 检查 dist/ 目录：所有代码都在本地

Firebase SDK 通过 npm 安装并打包，不从 CDN 加载。
```

---

## 🎯 推荐操作流程

1. **立即操作**：在 Developer Dashboard 中添加详细的权限说明
2. **可选操作**：添加 CSP 到 manifest.json
3. **如果被拒绝**：提交申诉并提供技术说明
4. **最后手段**：联系 Chrome Web Store 支持团队

---

## 📞 需要帮助？

如果问题仍未解决：

1. **Chrome Web Store 帮助中心**：
   https://support.google.com/chrome_webstore/

2. **开发者论坛**：
   https://groups.google.com/a/chromium.org/g/chromium-extensions

3. **Stack Overflow**：
   搜索 "chrome extension remote hosted code"

---

**记住**：你的扩展完全符合 Manifest V3 的要求，这可能只是误判。
通过详细的说明和申诉，应该可以解决这个问题。

祝你顺利通过审核！🚀
