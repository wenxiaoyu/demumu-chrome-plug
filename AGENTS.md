<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## 项目开发规范

### 国际化要求（Internationalization - i18n）

**所有新功能开发必须支持中英文双语。**

#### 1. UI 文本国际化

所有用户可见的文本必须使用 `t()` 函数：

```typescript
import { t } from '../../shared/utils/i18n';

// ✅ 正确
<button>{t('sync_syncNow')}</button>
<p>{t('sync_info1')}</p>

// ❌ 错误 - 不要硬编码文本
<button>立即同步</button>
<p>数据每 30 分钟自动同步一次</p>
```

#### 2. 翻译文件更新流程

**步骤 1：添加中文翻译**

在 `src/_locales/zh_CN/messages.json` 中添加翻译键：

```json
{
  "sync_syncNow": {
    "message": "立即同步",
    "description": "Sync now button"
  },
  "sync_info1": {
    "message": "💡 数据每 30 分钟自动同步一次",
    "description": "Sync info 1"
  }
}
```

**步骤 2：更新翻译脚本**

在 `scripts/translate-en.js` 的 `translations` 对象中添加英文翻译：

```javascript
const translations = {
  // ... 其他翻译
  "sync_syncNow": "Sync Now",
  "sync_info1": "💡 Data syncs automatically every 30 minutes",
};
```

**步骤 3：生成英文翻译**

运行翻译脚本：

```bash
node scripts/translate-en.js
```

**步骤 4：验证**

- 检查 `src/_locales/en/messages.json` 是否正确生成
- 在浏览器中切换语言测试

#### 3. 翻译键命名规范

使用清晰的命名空间和描述性名称：

```
{模块}_{功能}_{类型}

示例：
- sync_syncNow (同步模块 - 立即同步 - 按钮)
- sync_status (同步模块 - 状态 - 标签)
- contact_addButton (联系人模块 - 添加 - 按钮)
- settings_title (设置模块 - 标题)
```

#### 4. 带参数的翻译

使用占位符处理动态内容：

**中文翻译：**
```json
{
  "sync_minutesAgo": {
    "message": "$COUNT$ 分钟前",
    "description": "Minutes ago",
    "placeholders": {
      "count": {
        "content": "$1",
        "example": "5"
      }
    }
  }
}
```

**使用方式：**
```typescript
t('sync_minutesAgo', String(minutes))
```

#### 5. 检查清单

在提交代码前，确保：

- [ ] 所有用户可见的文本都使用 `t()` 函数
- [ ] 已在 `zh_CN/messages.json` 添加中文翻译
- [ ] 已在 `translate-en.js` 添加英文翻译
- [ ] 已运行 `node scripts/translate-en.js` 生成英文翻译
- [ ] 已运行 `npm run build` 验证构建成功
- [ ] 已在浏览器中测试中英文显示

#### 6. 常见错误

❌ **错误 1：硬编码文本**
```typescript
<h3>数据同步</h3>  // 错误
```

✅ **正确：**
```typescript
<h3>{t('sync_title')}</h3>
```

---

❌ **错误 2：忘记更新翻译脚本**
```javascript
// translate-en.js 中缺少新增的键
// 导致英文翻译显示中文
```

✅ **正确：**
```javascript
const translations = {
  // 添加所有新增的翻译键
  "sync_title": "Data Sync",
  "sync_syncNow": "Sync Now",
};
```

---

❌ **错误 3：翻译键命名不规范**
```json
{
  "button1": "立即同步",  // 不清晰
  "text": "状态"         // 太通用
}
```

✅ **正确：**
```json
{
  "sync_syncNow": "立即同步",
  "sync_status": "状态"
}
```

#### 7. 相关文件

- 中文翻译：`src/_locales/zh_CN/messages.json`
- 英文翻译：`src/_locales/en/messages.json`
- 翻译脚本：`scripts/translate-en.js`
- i18n 工具：`src/shared/utils/i18n.ts`

#### 8. 语言切换

用户可以在 Options 页面的设置标签中切换语言。语言设置保存在 Chrome Storage 中，重启浏览器后保持。

---

**记住：国际化不是可选项，而是必需项。所有新功能都必须支持中英文双语！**
