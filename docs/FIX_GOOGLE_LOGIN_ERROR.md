# 修复 Google 登录 400 错误

## ✅ 当前状态

**已完成**：登录功能已暂时禁用，代码已修改并构建成功。

**下一步**：更新 Chrome Web Store 产品说明和截图，然后重新提交审核。

---

## 🚨 问题

Chrome Web Store 审核提示：**"Sign in with Google returns an error 400"**

## 🔍 原因

Google OAuth 登录返回 400 错误，原因是：

1. **扩展 ID 不匹配**：审核时的扩展 ID 与你在 Firebase/Google Cloud 中配置的不同
2. **Redirect URI 未授权**：Chrome Web Store 的扩展 ID 未添加到 OAuth 客户端的授权重定向 URI

## ✅ 解决方案

### 方案一：暂时禁用 Google 登录功能（推荐）

先让扩展通过审核，之后再启用登录功能。

#### 步骤 1：隐藏登录按钮

修改 `src/popup/Popup.tsx`：

```typescript
// 找到登录按钮部分，注释掉或条件渲染
{
  /* 暂时禁用 Google 登录 */
}
{
  /* {!authState.isSignedIn && <LoginButton />} */
}
```

修改 `src/options/components/AccountSettings.tsx`：

```typescript
// 隐藏登录相关 UI
// 或者显示"即将推出"的提示
```

#### 步骤 2：更新产品说明

在 Chrome Web Store 的产品说明中：

**移除或修改**：

- 删除所有关于"Google 登录"的描述
- 删除关于"云端同步"的描述
- 删除关于"多设备同步"的描述

**保留**：

- 敲木鱼功能
- 功德值系统
- 生命值系统
- 本地数据存储
- 联系人管理（本地）
- 统计数据

#### 步骤 3：更新截图

确保截图中没有显示：

- 登录按钮
- "Sign in with Google"
- 账号信息
- 同步状态

#### 步骤 4：重新构建和提交

```bash
npm run build
cd dist
zip -r ../extension.zip *
cd ..
```

上传新的 extension.zip 并重新提交审核。

---

### 方案二：正确配置 Google OAuth（复杂，需要等待）

如果你想保留 Google 登录功能，需要正确配置 OAuth。

#### 问题：扩展 ID 在审核时会变化

Chrome Web Store 在审核时使用的扩展 ID 与发布后的不同，这导致 OAuth 配置失败。

#### 解决步骤：

##### 1. 获取发布后的扩展 ID

首次发布后，你会获得一个永久的扩展 ID，格式如：

```
abcdefghijklmnopqrstuvwxyz123456
```

##### 2. 配置 Google Cloud OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目（alive-checker-d24ea）
3. 进入"API 和服务" → "凭据"
4. 找到你的 OAuth 2.0 客户端 ID
5. 添加授权的重定向 URI：
   ```
   https://[你的扩展ID].chromiumapp.org/
   ```

##### 3. 更新 Firebase 配置

在 Firebase Console 中：

1. 进入"Authentication" → "Sign-in method"
2. 点击"Google"
3. 确保已启用
4. 添加授权域：
   ```
   [你的扩展ID].chromiumapp.org
   ```

##### 4. 重新构建和提交

```bash
npm run build
cd dist
zip -r ../extension.zip *
cd ..
```

---

### 方案三：使用条件编译（最佳长期方案）

创建两个版本：

- **审核版本**：禁用 Google 登录
- **生产版本**：启用 Google 登录

#### 实现方式：

##### 1. 添加环境变量

创建 `.env.production`：

```
VITE_ENABLE_AUTH=false
```

创建 `.env.development`：

```
VITE_ENABLE_AUTH=true
```

##### 2. 修改代码

在 `src/popup/Popup.tsx`：

```typescript
const ENABLE_AUTH = import.meta.env.VITE_ENABLE_AUTH === 'true';

// ...

{ENABLE_AUTH && !authState.isSignedIn && <LoginButton />}
```

在 `src/options/components/AccountSettings.tsx`：

```typescript
const ENABLE_AUTH = import.meta.env.VITE_ENABLE_AUTH === 'true';

if (!ENABLE_AUTH) {
  return (
    <div className="account-settings">
      <h2>{t('settings_accountTitle')}</h2>
      <p>{t('settings_authComingSoon')}</p>
    </div>
  );
}
```

