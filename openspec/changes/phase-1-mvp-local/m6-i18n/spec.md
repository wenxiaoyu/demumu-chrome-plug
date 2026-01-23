# M6：国际化支持（i18n）

## 目标

为"还活着吗" Chrome 插件添加国际化支持，支持中文和英文两种语言，为未来扩展更多语言打下基础。

**里程碑价值：** 扩大用户群体，支持国际用户使用。

## 时间估算

**计划：1 天**
**实际：1.5 天**

- 国际化框架搭建（0.3 天）
- 翻译文件创建（0.4 天）- 包含翻译脚本开发
- 组件国际化改造（0.4 天）- 包含语言切换器
- 动态翻译支持（0.3 天）- 额外工作
- 测试和优化（0.1 天）

## 范围

### 包含
- ✅ 国际化框架搭建（自定义 i18n 实现）
- ✅ 中文（简体）翻译（243 个翻译键）
- ✅ 英文翻译（243 个翻译键）
- ✅ 语言切换功能（实时切换，无需刷新）
- ✅ 所有 UI 文本国际化
- ✅ 邮件模板国际化
- ✅ 通知消息国际化
- ✅ 动态翻译系统（存储翻译键而非翻译文本）
- ✅ 翻译生成脚本（自动化工具）
- ✅ 语言切换器组件

### 不包含
- ❌ 其他语言支持（日语、韩语等）
- ❌ 繁体中文支持
- ❌ 翻译管理平台集成

## 详细设计

### 1. 技术方案

#### 自定义 i18n 实现

**实际采用方案**：自定义 i18n 实现，而非 Chrome i18n API

**优点**：
- 支持实时语言切换（无需重启浏览器）
- 支持语言持久化存储
- 更灵活的占位符系统
- 支持动态翻译（存储翻译键而非翻译文本）
- 零依赖

**目录结构**：
```
src/
├── _locales/
│   ├── zh_CN/
│   │   └── messages.json
│   └── en/
│       └── messages.json
├── shared/
│   └── utils/
│       └── i18n.ts
└── options/
    └── components/
        └── LanguageSelector.tsx
```

#### 翻译文件格式

```json
{
  "extensionName": {
    "message": "还活着吗",
    "description": "Extension name"
  },
  "extensionDescription": {
    "message": "通过敲木鱼保持活跃，累积功德值",
    "description": "Extension description"
  },
  "knock": {
    "message": "敲击",
    "description": "Knock button text"
  },
  "merit": {
    "message": "功德",
    "description": "Merit label"
  },
  "hp": {
    "message": "生命值",
    "description": "HP label"
  }
}
```

### 2. 实现步骤

#### 2.1 创建翻译文件

**中文（zh_CN）**：
- 所有现有文本的中文版本
- 保持现有的文案风格

**英文（en）**：
- 所有文本的英文翻译
- 保持简洁、友好的风格
- 注意文化差异（如"木鱼"翻译为 "Wooden Fish"）

#### 2.2 创建 i18n 工具函数

```typescript
// src/shared/utils/i18n.ts

/**
 * 获取翻译文本
 * @param key 翻译键
 * @param substitutions 占位符替换值（可以是字符串、数组或对象）
 * @returns 翻译后的文本
 */
export function t(key: string, substitutions?: string | string[] | Record<string, string>): string {
  // 自定义实现，支持占位符替换
  // 从 localStorage 或浏览器语言获取当前语言
  // 加载对应的翻译文件
  // 替换占位符并返回
}

/**
 * 获取当前语言
 * @returns 语言代码（如 'zh_CN', 'en'）
 */
export function getCurrentLanguage(): string {
  // 优先从 localStorage 读取用户设置
  // 否则使用浏览器语言
}

/**
 * 设置语言
 * @param language 语言代码
 */
export function setLanguage(language: string): Promise<void> {
  // 保存到 localStorage
  // 触发 languagechange 事件
}

/**
 * 初始化语言设置
 */
export function initLanguage(): Promise<void> {
  // 在应用启动时调用
  // 加载翻译文件
}

/**
 * 判断是否为中文
 */
export function isChineseLanguage(): boolean {
  const lang = getCurrentLanguage();
  return lang.startsWith('zh');
}
```

