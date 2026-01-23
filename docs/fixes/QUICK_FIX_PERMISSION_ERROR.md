# 快速修复：权限错误

## 错误信息

```
[SyncService] Some syncs failed: 
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

## 原因

新增的 `userSettings` 集合没有在 Firestore Security Rules 中配置权限。

## 快速修复（3 步）

### 步骤 1: 打开 Firebase Console

访问：https://console.firebase.google.com/

选择你的项目 → **Firestore Database** → **规则（Rules）**

### 步骤 2: 添加以下规则

在现有规则中找到 `match /databases/{database}/documents {` 这一行，在其下方添加：

```javascript
// 用户配置：只能访问自己的配置
match /userSettings/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

**完整示例**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /userData/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // ⭐ 新增这个规则
    match /userSettings/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // ... 其他规则
  }
}
```

### 步骤 3: 发布规则

1. 点击 **发布（Publish）** 按钮
2. 等待几秒钟
3. 重新加载 Chrome 扩展
4. 再次尝试同步

## 验证修复

在 Options 页面点击 "立即同步"，应该看到：

✅ **成功**: `同步成功` 或 `Sync successful`  
❌ **失败**: 仍然显示权限错误

## 如果仍然失败

1. 等待 1-2 分钟让规则生效
2. 退出登录，重新登录
3. 清除浏览器缓存
4. 检查 Firebase Console 中规则是否正确保存

## 需要帮助？

查看详细文档：`FIRESTORE_SECURITY_RULES_UPDATE.md`
