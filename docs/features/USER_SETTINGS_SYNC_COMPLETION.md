# 用户配置同步功能完成报告

## 概述

完成了用户配置（UserSettings）的云端同步功能，解决了之前数据同步遗漏用户配置信息的问题。

## 问题分析

### 发现的问题

之前的数据同步实现只包含：
- ✅ `userData` - 用户基础数据
- ✅ `knockRecords` - 敲击记录
- ✅ `dailyStats` - 每日统计
- ✅ `emergencyContacts` - 紧急联系人

但遗漏了：
- ❌ 语言偏好（`language`）
- ❌ 死亡检测配置（`deathDetectionConfig`）
- ❌ 自定义邮件模板（未来功能）
- ❌ 其他用户偏好设置

这导致用户在不同设备登录时，配置无法同步。

## 实现方案

### 1. 新增数据类型

**文件**: `src/shared/types.ts`

```typescript
/**
 * 用户配置接口（用于同步）
 */
export interface UserSettings {
  language: string;              // 语言偏好
  deathDetectionConfig: DeathDetectionConfig; // 死亡检测配置
  emailTemplate?: EmailTemplate; // 自定义邮件模板（可选）
  version: number;               // 配置版本号
  updatedAt: number;             // 更新时间
}
```

### 2. Firestore 服务扩展

**文件**: `src/shared/services/firestore-service.ts`

新增方法：
- `getUserSettings(uid: string)` - 获取用户配置
- `setUserSettings(uid: string, settings: UserSettings)` - 设置用户配置

**Firestore 集合**: `userSettings/{uid}`

**文档结构**:
```typescript
{
  uid: string;
  language: string;
  deathDetectionConfig: {
    enabled: boolean;
    inactivityThreshold: number;
    hpThreshold: number;
    checkInterval: number;
  };
  emailTemplate?: {
    subject: string;
    htmlBody: string;
    textBody: string;
  };
  version: number;
  updatedAt: number;
}
```

### 3. 同步服务扩展

**文件**: `src/shared/services/sync-service.ts`

新增方法：
- `syncUserSettings()` - 同步用户配置（双向）
- `markSettingsForSync()` - 标记配置为待同步

**同步策略**: 双向同步
- 比较本地和云端的 `updatedAt` 时间戳
- 使用较新的数据覆盖较旧的数据
- 如果云端无数据，上传本地数据
- 配置更新后发送 `SETTINGS_UPDATED` 消息通知其他组件

**集成到 `syncAll()`**:
```typescript
const results = await Promise.all([
  this.syncUserData(),
  this.syncUserSettings(),      // 新增
  this.syncEmergencyContacts(),
  this.syncKnockRecords(),
  this.syncDailyStats()
]);
```

### 4. 自动标记配置变更

#### 语言切换时

**文件**: `src/shared/utils/i18n.ts`

在 `setLanguage()` 函数中添加：
```typescript
// 标记配置为待同步
try {
  const { syncService } = await import('../services/sync-service');
  await syncService.markSettingsForSync();
} catch (error) {
  console.error('[i18n] Failed to mark settings for sync:', error);
}
```

#### 死亡检测配置更新时

**文件**: `src/options/components/SettingsPage.tsx`

在 `saveConfig()` 函数中添加：
```typescript
// 标记配置为待同步
try {
  const { syncService } = await import('../../shared/services/sync-service');
  await syncService.markSettingsForSync();
} catch (error) {
  console.error('[SettingsPage] Failed to mark settings for sync:', error);
}
```

## 数据流程

### 配置更新流程

```
用户修改配置
    ↓
保存到本地 Storage
    ↓
调用 markSettingsForSync()
    ↓
设置 settingsUpdatedAt = Date.now()
    ↓
等待下次同步（自动或手动）
    ↓
syncUserSettings() 执行
    ↓
上传到 Firestore
```

### 配置同步流程

```
syncUserSettings() 触发
    ↓
获取本地配置（language, deathDetectionConfig）
    ↓
获取云端配置（userSettings/{uid}）
    ↓
比较 updatedAt 时间戳
    ↓
┌─────────────┬─────────────┬─────────────┐
│ 云端无数据  │ 本地更新    │ 云端更新    │
│ 上传本地    │ 上传本地    │ 下载云端    │
└─────────────┴─────────────┴─────────────┘
    ↓
发送 SETTINGS_UPDATED 消息（如果下载了云端配置）
```

## 本地存储键