#### 2.3 组件改造

**之前**：
```typescript
<button>敲击</button>
<div>功德：{merit}</div>
```

**之后**：
```typescript
import { t } from '../../shared/utils/i18n';

<button>{t('knock')}</button>
<div>{t('merit')}: {merit}</div>
```

#### 2.4 邮件模板国际化

创建多语言邮件模板：

```typescript
// src/shared/templates/death-notification-email.ts

export function getDeathNotificationTemplate(language: string): EmailTemplate {
  if (language.startsWith('zh')) {
    return getChineseTemplate();
  } else {
    return getEnglishTemplate();
  }
}

function getChineseTemplate(): EmailTemplate {
  return {
    subject: '紧急通知：{{userName}} 可能需要关注',
    htmlBody: '...',
    textBody: '...'
  };
}

function getEnglishTemplate(): EmailTemplate {
  return {
    subject: 'Urgent Notice: {{userName}} May Need Attention',
    htmlBody: '...',
    textBody: '...'
  };
}
```

### 3. 翻译键命名规范

#### 命名规则
- 使用 camelCase
- 按功能模块分组
- 使用描述性名称

#### 示例
```
# 通用
common_ok
common_cancel
common_save
common_delete
common_edit

# Popup 页面
popup_knock
popup_merit
popup_hp
popup_consecutiveDays

# Options 页面
options_stats
options_contacts
options_settings

# 联系人
contacts_add
contacts_name
contacts_email
contacts_relationship

# 设置
settings_deathDetection
settings_enable
settings_threshold

# 通知
notification_deathWarning
notification_hpWarning
```

### 4. 需要翻译的内容

#### 4.1 Popup 页面
- 敲击按钮
- 功德值标签
- 生命值标签
- 连续天数
- 状态提示

#### 4.2 Options 页面
- 标签导航（统计、紧急联系人、设置）
- 页面标题和描述
- 按钮文本
- 表单标签
- 错误提示
- 成功提示

#### 4.3 联系人管理
- 添加联系人
- 编辑联系人
- 删除确认
- 表单字段标签
- 验证错误消息

#### 4.4 设置页面
- 死亡检测配置
- 阈值标签
- 状态显示
- 说明文本

#### 4.5 邮件模板
- 邮件主题
- 邮件正文
- 建议行动
- 免责声明

#### 4.6 通知消息
- 死亡警告
- HP 警告
- 首次敲击通知

### 5. 语言检测和切换

#### 自动检测
```typescript
// 在应用启动时自动检测浏览器语言
const browserLanguage = navigator.language || 'en';
// 如果用户未设置，使用浏览器语言
// 如果用户已设置，使用用户设置
```

#### 手动切换（已实现）
```typescript
// LanguageSelector 组件
interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: 'zh_CN', name: 'Chinese', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' }
];

// 实时切换，无需刷新页面
// 触发 languagechange 事件，所有组件自动更新
```

### 6. 动态翻译系统（额外实现）

#### 问题
某些动态内容（如死亡检测原因、联系人关系）如果存储翻译后的文本，会导致切换语言后仍显示原语言。

#### 解决方案
存储翻译键和参数，而非翻译后的文本：

```typescript
// 死亡检测原因
interface DeathStatus {
  isDead: boolean;
  reason: string; // 向后兼容
  reasonKey?: string; // 翻译键
  reasonParams?: string[]; // 占位符参数
}

// 存储
status = {
  isDead: true,
  reasonKey: 'reason_hpBelowThreshold',
  reasonParams: ['10', '20']
};

// 显示
const displayReason = status.reasonKey 
  ? t(status.reasonKey, status.reasonParams)
  : status.reason;
```

