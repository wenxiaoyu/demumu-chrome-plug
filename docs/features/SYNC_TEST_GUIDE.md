# 数据同步测试指南

## 📋 测试前准备

1. **重新加载扩展**
   - 访问 `chrome://extensions/`
   - 找到"还活着吗"扩展
   - 点击"重新加载"按钮

2. **确保已登录**
   - 点击扩展图标打开 Popup
   - 如果未登录，点击"使用 Google 登录"
   - 完成 Google 账号授权

## ✅ 测试步骤

### 1. 查看同步状态组件

1. 打开 Options 页面（右键扩展图标 → 选项）
2. 点击"设置"标签页
3. 在页面顶部应该能看到**"数据同步"**卡片，显示：
   - 当前同步状态（空闲/同步中/成功/失败/离线）
   - 最后同步时间
   - "立即同步"按钮

### 2. 手动触发同步

1. 点击"立即同步"按钮
2. 观察状态变化：空闲 → 同步中 → 同步成功
3. 查看"最后同步"时间更新为"刚刚"

### 3. 查看 Firebase Console

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目 "alive-checker"
3. 进入 **Firestore Database**
4. 查看以下集合是否有数据：

```
📁 userData/{你的uid}
   ├── totalKnocks: 数字
   ├── merit: 数字
   ├── hp: 数字
   └── updatedAt: 时间戳

📁 emergencyContacts/{你的uid}
   ├── contacts: 数组
   └── updatedAt: 时间戳

📁 knockRecords/{你的uid}/records/
   └── {recordId}: 记录对象

📁 dailyStats/{你的uid}/stats/
   └── {date}: 统计对象
```

### 4. 查看浏览器控制台日志

1. 打开 Background Service Worker 控制台：
   - 访问 `chrome://extensions/`
   - 找到扩展，点击"Service Worker"旁边的"检查视图"

2. 查看日志输出：
```
[AuthService] First login detected, migrating data...
[DataMigration] Starting data migration...
[FirestoreService] User data saved
[FirestoreService] Emergency contacts saved
[DataMigration] Migration completed successfully
[SyncService] Starting full sync...
[SyncService] Full sync completed successfully
```

### 5. 测试自动同步

#### 5.1 敲击木鱼后同步
1. 打开 Popup 页面
2. 敲击木鱼几次
3. 等待 2-5 秒
4. 查看 Firebase Console 中 `userData` 的 `totalKnocks` 是否更新

#### 5.2 添加联系人后同步
1. 打开 Options → 紧急联系人
2. 添加一个新联系人
3. 等待 2 秒
4. 查看 Firebase Console 中 `emergencyContacts` 是否更新

#### 5.3 定时自动同步
1. 等待 30 分钟（或修改代码中的 `SYNC_INTERVAL_MINUTES` 为更短时间测试）
2. 查看控制台日志是否有自动同步记录
3. 查看同步状态组件的"最后同步"时间是否更新

### 6. 测试多设备同步

1. **设备 A**：
   - 登录 Google 账号
   - 敲击木鱼 10 次
   - 等待同步完成

2. **设备 B**（另一台电脑或浏览器）：
   - 登录同一个 Google 账号
   - 查看数据是否同步过来（总敲击次数应该是 10）

3. **设备 B**：
   - 再敲击 5 次
   - 等待同步完成

4. **设备 A**：
   - 刷新页面或等待自动同步
   - 查看总敲击次数是否变为 15

## 🔍 同步触发时机

数据会在以下情况自动同步：

- ✅ 登录后立即同步
- ✅ 首次登录时迁移本地数据
- ✅ 敲击木鱼后（延迟同步）
- ✅ 添加/修改联系人后（延迟 2 秒）
- ✅ 每 30 分钟自动同步
- ✅ 网络恢复时自动同步
- ✅ 打开 Popup/Options 页面时同步

## 🐛 常见问题

### 问题 1：同步状态一直显示"同步中"
**解决方案**：
- 检查网络连接
- 查看控制台是否有错误日志
- 尝试退出登录后重新登录

### 问题 2：Firebase Console 中没有数据
**解决方案**：
- 确认已登录
- 检查 Firebase 配置是否正确
- 查看控制台错误日志
- 确认 Firestore Security Rules 配置正确

### 问题 3：多设备数据不同步
**解决方案**：
- 确认两个设备登录的是同一个 Google 账号
- 手动点击"立即同步"按钮
- 检查网络连接
- 查看控制台日志

## 📊 验收标准

- [ ] 登录后能看到同步状态组件
- [ ] 点击"立即同步"能成功同步
- [ ] Firebase Console 中能看到用户数据
- [ ] 敲击木鱼后数据自动同步
- [ ] 添加联系人后数据自动同步
- [ ] 多设备数据能正确同步
- [ ] 同步状态显示正确（空闲/同步中/成功/失败/离线）
- [ ] 最后同步时间显示正确
- [ ] 中英文显示正常

## 🎉 测试完成

如果以上测试都通过，说明数据同步功能已经正常工作！

---

**提示**：如果遇到问题，请查看浏览器控制台的详细日志，通常能找到问题原因。
