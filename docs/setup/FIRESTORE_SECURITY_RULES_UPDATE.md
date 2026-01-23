# Firestore Security Rules 更新指南

## 问题

同步失败错误：`FirebaseError: [code=permission-denied]: Missing or insufficient permissions.`

**原因**: 新增的 `userSettings` 集合没有在 Firestore Security Rules 中配置访问权限。

## 解决方案

需要在 Firebase Console 中更新 Firestore Security Rules，添加 `userSettings` 集合的权限规则。

---

## 操作步骤

### 1. 打开 Firebase Console

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 在左侧菜单中点击 **Firestore Database**
4. 点击顶部的 **规则（Rules）** 标签

### 2. 更新 Security Rules

将以下规则添加到现有规则中：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用户数据：只能访问自己的数据
    match /userData/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 用户配置：只能访问自己的配置 ⭐ 新增
    match /userSettings/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 紧急联系人：只能访问自己的联系人
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 敲击记录：只能访问自己的记录
    match /knockRecords/{uid}/records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 每日统计：只能访问自己的统计
    match /dailyStats/{uid}/stats/{date} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 死亡通知：用户只读，Cloud Functions 可写（如果有）
    match /deathNotifications/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      // Cloud Functions 需要 admin 权限
    }
    
    // 邮件日志：用户只读，Cloud Functions 可写（如果有）
    match /emailLogs/{logId} {
      allow read: if request.auth != null;
      // Cloud Functions 需要 admin 权限
    }
  }
}
```

### 3. 发布规则

1. 点击 **发布（Publish）** 按钮
2. 等待规则部署完成（通常几秒钟）
3. 看到 "规则已发布" 的提示

---

## 完整的 Security Rules（推荐）

如果你想完全替换现有规则，使用以下完整版本：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // 用户相关集合
    // ============================================
    
    // 用户基础数据
    match /userData/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 用户配置（语言、死亡检测配置等）
    match /userSettings/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 紧急联系人
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // ============================================
    // 数据记录集合（子集合）
    // ============================================
    
    // 敲击记录（子集合）
    match /knockRecords/{uid}/records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 每日统计（子集合）
    match /dailyStats/{uid}/stats/{date} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // ============================================
    // 系统集合（如果使用 Cloud Functions）
    // ============================================
    
    // 死亡通知记录
    match /deathNotifications/{uid} {
      // 用户可以读取自己的通知
      allow read: if request.auth != null && request.auth.uid == uid;
      // 写入由 Cloud Functions 处理（需要 admin 权限）
    }
    
    // 邮件发送日志
    match /emailLogs/{logId} {
      // 已登录用户可以读取（可选：限制为只能读取自己的）
      allow read: if request.auth != null;
      // 写入由 Cloud Functions 处理（需要 admin 权限）
    }
  }
}
```

---

## 验证规则

### 方法 1: 使用 Rules Playground

1. 在 Firebase Console 的 Rules 页面
2. 点击 **Rules Playground** 标签
3. 测试以下场景：

**测试 1: 读取自己的配置**
```
Location: /userSettings/test-uid-123
Read: ✅ 应该允许（如果 auth.uid = test-uid-123）
```

**测试 2: 读取他人的配置**
```
Location: /userSettings/other-uid-456
Read: ❌ 应该拒绝（如果 auth.uid = test-uid-123）
```

### 方法 2: 在扩展中测试

1. 重新加载 Chrome 扩展
2. 登录你的 Google 账号
3. 在 Options 页面点击 "立即同步"
4. 检查浏览器控制台，应该看到：
   ```
   [SyncService] Full sync completed successfully
   ```

---

## 常见问题

### Q1: 规则发布后仍然报错？

**A**: 等待 1-2 分钟让规则生效，然后：
1. 重新加载 Chrome 扩展
2. 清除浏览器缓存
3. 重新登录

### Q2: 如何查看当前的规则？

**A**: 
1. Firebase Console > Firestore Database > Rules
2. 当前规则会显示在编辑器中

### Q3: 规则语法错误怎么办？

**A**: 
1. Firebase Console 会在发布前验证语法
2. 如果有错误，会显示红色提示
3. 修复错误后再次点击发布

### Q4: 如何回滚到之前的规则？

**A**:
1. 在 Rules 页面点击 **历史记录（History）**
2. 选择之前的版本
3. 点击 **恢复（Restore）**

---

## 安全最佳实践

### ✅ 推荐做法

1. **最小权限原则**: 用户只能访问自己的数据
2. **认证检查**: 所有规则都检查 `request.auth != null`
3. **UID 匹配**: 确保 `request.auth.uid == uid`
4. **数据验证**: 可以添加数据格式验证（可选）

### ❌ 避免做法

1. **不要使用 `allow read, write: if true;`** - 这会让所有人都能访问
2. **不要在规则中硬编码 UID** - 使用动态的 `request.auth.uid`
3. **不要忘记子集合** - 子集合需要单独的规则

---

## 数据验证规则（可选）

如果你想添加更严格的数据验证，可以使用以下规则：

```javascript
// 用户配置：带数据验证
match /userSettings/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;
  
  allow write: if request.auth != null 
    && request.auth.uid == uid
    && request.resource.data.keys().hasAll(['uid', 'language', 'deathDetectionConfig', 'version', 'updatedAt'])
    && request.resource.data.uid == uid
    && request.resource.data.language is string
    && request.resource.data.version is int
    && request.resource.data.updatedAt is int;
}
```

**注意**: 数据验证规则会增加复杂度，建议先使用简单规则，确保功能正常后再添加验证。

---

## 测试清单

更新规则后，请测试以下功能：

- [ ] 用户可以读取自己的配置
- [ ] 用户可以写入自己的配置
- [ ] 用户无法读取他人的配置
- [ ] 用户无法写入他人的配置
- [ ] 同步功能正常工作
- [ ] 语言切换后配置同步成功
- [ ] 死亡检测配置更新后同步成功

---

## 相关文档

- [Firebase Security Rules 官方文档](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules 测试指南](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- `BACKEND_REQUIREMENTS.md` - 后端数据结构说明
- `USER_SETTINGS_SYNC_COMPLETION.md` - 配置同步功能说明

---

**更新完成后，请重新测试同步功能！**
