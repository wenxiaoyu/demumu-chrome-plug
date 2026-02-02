# 修复"远程托管代码"错误 - 完整解决方案

## 🚨 问题

Chrome Web Store 审核提示：**"Manifest V3 产品包含远程托管代码"**

**具体违规代码位置：**
```
文件: stats-service.js
代码: loadJS(s) { return new Promise((t, n) => { 
  const r = document.createElement("script"); 
  r.setAttribute("src", s), ...
  gapiScript:"https://apis.google.com/js/api.js"
  recaptchaV2Script:"https://www.google.com/recaptcha/api.js"
```

```
文件: src/background/index.js  
代码: 同样的 loadJS 函数和远程脚本 URL
```

---

## 🔍 根本原因

虽然我们已经在 UI 层面禁用了登录功能，但 **Firebase SDK 仍然被打包进了构建产物**。

### 为什么会这样？

1. **后台服务仍在导入 Firebase 模块**
   - `src/background/index.ts` 导入了 `authService`
   - 各个 service 文件导入了 `auth-service` 和 `firestore-service`
   - 即使不调用，只要 import 就会被打包

2. **Firebase SDK 包含动态脚本加载代码**
   - Firebase Auth 需要加载 Google API (`apis.google.com/js/api.js`)
   - Firebase 包含 reCAPTCHA 支持
   - 这些代码违反了 Manifest V3 的远程代码政策

3. **Tree-shaking 无法完全移除**
   - Firebase SDK 的副作用导致无法被完全 tree-shake
   - 即使代码未执行，审核工具仍能检测到

---

## ✅ 解决方案

### 方案一：完全移除 Firebase 依赖（推荐用于审核版本）

这是最彻底的解决方案，确保构建产物中不包含任何 Firebase 代码。

#### 步骤 1：注释掉 Firebase 导入

**文件需要修改的列表：**

1. `src/background/index.ts`
2. `src/background/services/knock-service.ts`
3. `src/background/services/stats-service.ts`
4. `src/background/services/contact-service.ts`
5. `src/background/services/email-service.ts`
6. `src/background/services/sync-scheduler.ts`
7. `src/options/components/SyncStatus.tsx`
8. `src/options/components/ContactForm.tsx`

**修改示例（以 `src/background/index.ts` 为例）：**

```typescript
// 注释掉 Firebase 相关导入
// import { authService } from '../shared/services/auth-service'

// 注释掉 authService 的初始化调用
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installed')
  
  // 初始化语言
  await initLanguage()
  
  // 初始化认证服务 - 暂时禁用
  // await authService.initialize()
  
  // ... 其他代码
})
```

#### 步骤 2：修改所有使用 authService 的地方

在所有调用 `authService` 的地方添加注释：

```typescript
// 示例：src/background/services/knock-service.ts

export class KnockService {
  async knock(): Promise<KnockResult> {
    // ... 敲击逻辑
    
    // 同步到云端 - 暂时禁用
    // const authState = await authService.getAuthState()
    // if (authState.isSignedIn) {
    //   await syncService.syncToCloud()
    // }
    
    return result
  }
}
```

#### 步骤 3：验证构建产物

```bash
# 重新构建
npm run build

# 检查是否还包含 Firebase 代码
# Windows PowerShell:
Select-String -Path "dist/**/*.js" -Pattern "apis.google.com" -SimpleMatch

# 如果没有输出，说明 Firebase 代码已被移除
```

#### 步骤 4：测试功能

```bash
# 在 Chrome 中加载 dist 目录
# 测试核心功能：
# - 敲木鱼
# - 查看统计
# - 管理联系人（本地）
# - 设置页面

# 确保没有 JavaScript 错误
```

---

### 方案二：使用条件编译（长期方案）

创建两个构建版本：审核版（无 Firebase）和生产版（有 Firebase）。

#### 1. 安装依赖

```bash
npm install --save-dev cross-env
```

#### 2. 修改 package.json

```json
{
  "scripts": {
    "build": "tsc && vite build && node scripts/copy-icons.js",
    "build:review": "cross-env VITE_DISABLE_FIREBASE=true npm run build",
    "build:prod": "cross-env VITE_DISABLE_FIREBASE=false npm run build"
  }
}
```

#### 3. 创建条件导入

**src/shared/services/auth-service-stub.ts**（新建）
```typescript
// Firebase 禁用时的存根实现
export const authService = {
  async initialize() {
    console.log('[Auth] Firebase disabled in this build')
  },
  async getAuthState() {
    return { isSignedIn: false, user: null }
  },
  async signIn() {
    throw new Error('Auth disabled')
  },
  async signOut() {},
  onAuthStateChanged() {
    return () => {}
  },
}
```

