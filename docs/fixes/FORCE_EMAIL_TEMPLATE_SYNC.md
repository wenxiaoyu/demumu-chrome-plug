# 强制同步邮件模板

## 问题

日志显示 "User settings already in sync"，说明云端已有配置，但可能没有邮件模板字段。

## 解决方案

强制更新本地时间戳，触发重新上传。

## 方法 1: 使用浏览器控制台（推荐）

1. 打开 Chrome 扩展的 Options 页面
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 粘贴并执行以下代码：

```javascript
// 强制更新配置时间戳
(async () => {
  // 更新时间戳为当前时间
  await chrome.storage.local.set({ 
    'settingsUpdatedAt': Date.now() 
  });
  
  console.log('✅ 时间戳已更新，现在触发同步...');
  
  // 触发同步
  const response = await chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
  
  if (response.success) {
    console.log('✅ 同步成功！');
  } else {
    console.error('❌ 同步失败:', response.error);
  }
})();
```

4. 等待几秒钟
5. 检查控制台输出，应该看到：
   ```
   [SyncService] User settings uploaded (local newer)
   ```

## 方法 2: 删除云端配置（彻底重置）

如果方法 1 不起作用，可以删除云端配置，让系统重新上传：

1. 打开 Firebase Console
2. 进入 Firestore Database
3. 找到 `userSettings/{你的uid}` 文档
4. 点击删除
5. 回到扩展，点击 "立即同步"
6. 系统会重新上传完整配置（包括邮件模板）

## 方法 3: 清除本地邮件模板缓存

强制重新生成邮件模板：

```javascript
// 在浏览器控制台执行
(async () => {
  // 删除本地邮件模板
  await chrome.storage.local.remove('customEmailTemplate');
  
  // 更新时间戳
  await chrome.storage.local.set({ 
    'settingsUpdatedAt': Date.now() 
  });
  
  console.log('✅ 本地邮件模板已清除，触发同步...');
  
  // 触发同步
  const response = await chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
  
  if (response.success) {
    console.log('✅ 同步成功！应该会生成新的邮件模板');
  }
})();
```

## 验证步骤

### 1. 检查浏览器控制台日志

应该看到以下日志之一：

**成功生成模板**:
```
[SyncService] Syncing user settings...
[SyncService] Default email template generated
[SyncService] User settings uploaded (local newer)
```

**或者使用现有模板**:
```
[SyncService] Syncing user settings...
[SyncService] User settings uploaded (local newer)
```

### 2. 检查 Firebase Console

1. 打开 Firestore Database
2. 找到 `userSettings/{你的uid}` 文档
3. 点击查看详情
4. 应该看到 `emailTemplate` 字段，包含：
   - `subject`: 邮件主题
   - `htmlBody`: HTML 正文（很长）
   - `textBody`: 纯文本正文

### 3. 检查本地存储

在浏览器控制台执行：

```javascript
chrome.storage.local.get(['customEmailTemplate'], (result) => {
  if (result.customEmailTemplate) {
    console.log('✅ 本地有邮件模板');
    console.log('主题:', result.customEmailTemplate.subject);
    console.log('HTML 长度:', result.customEmailTemplate.htmlBody.length);
    console.log('文本长度:', result.customEmailTemplate.textBody.length);
  } else {
    console.log('❌ 本地没有邮件模板');
  }
});
```

## 调试信息收集

如果仍然有问题，请收集以下信息：

### 1. 检查本地配置

```javascript
chrome.storage.local.get([
  'language',
  'deathDetectionConfig',
  'customEmailTemplate',
  'settingsVersion',
  'settingsUpdatedAt'
], (result) => {
  console.log('本地配置:', result);
});
```

### 2. 检查云端配置

在 Firebase Console 查看 `userSettings/{uid}` 文档的完整内容。

### 3. 检查同步状态

```javascript
chrome.storage.local.get(['lastSyncTime'], (result) => {
  if (result.lastSyncTime) {
    const date = new Date(result.lastSyncTime);
    console.log('最后同步时间:', date.toLocaleString());
  } else {
    console.log('从未同步过');
  }
});
```

## 常见问题

### Q1: 为什么显示 "already in sync"？

**A**: 因为本地和云端的 `updatedAt` 时间戳相同。使用方法 1 更新时间戳即可。

### Q2: 邮件模板太大会有问题吗？

**A**: 不会。HTML 邮件模板约 3-4KB，远小于 Firestore 1MB 的文档大小限制。

### Q3: 如何确认邮件模板已上传？

**A**: 
1. 在 Firebase Console 查看 `userSettings/{uid}` 文档
2. 应该看到 `emailTemplate` 字段
3. 字段内容应该包含 `subject`、`htmlBody`、`textBody`

### Q4: 可以自定义邮件模板吗？

**A**: 可以。修改本地的 `customEmailTemplate`，然后更新 `settingsUpdatedAt` 触发同步。未来会添加 UI 编辑器。

## 快速测试脚本

一键测试所有功能：

```javascript
(async () => {
  console.log('🔍 开始诊断...\n');
  
  // 1. 检查本地配置
  const local = await chrome.storage.local.get([
    'language',
    'customEmailTemplate',
    'settingsUpdatedAt'
  ]);
  
  console.log('📱 本地配置:');
  console.log('  语言:', local.language || '未设置');
  console.log('  邮件模板:', local.customEmailTemplate ? '✅ 存在' : '❌ 不存在');
  console.log('  更新时间:', local.settingsUpdatedAt ? new Date(local.settingsUpdatedAt).toLocaleString() : '未设置');
  
  // 2. 强制同步
  console.log('\n🔄 强制同步...');
  await chrome.storage.local.set({ 
    'settingsUpdatedAt': Date.now() 
  });
  
  const response = await chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
  
  if (response.success) {
    console.log('✅ 同步成功！');
    console.log('\n📝 请在 Firebase Console 检查 userSettings 文档');
  } else {
    console.error('❌ 同步失败:', response.error);
  }
})();
```

---

**提示**: 使用方法 1 是最简单快速的方式！
