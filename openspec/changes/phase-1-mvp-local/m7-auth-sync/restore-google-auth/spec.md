# 恢复 Google 登录和同步功能

## 目标

恢复在 v1.1.0 中为通过 Chrome Web Store 审核而临时禁用的 Google OAuth 登录和云端同步功能。扩展已发布并获批，现在需要将注释掉的代码和占位 UI 恢复为完整功能实现。

## 背景

- **禁用日期**：2026-01-26（v1.1.0）
- **禁用原因**：Chrome Web Store 审核时 Google OAuth 返回 400 错误（无永久扩展 ID）
- **当前状态**：扩展已发布并获批，拥有永久扩展 ID
- **参考文档**：`docs/RESTORE_AUTH_GUIDE.md`

## 范围

### 包含

- ✅ 恢复 `src/popup/Popup.tsx` 中被注释的认证代码
- ✅ 恢复 `src/options/components/AccountSettings.tsx` 完整功能（替换"即将推出"占位 UI）
- ✅ 清理临时翻译键（account_comingSoon 等）
- ✅ 清理临时 CSS 样式（.coming-soon-\* 等）
- ✅ 构建验证

### 不包含

- ❌ 修改 auth-service.ts（已完整可用）
- ❌ 修改 firebase-rest-auth.ts（已完整可用）
- ❌ 修改 background/index.ts（已处理 SIGN_IN/SIGN_OUT/GET_AUTH_STATE）
- ❌ 修改 LoginButton.tsx / UserProfile.tsx / SyncStatus.tsx（已完整可用）
- ❌ 修改 manifest.json（已有 identity 权限和 host_permissions）
- ❌ OAuth 配置（需手动在 Google Cloud Console 和 Firebase Console 完成）

## 详细设计

### 1. 恢复 Popup.tsx 认证 UI

**当前状态**：LoginButton、UserProfile 导入被注释，认证状态管理被注释，登录 UI 渲染被注释。

**恢复内容**：

1. 取消注释 `LoginButton`、`UserProfile`、`AuthState` 的 import
2. 取消注释 `authState`、`authLoading` 状态变量
3. 取消注释 `loadAuthState` 函数和 `useEffect`
4. 取消注释 `handleAuthChange` 回调
5. 取消注释登录 UI 渲染区域（根据 authState 显示 UserProfile 或 LoginButton）

### 2. 恢复 AccountSettings.tsx 完整功能

**当前状态**：整个组件被重写为"即将推出"占位 UI。

**恢复内容**：用 `docs/RESTORE_AUTH_GUIDE.md` 中记录的完整实现替换当前占位代码。恢复后的组件包含：

- 认证状态加载和监听
- 未登录状态：显示登录提示和 Google 登录按钮
- 已登录状态：用户信息展示（邮箱、显示名称、用户 ID）
- 显示名称内联编辑
- SyncStatus 组件集成
- 退出登录（带确认）
- 删除账号（占位，TODO）

### 3. 清理临时翻译键

从 `src/_locales/zh_CN/messages.json` 删除：

- `account_comingSoon`
- `account_comingSoonDesc`
- `account_feature1`
- `account_feature2`
- `account_feature3`

从 `scripts/translate-en.js` 删除对应英文翻译。

运行 `node scripts/translate-en.js` 重新生成英文翻译文件。

### 4. 清理临时 CSS 样式

从 `src/options/components/AccountSettings.css` 删除：

- `.coming-soon-container` 及相关样式
- `.coming-soon-icon`、`.coming-soon-title`、`.coming-soon-desc`
- `.coming-soon-features`
- `.feature-item`、`.feature-icon`、`.feature-text`
- `@keyframes float` 动画

### 5. 构建验证

运行 `npm run build` 确认：

- TypeScript 编译无错误
- 所有导入正确解析
- dist 输出包含恢复后的组件

## OAuth 配置步骤（手动，代码恢复后执行）

1. 从 Chrome Web Store Developer Dashboard 获取永久扩展 ID
2. 在 Google Cloud Console 添加重定向 URI：`https://[extension-id].chromiumapp.org/`
3. 在 Firebase Console 添加授权域：`[extension-id].chromiumapp.org`

## 验收标准

- [ ] Popup 页面显示登录按钮（未登录时）或用户信息（已登录时）
- [ ] Options 账号设置页面显示完整功能（非"即将推出"占位）
- [ ] 临时翻译键已清理
- [ ] 临时 CSS 样式已清理
- [ ] `npm run build` 构建成功
- [ ] 中英文翻译文件正确

## 风险

- **低风险**：这是纯代码恢复任务，所有代码已在 RESTORE_AUTH_GUIDE.md 中记录
- **注意**：OAuth 配置必须在代码恢复后手动完成，否则登录功能无法使用

## 时间估算

**0.5 天**（纯代码恢复和清理）