#### 4. 使用条件导入

**src/background/index.ts**
```typescript
// 根据环境变量选择导入
const FIREBASE_DISABLED = import.meta.env.VITE_DISABLE_FIREBASE === 'true'

const authService = FIREBASE_DISABLED
  ? await import('../shared/services/auth-service-stub')
  : await import('../shared/services/auth-service')

// 使用 authService（接口相同）
await authService.initialize()
```

#### 5. 构建不同版本

```bash
# 审核版本（无 Firebase）
npm run build:review

# 生产版本（有 Firebase）
npm run build:prod
```

---

## 📋 完整修改清单

### 需要注释的文件和代码

#### 1. src/background/index.ts
```typescript
// import { authService } from '../shared/services/auth-service'

// 在 onInstalled 中：
// await authService.initialize()

// 在消息处理中：
// case 'GET_AUTH_STATE':
// case 'SIGN_IN':
// case 'SIGN_OUT':
// case 'UPDATE_DISPLAY_NAME':
```

#### 2. src/background/services/knock-service.ts
```typescript
// import { authService } from '../../shared/services/auth-service';

// 在 knock() 方法中：
// const authState = await authService.getAuthState()
// if (authState.isSignedIn) {
//   await syncService.syncToCloud()
// }
```

#### 3. src/background/services/stats-service.ts
```typescript
// import { authService } from '../../shared/services/auth-service';

// 在相关方法中注释掉 authService 调用
```

#### 4. src/background/services/contact-service.ts
```typescript
// import { authService } from '../../shared/services/auth-service';

// 在 addContact, updateContact, deleteContact 中：
// const authState = await authService.getAuthState()
// if (authState.isSignedIn) {
//   await syncService.syncContacts()
// }
```

#### 5. src/background/services/email-service.ts
```typescript
// import { authService } from '../../shared/services/auth-service';
```

#### 6. src/background/services/sync-scheduler.ts
```typescript
// import { authService } from '../../shared/services/auth-service';

// 整个文件的自动同步逻辑都已禁用（alarms 已移除）
```

#### 7. src/options/components/SyncStatus.tsx
```typescript
// import { authService } from '../../shared/services/auth-service'

// 组件内部：
// const [authState, setAuthState] = useState(null)
// 
// useEffect(() => {
//   loadAuthState()
// }, [])
//
// const loadAuthState = async () => {
//   const state = await authService.getAuthState()
//   setAuthState(state)
// }
```

#### 8. src/options/components/ContactForm.tsx
```typescript
// import { authService } from '../../shared/services/auth-service';

// 在表单提交中：
// const authState = await authService.getAuthState()
// if (!authState.isSignedIn) {
//   // 显示登录提示
// }
```

---

## 🧪 验证步骤

### 1. 构建验证
```bash
npm run build
```

### 2. 代码检查
```bash
# 检查是否还有 Firebase 相关代码
Select-String -Path "dist/**/*.js" -Pattern "firebase|googleapis|recaptcha" -SimpleMatch
```

### 3. 功能测试
- [ ] 敲木鱼功能正常
- [ ] 统计数据显示正常
- [ ] 联系人管理正常（本地存储）
- [ ] 设置页面正常
- [ ] 帮助页面正常
- [ ] 无 JavaScript 错误

### 4. 打包提交
```bash
cd dist
# Windows PowerShell
Compress-Archive -Path * -DestinationPath ../extension-no-firebase.zip -Force
cd ..
```

---

## 📝 提交审核时的说明

在 Chrome Web Store 的审核说明中添加：

```
本扩展使用本地存储（chrome.storage.local）管理所有数据。
所有代码均已打包在扩展中，不包含任何远程托管代码。
host_permissions 仅用于未来可能的 API 调用功能，当前版本未使用。
```

---

## 🔄 发布后恢复 Firebase

扩展通过审核并获得永久 ID 后：

1. 取消所有 Firebase 相关代码的注释
2. 配置 OAuth（使用正确的扩展 ID）
3. 重新构建和测试
4. 提交更新版本

详细步骤参考：`docs/RESTORE_AUTH_GUIDE.md`

---

## ⚠️ 重要提示

1. **不要删除 Firebase 代码**，只需注释掉，方便将来恢复
2. **保留所有 Firebase 配置文件**（firebase.ts, firebase.example.ts）
3. **在代码注释中说明原因**，例如：
   ```typescript
   // 暂时禁用 Firebase - 等待 Chrome Web Store 审核通过
   // TODO: 审核通过后恢复此功能
   ```

---

**创建日期**：2026-01-26
**状态**：待实施