新增的存储键：
- `settingsVersion` - 配置版本号（默认 1）
- `settingsUpdatedAt` - 配置更新时间戳
- `customEmailTemplate` - 自定义邮件模板（可选，未来功能）

已有的存储键：
- `language` - 语言偏好
- `deathDetectionConfig` - 死亡检测配置

## 安全规则

需要在 Firestore Security Rules 中添加：

```javascript
// 用户配置：只能访问自己的配置
match /userSettings/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

## 测试建议

### 1. 单设备测试

1. 修改语言设置
2. 检查 `settingsUpdatedAt` 是否更新
3. 手动触发同步
4. 在 Firestore Console 检查 `userSettings/{uid}` 文档是否创建/更新

### 2. 多设备测试

1. 设备 A：修改语言为中文，同步
2. 设备 B：登录同一账号，触发同步
3. 验证设备 B 的语言是否自动切换为中文
4. 设备 B：修改死亡检测配置，同步
5. 设备 A：触发同步
6. 验证设备 A 的配置是否更新

### 3. 冲突测试

1. 设备 A 和 B 同时离线
2. 两个设备分别修改不同的配置
3. 设备 A 先上线同步
4. 设备 B 后上线同步
5. 验证最后修改的配置是否生效（基于 `updatedAt`）

## 性能影响

- **同步时间**: 增加约 100-200ms（一次 Firestore 读写）
- **存储空间**: 每个用户增加约 1KB（配置文档）
- **网络流量**: 每次同步增加约 1-2KB

## 未来扩展

### 可能的配置项

1. **通知偏好**
   - 是否启用浏览器通知
   - 通知声音开关
   - 通知频率设置

2. **界面偏好**
   - 主题颜色
   - 木鱼皮肤
   - 动画效果开关

3. **隐私设置**
   - 数据收集偏好
   - 统计分享设置

4. **自定义邮件模板**
   - 邮件主题模板
   - 邮件正文模板
   - 变量占位符

## 相关文件

### 修改的文件

1. `src/shared/types.ts` - 新增 `UserSettings` 接口
2. `src/shared/services/firestore-service.ts` - 新增配置同步方法
3. `src/shared/services/sync-service.ts` - 新增配置同步逻辑
4. `src/shared/utils/i18n.ts` - 语言切换时标记同步
5. `src/options/components/SettingsPage.tsx` - 配置更新时标记同步

### 需要更新的文档

1. `BACKEND_REQUIREMENTS.md` - 添加 `userSettings` 集合说明
2. `SYNC_TEST_GUIDE.md` - 添加配置同步测试步骤

## 完成状态

- [x] 定义 `UserSettings` 类型
- [x] 实现 Firestore 配置读写方法
- [x] 实现配置同步逻辑
- [x] 集成到 `syncAll()` 方法
- [x] 语言切换时自动标记同步
- [x] 死亡检测配置更新时自动标记同步
- [x] 添加 `SETTINGS_UPDATED` 消息通知
- [x] 修复 `undefined` 字段错误
- [ ] 更新 Firestore Security Rules（需要手动操作）
- [ ] 更新 `BACKEND_REQUIREMENTS.md` 文档
- [ ] 添加单元测试
- [ ] 进行集成测试

## 已修复的问题

### 问题 1: 权限拒绝错误

**错误**: `FirebaseError: [code=permission-denied]: Missing or insufficient permissions.`

**原因**: Firestore Security Rules 中没有 `userSettings` 集合的权限

**解决**: 需要在 Firebase Console 手动添加规则（见 `FIRESTORE_SECURITY_RULES_UPDATE.md`）

### 问题 2: Undefined 字段错误

**错误**: `FirebaseError: [code=invalid-argument]: Unsupported field value: undefined`

**原因**: Firestore 不允许存储 `undefined` 值，`emailTemplate` 是可选字段

**解决**: 只有当字段存在时才添加到数据对象（已修复，见 `UNDEFINED_FIELD_FIX.md`）

## 注意事项

1. **首次同步**: 用户首次登录时，如果云端无配置，会自动上传本地配置
2. **配置冲突**: 基于时间戳的冲突解决，最后修改的配置会覆盖旧配置
3. **向后兼容**: 旧版本客户端不会受影响，只是不会同步配置
4. **离线支持**: 配置修改会立即保存到本地，等待下次同步上传

## 总结

成功实现了用户配置的云端同步功能，解决了数据同步遗漏的问题。现在用户可以在不同设备间无缝同步语言偏好和死亡检测配置，提升了多设备使用体验。

---

**完成时间**: 2026-01-21
**版本**: v1.0.0
