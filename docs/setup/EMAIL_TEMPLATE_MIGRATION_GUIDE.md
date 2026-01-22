# 邮件模板迁移指南

## 概述

本指南说明如何将 Firestore 中已存在的单语言邮件模板迁移为多语言格式。

## 问题背景

如果你的 Firestore 数据库中已经有用户数据，那些数据可能还是旧的单语言格式：

**旧格式（单语言）**:

```json
{
  "emailTemplate": {
    "subject": "⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃",
    "htmlBody": "...",
    "textBody": "..."
  }
}
```

**新格式（多语言）**:

```json
{
  "emailTemplate": {
    "zh_CN": {
      "subject": "⚠️ 重要通知：{{userName}} 已经 {{inactiveDays}} 天没有活跃",
      "htmlBody": "...",
      "textBody": "..."
    },
    "en": {
      "subject": "⚠️ Important Notice: {{userName}} has been inactive for {{inactiveDays}} days",
      "htmlBody": "...",
      "textBody": "..."
    }
  }
}
```

## 迁移方案

有两种迁移方案可选：

### 方案 1：自动迁移（推荐）

客户端代码已经包含自动迁移逻辑，当用户下次同步时会自动转换：

**优点**:

- 无需手动操作
- 逐步迁移，不影响现有用户
- 安全可靠

**缺点**:

- 需要等待用户下次登录/同步
- 迁移速度较慢

**工作原理**:

在 `src/shared/services/data-migration.ts` 中：

```typescript
// 获取或生成多语言邮件模板
let emailTemplate = await storage.get<MultiLanguageEmailTemplate>('customEmailTemplate')

if (!emailTemplate) {
  // 检查是否有旧的单语言模板
  const oldTemplate = await storage.get<EmailTemplate>('customEmailTemplate')

  if (oldTemplate && oldTemplate.subject) {
    // 迁移旧模板：将单语言模板转换为多语言格式
    const defaultMultiLang = getDefaultMultiLanguageEmailTemplate()

    if (language === 'zh_CN') {
      emailTemplate = {
        zh_CN: oldTemplate,
        en: defaultMultiLang.en,
      }
    } else {
      emailTemplate = {
        zh_CN: defaultMultiLang.zh_CN,
        en: oldTemplate,
      }
    }
  }
}
```

### 方案 2：批量迁移脚本（快速）

使用提供的迁移脚本一次性迁移所有用户数据。

**优点**:

- 快速完成所有用户迁移
- 立即生效

**缺点**:

- 需要 Firebase Admin SDK 权限
- 需要手动执行

---

## 使用迁移脚本

### 步骤 1：安装依赖

```bash
npm install firebase-admin
```

### 步骤 2：获取 Firebase 服务账号密钥

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击左侧菜单的 ⚙️ 图标 → "项目设置"
4. 切换到"服务账号"标签
5. 点击"生成新的私钥"按钮
6. 下载 JSON 文件（例如：`serviceAccountKey.json`）
7. **重要**: 将此文件保存到安全位置，不要提交到 Git

### 步骤 3：设置环境变量

**Windows (CMD)**:

```cmd
set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccountKey.json
```

**Windows (PowerShell)**:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"
```

**macOS/Linux**:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

### 步骤 4：运行迁移脚本

```bash
node scripts/migrate-email-templates.js
```

### 步骤 5：查看输出

脚本会输出详细的迁移过程：

```
🚀 开始迁移 Firestore 邮件模板...

📊 找到 3 个用户配置

👤 处理用户: user123
  语言: zh_CN
  转换旧模板（语言: zh_CN）...
  ✅ 迁移成功

👤 处理用户: user456
  语言: en
  ✅ 跳过：已经是多语言格式

👤 处理用户: user789
  语言: zh_CN
  ⏭️  跳过：没有邮件模板

==================================================
📈 迁移统计:
  总数: 3
  ✅ 已迁移: 1
  ⏭️  已跳过: 2
  ❌ 失败: 0
