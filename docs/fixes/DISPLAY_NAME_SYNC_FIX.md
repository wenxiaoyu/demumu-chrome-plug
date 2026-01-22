# 显示名称同步修复

## 问题描述

用户在 Options 页面编辑的显示名称（Display Name）没有正确同步：

1. ✅ 保存到了 Firestore 的 `userData/{uid}` 文档
2. ❌ 没有保存到本地 Chrome Storage
3. ❌ 没有触发数据同步
4. ❌ 其他设备无法获取到更新的显示名称

## 原因分析

### 1. 本地类型定义缺失

`src/shared/types.ts` 中的 `UserData` 接口没有 `displayName` 字段：

```typescript
// ❌ 旧的定义
export interface UserData {
  userId: string
  lastKnockTime: number
  // ... 其他字段
  // 缺少 displayName
}
```

### 2. 同步逻辑不完整

`src/shared/services/sync-service.ts` 的 `syncUserData()` 方法在下载云端数据时，没有同步 `displayName` 字段：

```typescript
// ❌ 旧的同步逻辑
const mergedData: UserData = {
  ...localData,
  totalKnocks: cloudData.totalKnocks,
  // ... 其他字段
  // 缺少 displayName
}
```

### 3. 保存后未更新本地

`src/options/components/AccountSettings.tsx` 的 `handleSaveName()` 方法只保存到 Firestore，没有更新本地存储：

```typescript
// ❌ 旧的保存逻辑
const handleSaveName = async () => {
  await firestoreService.updateDisplayName(user.uid, displayName.trim())
  // 没有更新本地 UserData
  // 没有触发同步
}
```

## 解决方案

### 1. 添加 displayName 字段到 UserData 类型

**文件**: `src/shared/types.ts`

```typescript
export interface UserData {
  userId: string
  displayName?: string // ⭐ 新增：用户自定义显示名称
  lastKnockTime: number
  todayKnocks: number
  totalKnocks: number
  merit: number
  consecutiveDays: number
  combo: number
  hp: number
  status: 'alive' | 'dead'
  createdAt: number
  updatedAt: number
}
```

### 2. 同步 displayName 字段

**文件**: `src/shared/services/sync-service.ts`

```typescript
async syncUserData(): Promise<SyncResult> {
  // ...

  if (cloudData.updatedAt > localData.updatedAt) {
    // 云端数据更新，下载到本地
    const mergedData: UserData = {
      ...localData,
      displayName: cloudData.displayName, // ⭐ 新增：同步显示名称
      totalKnocks: cloudData.totalKnocks,
      todayKnocks: cloudData.todayKnocks,
      lastKnockTime: cloudData.lastKnockTime,
      merit: cloudData.merit,
      hp: cloudData.hp,
      consecutiveDays: cloudData.consecutiveDays,
      status: cloudData.status,
      updatedAt: cloudData.updatedAt
    };
    await storage.set(STORAGE_KEYS.USER_DATA, mergedData);
    console.log('[SyncService] User data downloaded (cloud newer)');
  }

  // ...
}
```

### 3. 保存后更新本地并触发同步

**文件**: `src/options/components/AccountSettings.tsx`

```typescript
const handleSaveName = async () => {
  if (!user || !displayName.trim()) {
    return
  }

  try {
    setSavingName(true)

    // 1. 保存到 Firestore
    const { firestoreService } = await import('../../shared/services/firestore-service')
    await firestoreService.updateDisplayName(user.uid, displayName.trim())

    // 2. ⭐ 更新本地 UserData
    const result = await chrome.storage.local.get('userData')
    if (result.userData) {
      const updatedUserData = {
        ...result.userData,
        displayName: displayName.trim(),
        updatedAt: Date.now(),
      }
      await chrome.storage.local.set({ userData: updatedUserData })
      console.log('[AccountSettings] Local userData updated with displayName')
    }

    // 3. ⭐ 触发同步
    try {
      const { syncService } = await import('../../shared/services/sync-service')
      await syncService.syncUserData()
      console.log('[AccountSettings] User data synced after displayName update')
    } catch (syncError) {
      console.error('[AccountSettings] Failed to sync:', syncError)
    }

    setEditingName(false)
    alert(t('account_nameUpdated'))
  } catch (error) {
    console.error('[AccountSettings] Save display name failed:', error)
    alert(t('account_nameUpdateFailed'))
  } finally {
    setSavingName(false)
  }
}
```

## 数据流程

### 修复前

```
用户编辑显示名称
    ↓
保存到 Firestore (userData/{uid})
    ↓
❌ 本地 UserData 未更新
❌ 未触发同步
❌ 其他设备无法获取
```

### 修复后

```
用户编辑显示名称
    ↓
1. 保存到 Firestore (userData/{uid})
    ↓
2. 更新本地 UserData (Chrome Storage)
    ↓
3. 触发数据同步
    ↓
✅ 其他设备可以通过同步获取
✅ 邮件模板可以使用自定义名称
```

## 验证修复

### 1. 测试本地保存

在浏览器控制台运行：

```javascript
// 检查本地 UserData
chrome.storage.local.get(['userData'], (result) => {
  console.log('本地 UserData:', result.userData)
  console.log('显示名称:', result.userData?.displayName)
})
```

### 2. 测试同步

1. 在设备 A 上编辑显示名称
2. 等待几秒钟（自动同步）
3. 在设备 B 上点击"立即同步"
4. 检查设备 B 的显示名称是否更新

### 3. 测试邮件预览

1. 编辑显示名称
2. 切换到"设置"标签
3. 查看邮件预览
4. 确认邮件中使用了自定义的显示名称

### 4. 检查 Firestore

在 Firebase Console 中查看 `userData/{uid}` 文档：

```json
{
  "uid": "abc123",
  "displayName": "自定义名称", // ✅ 应该存在
  "totalKnocks": 1500,
  "merit": 1500,
  "hp": 80,
  "updatedAt": 1704067200000
}
```

## 影响范围

### 受影响的功能

1. **邮件通知** - 邮件中的用户名称现在会使用自定义显示名称
2. **多设备同步** - 显示名称可以在多个设备间同步
3. **数据一致性** - 本地和云端数据保持一致

### 不受影响的功能

1. **敲木鱼功能** - 不依赖显示名称
2. **HP 计算** - 不依赖显示名称
3. **统计数据** - 不依赖显示名称

## 后续优化建议

### 1. 添加显示名称验证

```typescript
const validateDisplayName = (name: string): boolean => {
  // 长度限制
  if (name.length > 50) return false

  // 禁止特殊字符
  const invalidChars = /[<>{}[\]]/
  if (invalidChars.test(name)) return false

  return true
}
```

### 2. 添加显示名称历史记录

在 Firestore 中记录显示名称的修改历史，便于审计和恢复。

### 3. 优化同步策略

考虑使用防抖（debounce）来避免频繁同步：

```typescript
const debouncedSync = debounce(async () => {
  await syncService.syncUserData()
}, 1000)
```

## 相关文档

- [Firestore 数据库结构](../setup/FIRESTORE_DATABASE_SCHEMA.md)
- [用户配置同步完成](../features/USER_SETTINGS_SYNC_COMPLETION.md)
- [数据同步测试指南](../features/SYNC_TEST_GUIDE.md)

---

**最后更新**: 2025-01-22
