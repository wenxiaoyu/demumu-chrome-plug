# 邮件模板自动生成修复

## 问题

`userSettings` 集合中没有看到邮件模板数据。

## 原因分析

1. **数据迁移只在首次登录时执行** - 如果用户已经登录过，数据迁移不会再次执行
2. **同步时没有生成默认模板** - 当本地没有 `customEmailTemplate` 时，同步服务会将其设置为 `undefined`，而 Firestore 服务会跳过 `undefined` 字段

## 解决方案

在 `syncUserSettings()` 方法中，如果本地没有邮件模板，自动生成默认模板并上传。

### 修改内容

**文件**: `src/shared/services/sync-service.ts`

```typescript
// 如果本地没有邮件模板，生成默认模板
let emailTemplate = customEmailTemplate;
if (!emailTemplate) {
  const { getDefaultEmailTemplate } = await import('./email-template-service');
  emailTemplate = getDefaultEmailTemplate(language || 'zh_CN');
  await storage.set('customEmailTemplate', emailTemplate);
  console.log('[SyncService] Default email template generated');
}

// 构建本地配置对象（包含邮件模板）
const localSettings: UserSettings = {
  language: language || 'zh_CN',
  deathDetectionConfig: deathDetectionConfig || DEFAULT_DEATH_DETECTION_CONFIG,
  emailTemplate: emailTemplate,  // 确保有值
  version: localVersion,
  updatedAt: localUpdatedAt
};
```

## 工作流程

### 场景 1: 首次同步（云端无数据）

```
用户触发同步
    ↓
检查本地是否有邮件模板
    ↓
┌─────────────┬─────────────┐
│ 有模板      │ 无模板      │
│ 使用现有    │ 生成默认    │
└─────────────┴─────────────┘
    ↓
保存到本地 Storage
    ↓
上传到 Firestore
    ↓
✅ 云端有邮件模板数据
```

### 场景 2: 已有用户（云端无邮件模板）

```
用户触发同步
    ↓
检查本地是否有邮件模板
    ↓
生成默认模板
    ↓
保存到本地 Storage
    ↓
上传到 Firestore
    ↓
✅ 云端更新，包含邮件模板
```

### 场景 3: 云端已有邮件模板

```
用户触发同步
    ↓
比较本地和云端时间戳
    ↓
下载云端邮件模板
    ↓
✅ 本地和云端保持同步
```

## 测试步骤

### 方法 1: 手动触发同步

1. 重新加载 Chrome 扩展
2. 打开 Options 页面
3. 点击 "立即同步" 按钮
4. 检查浏览器控制台，应该看到：
   ```
   [SyncService] Syncing user settings...
   [SyncService] Default email template generated
   [SyncService] User settings uploaded to cloud (including email template)
   ```
5. 在 Firebase Console 检查 `userSettings/{uid}` 文档
6. 应该看到 `emailTemplate` 字段包含完整的模板数据

### 方法 2: 等待自动同步

1. 重新加载 Chrome 扩展
2. 等待 30 分钟（自动同步间隔）
3. 检查 Firebase Console

### 方法 3: 清除本地数据重新测试

1. 打开 Chrome DevTools
2. Application > Storage > Clear site data
3. 重新登录
4. 触发同步
5. 验证邮件模板已上传

## 验证邮件模板内容

在 Firebase Console 中，`userSettings/{uid}` 文档应该包含：

```json
{
  "uid": "...",
  "language": "zh_CN",
  "deathDetectionConfig": {
    "enabled": false,
    "inactivityThreshold": 7,
    "hpThreshold": 0,
    "checkInterval": 60
  },
  "emailTemplate": {
    "subject": "⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃",
    "htmlBody": "<!DOCTYPE html>...",
    "textBody": "⚠️ 重要通知\n\n您好，..."
  },
  "version": 1,
  "updatedAt": 1737456789000
}
```

## 日志输出

### 成功生成模板

```
[SyncService] Syncing user settings...
[SyncService] Default email template generated
[SyncService] User settings uploaded to cloud (including email template)
```

### 已有模板

```
[SyncService] Syncing user settings...
[SyncService] User settings uploaded to cloud (including email template)
```

### 同步成功

```
[SyncService] Full sync completed successfully
```

## 注意事项

1. **语言匹配**: 邮件模板会根据用户的语言设置生成（中文或英文）
2. **模板大小**: HTML 邮件模板较大（约 3-4KB），但远小于 Firestore 1MB 限制
3. **动态导入**: 使用动态导入 `email-template-service` 避免循环依赖
4. **本地缓存**: 生成的模板会保存到本地 Storage，避免重复生成

## 相关文件

- `src/shared/services/sync-service.ts` - 修复位置
- `src/shared/services/email-template-service.ts` - 模板生成服务
- `src/shared/services/data-migration.ts` - 首次登录时的模板生成

## 完成状态

✅ 修复完成  
✅ 构建成功  
✅ 准备测试

---

**修复时间**: 2026-01-21  
**版本**: v1.0.1