==================================================

✨ 迁移完成！
```

---

## 验证迁移结果

### 方法 1：在 Firebase Console 中检查

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击 "Firestore Database"
4. 导航到 `userSettings/{uid}`
5. 检查 `emailTemplate` 字段

**正确的格式应该是**:

```json
{
  "emailTemplate": {
    "zh_CN": { ... },
    "en": { ... }
  }
}
```

### 方法 2：使用浏览器控制台

在扩展的 Options 页面打开浏览器控制台，运行：

```javascript
// 检查本地存储
chrome.storage.local.get(['customEmailTemplate'], (result) => {
  console.log('本地模板格式:', result.customEmailTemplate)

  if (result.customEmailTemplate?.zh_CN && result.customEmailTemplate?.en) {
    console.log('✅ 多语言格式正确')
  } else {
    console.log('❌ 格式不正确')
  }
})
```

### 方法 3：测试邮件预览

1. 打开扩展的 Options 页面
2. 切换到"设置"标签
3. 查看邮件预览
4. 切换语言（中文 ↔ 英文）
5. 确认邮件内容随语言切换而变化

---

## 迁移逻辑说明

### 转换规则

脚本会根据用户的 `language` 设置决定如何转换：

**如果用户语言是中文 (`zh_CN`)**:

```javascript
{
  zh_CN: oldTemplate,        // 保留用户的旧模板
  en: defaultEnglishTemplate // 使用默认英文模板
}
```

**如果用户语言是英文 (`en`)**:

```javascript
{
  zh_CN: defaultChineseTemplate, // 使用默认中文模板
  en: oldTemplate                // 保留用户的旧模板
}
```

### 跳过条件

脚本会跳过以下情况：

1. **没有邮件模板**: 用户从未自定义过模板
2. **已经是多语言格式**: 已经迁移过
3. **格式无法识别**: 模板格式异常

---

## 常见问题

### Q1: 迁移会覆盖用户的自定义模板吗？

**A**: 不会。迁移脚本会保留用户的自定义模板，只是将其转换为多语言格式。用户当前语言的模板会被保留，另一个语言使用默认模板。

### Q2: 如果用户同时自定义了中英文模板怎么办？

**A**: 旧版本不支持同时自定义中英文模板，所以不存在这种情况。新版本支持后，用户可以分别编辑中英文模板。

### Q3: 迁移失败了怎么办？

**A**: 检查以下几点：

1. 确认 Firebase 服务账号密钥正确
2. 确认有 Firestore 写入权限
3. 查看错误日志，确定具体原因
4. 可以手动在 Firebase Console 中修改单个用户的数据

### Q4: 可以回滚迁移吗？

**A**: 可以，但需要手动操作：

1. 在 Firebase Console 中找到对应的 `userSettings/{uid}` 文档
2. 将 `emailTemplate` 字段改回旧格式
3. 或者删除 `emailTemplate` 字段，让系统重新生成

### Q5: 迁移后客户端需要更新吗？

**A**: 不需要。新版本的客户端代码已经兼容两种格式，会自动处理。

---

## 安全注意事项

1. **保护服务账号密钥**:
   - 不要提交到 Git
   - 不要分享给他人
   - 使用后妥善保管

2. **备份数据**:
   - 在运行迁移脚本前，建议先导出 Firestore 数据备份
   - 可以在 Firebase Console 中导出数据

3. **测试环境**:
   - 建议先在测试项目中运行脚本
   - 确认无误后再在生产环境运行

---

## 相关文档

- [Firestore 数据库结构设计](./FIRESTORE_DATABASE_SCHEMA.md)
- [多语言邮件模板实现](../features/MULTI_LANGUAGE_EMAIL_TEMPLATE.md)
- [用户配置同步完成](../features/USER_SETTINGS_SYNC_COMPLETION.md)

---

**最后更新**: 2025-01-22