#### 应用场景
1. 死亡检测原因（3 个翻译键）
2. 联系人关系（4 个翻译键 + 向后兼容映射）

### 7. 翻译生成脚本（额外实现）

为了简化翻译文件维护，创建了自动化脚本：

```javascript
// scripts/translate-en.js
// 读取中文翻译文件结构
// 应用英文翻译
// 保持占位符定义一致
// 生成完整的英文翻译文件
```

**优点**：
- 确保中英文文件结构一致
- 简化翻译更新流程
- 减少人工错误

### 8. 测试策略

#### 6.1 手动测试
1. 切换浏览器语言到中文，验证所有文本显示中文
2. 切换浏览器语言到英文，验证所有文本显示英文
3. 测试所有页面和功能
4. 测试邮件模板
5. 测试通知消息

#### 6.2 翻译质量检查
- 检查是否有遗漏的翻译
- 检查翻译是否准确
- 检查是否有文化差异问题
- 检查占位符是否正确替换

#### 6.3 布局测试
- 检查英文文本是否会导致布局问题
- 检查长文本是否会溢出
- 检查不同语言下的对齐问题

## 验收标准

- [x] 所有 UI 文本已国际化 ✅
- [x] 中文翻译完整且准确（243 个键）✅
- [x] 英文翻译完整且准确（243 个键）✅
- [x] 邮件模板支持双语 ✅
- [x] 通知消息支持双语 ✅
- [x] 浏览器语言切换后正确显示对应语言 ✅
- [x] 支持实时语言切换（无需刷新）✅
- [x] 动态内容正确翻译 ✅
- [x] 没有硬编码的文本 ✅
- [x] 布局在两种语言下都正常 ✅
- [x] TypeScript 类型检查通过 ✅
- [x] 构建成功无错误 ✅

## 依赖

- Chrome Extension Manifest V3
- 自定义 i18n 实现（零外部依赖）
- TypeScript
- React

## 风险

### 翻译质量
- **风险**：英文翻译可能不够地道
- **应对**：请母语人士审核，或使用专业翻译服务

### 布局问题
- **风险**：英文文本可能比中文长，导致布局问题
- **应对**：使用弹性布局，预留足够空间

### 文化差异
- **风险**：某些概念（如"木鱼"、"功德"）难以翻译
- **应对**：保留原文或使用解释性翻译

## 实际完成情况

**完成日期**：2026-01-20

**主要成就**：
- ✅ 完整的双语支持（中文 + 英文）
- ✅ 243 个翻译键，覆盖所有 UI 文本
- ✅ 动态翻译系统，支持运行时切换
- ✅ 向后兼容旧数据
- ✅ 自动化翻译工具
- ✅ 语言切换器组件

**技术亮点**：
1. 自定义 i18n 实现，支持实时切换
2. 动态翻译系统，存储翻译键而非翻译文本
3. 向后兼容旧数据
4. 自动化翻译生成脚本

**遇到的问题**：
1. 英文翻译文件不完整 → 重新生成
2. 占位符名称不匹配 → 统一命名
3. 动态内容显示中文 → 实现翻译键系统
4. 单复数形式处理 → 使用 "contact(s)" 格式

**质量指标**：
- 翻译覆盖率：100%
- 构建成功率：100%
- 类型检查：通过
- 手动测试：通过

## 后续优化

### Phase 2
- 添加更多语言支持
- 添加繁体中文支持
- ~~实现动态语言切换（无需刷新）~~ ✅ 已完成

### Phase 3
- 集成翻译管理平台（如 Crowdin）
- 支持社区贡献翻译
- 添加翻译质量检查工具

## 参考资料

- [Chrome Extension 国际化指南](https://developer.chrome.com/docs/extensions/mv3/i18n/)
- [Google 翻译风格指南](https://developers.google.com/style)
- 自定义 i18n 实现文档：`src/shared/utils/i18n.ts`
