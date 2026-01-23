# Undefined 字段错误修复

## 问题

同步时出现错误：

```
FirebaseError: [code=invalid-argument]: Function setDoc() called with invalid data. 
Unsupported field value: undefined (found in field emailTemplate in document userSettings/...)
```

## 原因

Firestore 不允许在文档中存储 `undefined` 值。当 `emailTemplate` 字段为 `undefined` 时（因为它是可选字段），直接传递给 `setDoc()` 会导致错误。

## 解决方案

在 `firestore-service.ts` 的 `setUserSettings()` 方法中，只有当 `emailTemplate` 存在时才将其添加到数据对象中。

### 修改前

```typescript
async setUserSettings(uid: string, settings: UserSettings): Promise<void> {
  const firestoreData: FirestoreUserSettings = {
    uid,
    language: settings.language,
    deathDetectionConfig: settings.deathDetectionConfig,
    emailTemplate: settings.emailTemplate,  // ❌ 可能是 undefined
    version: settings.version,
    updatedAt: Date.now()
  };

  await setDoc(docRef, firestoreData);
}
```

### 修改后

```typescript
async setUserSettings(uid: string, settings: UserSettings): Promise<void> {
  const firestoreData: Partial<FirestoreUserSettings> = {
    uid,
    language: settings.language,
    deathDetectionConfig: settings.deathDetectionConfig,
    version: settings.version,
    updatedAt: Date.now()
  };

  // ✅ 只有当 emailTemplate 存在时才添加
  if (settings.emailTemplate) {
    firestoreData.emailTemplate = settings.emailTemplate;
  }

  await setDoc(docRef, firestoreData as FirestoreUserSettings);
}
```

## 关键改动

1. **使用 `Partial<FirestoreUserSettings>`**: 允许字段可选
2. **条件添加字段**: 只有当 `emailTemplate` 存在时才添加到数据对象
3. **类型断言**: 最后使用 `as FirestoreUserSettings` 进行类型断言

## 测试

构建成功：
```bash
npm run build
✓ TypeScript 编译通过
✓ Vite 构建成功
```

## 验证步骤

1. 重新加载 Chrome 扩展
2. 在 Options 页面点击 "立即同步"
3. 应该看到同步成功的消息
4. 在 Firebase Console 检查 `userSettings/{uid}` 文档
5. 确认文档中没有 `emailTemplate` 字段（因为当前未使用）

## 相关文件

- `src/shared/services/firestore-service.ts` - 修复位置
- `src/shared/types.ts` - `UserSettings` 接口定义

## 最佳实践

在 Firestore 中处理可选字段时：

✅ **推荐做法**:
```typescript
const data: Partial<DataType> = {
  requiredField1: value1,
  requiredField2: value2
};

if (optionalField) {
  data.optionalField = optionalField;
}

await setDoc(docRef, data);
```

❌ **避免做法**:
```typescript
const data = {
  requiredField1: value1,
  optionalField: undefined  // ❌ Firestore 不支持
};

await setDoc(docRef, data);
```

## 状态

✅ 已修复  
✅ 已构建  
✅ 准备测试

---

**修复时间**: 2026-01-21