##### 3. 构建审核版本

```bash
# 审核版本（禁用登录）
VITE_ENABLE_AUTH=false npm run build

# 或者在 package.json 中添加脚本
"build:review": "VITE_ENABLE_AUTH=false npm run build"
```

##### 4. 发布后启用

扩展通过审核并发布后：

1. 配置好 OAuth（使用正确的扩展 ID）
2. 构建生产版本：
   ```bash
   VITE_ENABLE_AUTH=true npm run build
   ```
3. 提交更新

---

## 🎯 推荐方案

### 首次发布：方案一（暂时禁用）

**原因**：

- ✅ 最快通过审核
- ✅ 不需要复杂配置
- ✅ 核心功能不受影响
- ✅ 可以后续添加

**步骤**：

1. 隐藏所有登录相关 UI
2. 更新产品说明（删除登录相关描述）
3. 更新截图（不显示登录功能）
4. 重新构建和提交

### 后续更新：方案二（启用登录）

扩展发布后：

1. 获取永久扩展 ID
2. 配置 Google OAuth
3. 启用登录功能
4. 提交更新版本

---

## 📋 具体操作清单

### 立即操作（方案一）：

#### 1. 修改代码

**src/popup/Popup.tsx**：

```typescript
// 注释掉登录按钮
{
  /* {!authState.isSignedIn && <LoginButton />} */
}
```

**src/options/components/AccountSettings.tsx**：

```typescript
// 显示"即将推出"
return (
  <div className="account-settings">
    <h2>{t('settings_accountTitle')}</h2>
    <div className="coming-soon">
      <p>🚀 {t('settings_authComingSoon')}</p>
      <p>{t('settings_authComingSoonDesc')}</p>
    </div>
  </div>
);
```

#### 2. 添加翻译

**src/\_locales/zh_CN/messages.json**：

```json
{
  "settings_authComingSoon": {
    "message": "云端同步功能即将推出",
    "description": "Auth coming soon"
  },
  "settings_authComingSoonDesc": {
    "message": "我们正在开发云端数据同步功能，敬请期待！",
    "description": "Auth coming soon description"
  }
}
```

**scripts/translate-en.js**：

```javascript
const translations = {
  // ...
  settings_authComingSoon: 'Cloud Sync Coming Soon',
  settings_authComingSoonDesc: "We're working on cloud data sync feature. Stay tuned!",
}
```

运行：

```bash
node scripts/translate-en.js
```

#### 3. 更新产品说明

在 Chrome Web Store 中，删除或修改：

- ❌ "Google 账号登录"
- ❌ "云端数据同步"
- ❌ "多设备同步"

保留：

- ✅ "敲木鱼功能"
- ✅ "功德值系统"
- ✅ "生命值系统"
- ✅ "本地数据存储"

#### 4. 更新截图

确保截图中没有：

- 登录按钮
- 账号信息
- 同步状态

#### 5. 重新构建

```bash
npm run build
cd dist
zip -r ../extension.zip *
cd ..
```

#### 6. 重新提交

上传新的 extension.zip 到 Chrome Web Store。

---

## 💡 后续计划

### 扩展发布后：

1. **获取扩展 ID**：
   - 在 Chrome Web Store Developer Dashboard 中查看
   - 格式：`abcdefghijklmnopqrstuvwxyz123456`

2. **配置 OAuth**：
   - 添加重定向 URI：`https://[扩展ID].chromiumapp.org/`
   - 更新 Firebase 授权域

3. **启用登录功能**：
   - 取消注释登录相关代码
   - 更新产品说明
   - 提交更新版本

4. **测试**：
   - 在已发布的扩展中测试登录
   - 确保 OAuth 流程正常

---

## 🔍 验证清单

提交前确认：

- [ ] 代码中没有显示登录按钮
- [ ] 产品说明中没有提到登录功能
- [ ] 截图中没有登录相关内容
- [ ] 构建成功
- [ ] 在本地测试扩展功能正常
- [ ] 核心功能（敲木鱼、功德值、HP）正常工作

---

## 📞 需要帮助？

如果还有问题：

1. 检查 Chrome Web Store 的审核反馈
2. 确保所有登录相关内容都已移除
3. 联系 Chrome Web Store 支持

---

**记住**：先通过审核，后续再添加登录功能！

祝你顺利通过审核！🚀
