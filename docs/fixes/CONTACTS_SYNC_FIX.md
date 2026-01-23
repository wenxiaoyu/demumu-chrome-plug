# 紧急联系人同步修复

## 问题

紧急联系人没有同步到云端数据库。

## 原因分析

**数据格式不一致**：

1. **contact-service.ts** 存储格式：
   ```typescript
   // 存储的是 ContactsData 对象
   {
     contacts: EmergencyContact[],
     version: number
   }
   ```

2. **sync-service.ts** 读取格式（错误）：
   ```typescript
   // 期望的是 EmergencyContact[] 数组
   const localContacts = await storage.get<EmergencyContact[]>(STORAGE_KEYS.CONTACTS);
   ```

这导致 `localContacts` 实际上是一个对象，而不是数组，所以 `localContacts.length` 返回 `undefined`，同步逻辑认为没有数据需要上传。

## 解决方案

修改 `sync-service.ts` 中的 `syncEmergencyContacts()` 方法，正确读取 `ContactsData` 格式：

### 修改前

```typescript
// ❌ 错误：期望数组，实际是对象
const localContacts = await storage.get<EmergencyContact[]>(STORAGE_KEYS.CONTACTS);
const localVersion = await storage.get<number>('contactsVersion') || 0;
```

### 修改后

```typescript
// ✅ 正确：读取 ContactsData 对象
const localContactsData = await storage.get<{ contacts: EmergencyContact[]; version: number }>(
  STORAGE_KEYS.CONTACTS
);

// 提取联系人数组和版本号
const localContacts = localContactsData?.contacts || [];
const localVersion = localContactsData?.version || 0;
```

### 下载云端数据时的修复

修改前：
```typescript
// ❌ 错误：只保存数组，丢失了 version
await storage.set(STORAGE_KEYS.CONTACTS, cloudData.contacts);
```

修改后：
```typescript
// ✅ 正确：保存完整的 ContactsData 对象
const updatedContactsData = {
  contacts: cloudData.contacts,
  version: cloudData.version
};
await storage.set(STORAGE_KEYS.CONTACTS, updatedContactsData);
```

## 完整的修复代码

```typescript
async syncEmergencyContacts(): Promise<SyncResult> {
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    console.log('[SyncService] Syncing emergency contacts...');

    // 获取本地联系人数据（ContactsData 格式）
    const localContactsData = await storage.get<{ contacts: EmergencyContact[]; version: number }>(
      STORAGE_KEYS.CONTACTS
    );
    
    // 提取联系人数组和版本号
    const localContacts = localContactsData?.contacts || [];
    const localVersion = localContactsData?.version || 0;
    const localUpdatedAt = await storage.get<number>('contactsUpdatedAt') || 0;

    // 获取云端联系人
    const cloudData = await firestoreService.getEmergencyContacts(user.uid);

    if (!cloudData) {
      // 云端无数据，上传本地数据
      if (localContacts.length > 0) {
        await firestoreService.setEmergencyContacts(
          user.uid,
          localContacts,
          localVersion
        );
        console.log('[SyncService] Emergency contacts uploaded to cloud');
      }
    } else if (localUpdatedAt > cloudData.updatedAt) {
      // 本地数据更新，上传到云端
      await firestoreService.setEmergencyContacts(
        user.uid,
        localContacts,
        localVersion
      );
      console.log('[SyncService] Emergency contacts uploaded (local newer)');
    } else if (cloudData.updatedAt > localUpdatedAt) {
      // 云端数据更新，下载到本地
      const updatedContactsData = {
        contacts: cloudData.contacts,
        version: cloudData.version
      };
      await storage.set(STORAGE_KEYS.CONTACTS, updatedContactsData);
      await storage.set('contactsVersion', cloudData.version);
      await storage.set('contactsUpdatedAt', cloudData.updatedAt);
      console.log('[SyncService] Emergency contacts downloaded (cloud newer)');
    } else {
      console.log('[SyncService] Emergency contacts already in sync');
    }

    return { success: true, syncedAt: Date.now() };
  } catch (error) {
    console.error('[SyncService] Sync emergency contacts failed:', error);
    return { success: false, error: String(error) };
  }
}
```

## 关于邮件模板

**邮件模板目前不存储在数据库中**，这是设计决定：

1. **当前实现**: 邮件模板是硬编码在 `src/shared/templates/death-notification-email.ts` 中
2. **原因**: 
   - 简化实现
   - 确保邮件格式一致
   - 避免用户误修改导致邮件格式错误
3. **未来扩展**: 如果需要支持自定义邮件模板，可以：
   - 在 `userSettings` 集合中添加 `emailTemplate` 字段（已预留）
   - 在 UI 中提供模板编辑器
   - 同步时包含自定义模板

**当前邮件模板的使用**:
```typescript
// src/background/services/email-service.ts
import { getDeathNotificationTemplate } from '../../shared/templates/death-notification-email';

// 获取模板
const template = getDeathNotificationTemplate(variables);
```

## 测试步骤

1. 重新加载 Chrome 扩展
2. 在 Options 页面添加一个紧急联系人
3. 点击 "立即同步"
4. 在 Firebase Console 检查 `emergencyContacts/{uid}` 文档
5. 应该看到联系人数据已上传

## 验证日志

成功同步时应该看到：
```
[SyncService] Syncing emergency contacts...
[SyncService] Emergency contacts uploaded to cloud
```

或者如果已经同步过：
```
[SyncService] Syncing emergency contacts...
[SyncService] Emergency contacts already in sync
```

## 相关文件

- `src/shared/services/sync-service.ts` - 修复位置
- `src/background/services/contact-service.ts` - 联系人存储格式
- `src/shared/types.ts` - `ContactsData` 类型定义

## 状态

✅ 已修复  
✅ 已构建  
✅ 准备测试

---

**修复时间**: 2026-01-21
