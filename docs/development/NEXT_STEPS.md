# 下一步操作指南

**更新时间**: 2026-01-21

## 🎯 当前状态

✅ **已完成**: 用户认证、数据同步、邮件模板同步、UI 集成  
⚠️ **需要配置**: Firebase Security Rules  
⏳ **待开发**: 邮件发送集成、Cloud Functions、测试

---

## 📋 用户需要做的事情

### 1. 添加 Firestore Security Rules（必须）⚠️

**为什么需要**: 没有这些规则，数据同步会失败，出现权限错误。

**步骤**:

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 左侧菜单 → **Firestore Database**
4. 顶部标签 → **规则 (Rules)**
5. 复制以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用户数据
    match /userData/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 用户配置
    match /userSettings/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 紧急联系人
    match /emergencyContacts/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 敲击记录
    match /knockRecords/{uid}/records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // 每日统计
    match /dailyStats/{uid}/stats/{date} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

6. 点击 **发布 (Publish)**
7. 等待几秒钟让规则生效

**验证**: 在浏览器控制台应该不再看到 `permission-denied` 错误。

---

### 2. 重新加载 Chrome 扩展

**步骤**:
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 找到"还活着吗"扩展
4. 点击 **刷新** 图标 🔄

---

### 3. 测试数据同步功能

**步骤**:

1. **打开扩展 Popup**
   - 点击浏览器工具栏的扩展图标
   - 如果未登录，点击"使用 Google 登录"
   - 登录后应该看到用户信息

2. **敲击木鱼**
   - 点击木鱼图标
   - 观察 HP、功德值、连续天数变化

3. **打开 Options 页面**
   - 点击 Popup 右上角的设置图标
   - 或右键扩展图标 → 选项

4. **查看账号设置**
   - 切换到"账号"标签
   - 应该看到用户信息和同步状态
   - 点击"立即同步"按钮

5. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 切换到 Console 标签
   - 应该看到类似以下日志：
     ```
     [SyncService] Starting full sync...
     [SyncService] Syncing user data...
     [SyncService] Syncing user settings...
     [SyncService] Syncing emergency contacts...
     [SyncService] Full sync completed successfully
     ```

6. **验证 Firestore 数据**
   - 打开 Firebase Console
   - 进入 Firestore Database
   - 应该看到以下集合：
     - `userData/{你的uid}`
     - `userSettings/{你的uid}` ⭐ 包含邮件模板
     - `emergencyContacts/{你的uid}` (如果添加了联系人)
     - `knockRecords/{你的uid}/records/...`
     - `dailyStats/{你的uid}/stats/...`

---

### 4. 验证邮件模板（可选）

**步骤**:

1. **检查 Firestore**
   - 打开 `userSettings/{你的uid}` 文档
   - 应该看到 `emailTemplate` 字段
   - 包含 `subject`、`htmlBody`、`textBody`

2. **如果没有邮件模板**
   - 打开 Options 页面
   - 按 F12 打开开发者工具
   - 在 Console 中执行：
     ```javascript
     (async () => {
       await chrome.storage.local.set({ 
         'settingsUpdatedAt': Date.now() 
       });
       const response = await chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
       console.log(response.success ? '✅ 同步成功' : '❌ 同步失败');
     })();
     ```
   - 等待几秒钟
   - 刷新 Firestore 页面，应该看到邮件模板

**参考文档**: `FORCE_EMAIL_TEMPLATE_SYNC.md`

---

## 🧪 测试清单

完成以上步骤后，请验证以下功能：

### 基础功能
- [ ] 可以使用 Google 账号登录
- [ ] 登录后显示用户信息（头像、名称、邮箱）
- [ ] 可以敲击木鱼
- [ ] HP、功德值、连续天数正确计算
- [ ] 可以查看统计数据

### 数据同步
- [ ] 点击"立即同步"后数据上传到 Firestore
- [ ] Firestore 中有 `userData` 文档
- [ ] Firestore 中有 `userSettings` 文档（包含邮件模板）
- [ ] 浏览器控制台没有错误日志
- [ ] 同步状态显示"同步成功"

### 紧急联系人
- [ ] 可以添加紧急联系人
- [ ] 未登录时显示登录提示
- [ ] 点击"稍后再说"可以继续添加
- [ ] 联系人数据同步到 Firestore

### 语言切换
- [ ] 可以切换中英文
- [ ] 语言设置同步到 Firestore
- [ ] 重新加载扩展后语言保持

---

## 🐛 常见问题

### Q1: 同步失败，显示 "permission-denied"

**A**: 你还没有添加 Firestore Security Rules。请按照上面的步骤 1 添加规则。

---

### Q2: Firestore 中没有 `userSettings` 文档

**A**: 可能是首次同步还没有触发。请：
1. 打开 Options 页面
2. 点击"立即同步"按钮
3. 等待几秒钟
4. 刷新 Firestore 页面

---

### Q3: `userSettings` 文档中没有 `emailTemplate` 字段

**A**: 请使用强制同步脚本（见上面步骤 4）。

---

### Q4: 同步状态一直显示"同步中"

**A**: 可能是网络问题或 Firebase 配置问题。请：
1. 检查网络连接
2. 检查 Firebase 配置是否正确
3. 查看浏览器控制台的错误日志
4. 尝试退出登录后重新登录

---

### Q5: 如何查看详细的同步日志？

**A**: 
1. 打开 Options 页面
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 点击"立即同步"按钮
5. 查看日志输出

---

## 📚 相关文档

### 必读文档
- `M7_CURRENT_STATUS.md` - M7 当前状态总结
- `FIRESTORE_SECURITY_RULES_UPDATE.md` - Security Rules 详细说明
- `DATA_SYNC_COMPLETE_SUMMARY.md` - 数据同步完整总结

### 问题排查
- `QUICK_FIX_PERMISSION_ERROR.md` - 权限错误快速修复
- `FORCE_EMAIL_TEMPLATE_SYNC.md` - 强制同步邮件模板
- `SYNC_TEST_GUIDE.md` - 同步功能测试指南

### 技术文档
- `HP_AND_ACTIVITY_EXPLANATION.md` - HP 与活跃天数关系
- `FIREBASE_SETUP_GUIDE.md` - Firebase 设置指南
- `BACKEND_REQUIREMENTS.md` - 后端需求说明

---

## 🚀 完成后的下一步

当你完成以上所有步骤并验证功能正常后，开发者将继续：

1. **任务 6**: 邮件发送集成（0.5 天）
   - 更新邮件服务使用用户信息
   - 更新邮件模板
   - 更新死亡检测服务

2. **任务 7**: 测试和优化（1 天）
   - 功能测试
   - 多设备测试
   - 安全测试

3. **任务 8**: 云端死亡检测和邮件通知（2 天）
   - 配置 SendGrid
   - 开发 Cloud Functions
   - 实现定时检查和自动邮件发送

4. **任务 9**: 文档和发布（0.5 天）
   - 更新用户文档
   - 创建隐私政策
   - 准备发布

**预计完成时间**: 约 4-5 天

---

## 💬 需要帮助？

如果遇到问题：

1. 查看相关文档（见上面"相关文档"部分）
2. 检查浏览器控制台的错误日志
3. 检查 Firebase Console 的日志
4. 联系开发者

---

**祝你测试顺利！🎉**

**"还活着吗"现在有了云端超能力！☁️**
