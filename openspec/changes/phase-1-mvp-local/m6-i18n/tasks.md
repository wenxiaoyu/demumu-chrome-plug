# M6：国际化支持 - 任务清单

## 任务列表

### 1. 国际化框架搭建（0.3 天）

- [x] 1.1 创建翻译文件目录结构 ✅
  - 创建 `src/_locales/zh_CN/messages.json`
  - 创建 `src/_locales/en/messages.json`
  - _Requirements: 国际化框架_

- [x] 1.2 创建 i18n 工具函数 ✅
  - 创建 `src/shared/utils/i18n.ts`
  - 实现 `t()` 函数（获取翻译）
  - 实现 `getCurrentLanguage()` 函数
  - 实现 `isChineseLanguage()` 函数
  - 实现 `setLanguage()` 函数（手动切换语言）
  - 实现 `initLanguage()` 函数（初始化语言设置）
  - _Requirements: 工具函数_

- [x] 1.3 更新 manifest.json ✅
  - 添加 `default_locale` 字段
  - 使用 `__MSG_extensionName__` 等占位符
  - _Requirements: 配置文件_

### 2. 翻译文件创建（0.3 天）

- [x] 2.1 创建中文翻译文件 ✅
  - 提取所有现有的中文文本
  - 按模块组织翻译键
  - 添加描述信息
  - 添加占位符支持（$USER$, $COUNT$, $HP$, $DAYS$ 等）
  - _Requirements: 中文翻译_

- [x] 2.2 创建英文翻译文件 ✅
  - 翻译所有文本为英文（240+ 个翻译键）
  - 注意文化差异（如"木鱼" → "Wooden Fish"）
  - 保持简洁友好的风格
  - 处理单复数形式（1 contact vs 2 contacts）
  - _Requirements: 英文翻译_

- [x] 2.3 创建邮件模板翻译 ✅
  - 创建中文邮件模板（HTML + 纯文本）
  - 创建英文邮件模板（HTML + 纯文本）
  - 更新模板渲染逻辑
  - 支持动态占位符替换（{{userName}}, {{inactiveDays}} 等）
  - _Requirements: 邮件国际化_

- [x] 2.4 创建翻译生成脚本 ✅
  - 创建 `scripts/translate-en.js`
  - 自动从中文文件生成英文文件结构
  - 保留占位符定义
  - _Requirements: 自动化工具_

### 3. 组件国际化改造（0.3 天）

- [x] 3.1 Popup 页面国际化 ✅
  - 导入 `t()` 函数
  - 替换所有硬编码文本
  - 测试中英文显示
  - _Requirements: Popup 国际化_

- [x] 3.2 Options 页面国际化 ✅
  - 更新 Options.tsx
  - 更新 StatsPage.tsx
  - 更新 ContactsPage.tsx
  - 更新 SettingsPage.tsx
  - 添加 LanguageSelector 组件
  - _Requirements: Options 国际化_

- [x] 3.3 联系人组件国际化 ✅
  - 更新 ContactForm.tsx
  - 更新 ContactCard.tsx
  - 更新验证错误消息
  - 更新关系选项翻译
  - _Requirements: 联系人国际化_

- [x] 3.4 邮件预览组件国际化 ✅
  - 更新 EmailPreview.tsx
  - 根据语言选择邮件模板
  - 支持邮件主题占位符替换
  - _Requirements: 邮件预览国际化_

- [x] 3.5 通知服务国际化 ✅
  - 更新 notification-service.ts
  - 使用 `t()` 函数替换硬编码文本
  - _Requirements: 通知国际化_

- [x] 3.6 Background 服务国际化 ✅
  - 在 background/index.ts 中初始化 i18n
  - 更新 death-detection-service.ts 使用翻译
  - _Requirements: Background 国际化_

### 4. 动态翻译支持（额外工作）

- [x] 4.1 死亡检测原因动态翻译 ✅
  - 更新 DeathStatus 接口添加 reasonKey 和 reasonParams
  - 修改 death-detection-service.ts 存储翻译键而非翻译文本
  - 更新 SettingsPage.tsx 动态翻译原因
  - 添加翻译键：reason_detectionDisabled, reason_hpBelowThreshold, reason_inactivityExceeded
  - _Requirements: 动态翻译_

- [x] 4.2 联系人关系动态翻译 ✅
  - 更新 COMMON_RELATIONSHIPS 使用翻译键
  - 添加 translateRelationship() 辅助函数
  - 支持旧数据向后兼容（中文关系映射到翻译键）
  - 更新 ContactsPage.tsx 动态翻译关系标题
  - _Requirements: 动态翻译_

### 5. 测试和优化（0.1 天）

- [x] 5.1 手动测试 ✅
  - 测试中文环境下所有功能
  - 测试英文环境下所有功能
  - 测试邮件模板
  - 测试通知消息
  - 测试语言切换功能
  - _Requirements: 功能测试_

- [x] 5.2 布局测试 ✅
  - 检查英文文本是否导致布局问题
  - 检查长文本是否溢出
  - 调整 CSS 以适应不同语言
  - _Requirements: 布局测试_

- [x] 5.3 翻译质量检查 ✅
  - 检查是否有遗漏的翻译
  - 检查翻译是否准确
  - 检查占位符是否正确
  - 修复所有显示翻译键的问题
  - _Requirements: 质量检查_

- [x] 5.4 占位符修复 ✅
  - 修复 emailSubject 占位符名称不匹配问题（$userName$ → $USER$）
  - 确保所有占位符正确替换
  - _Requirements: Bug 修复_

## 完成标准

### 必须完成
- [x] 所有 UI 文本已国际化 ✅
- [x] 中文和英文翻译完整（243 个翻译键）✅
- [x] 邮件模板支持双语 ✅
- [x] 通知消息支持双语 ✅
- [x] 浏览器语言切换后正确显示 ✅
- [x] 没有硬编码的文本 ✅
- [x] 布局在两种语言下都正常 ✅
- [x] TypeScript 类型检查通过 ✅
- [x] 构建成功无错误 ✅

### 验收检查
- [x] 切换浏览器语言到中文，所有文本显示中文 ✅
- [x] 切换浏览器语言到英文，所有文本显示英文 ✅
- [x] 邮件预览在两种语言下都正确 ✅
- [x] 通知消息在两种语言下都正确 ✅
- [x] 没有显示翻译键（如 "popup_knock"）✅
- [x] 所有占位符正确替换 ✅
- [x] 布局没有错位或溢出 ✅
- [x] 动态内容（原因、关系）正确翻译 ✅

## 实际完成情况

**总计：1.5 天**

- 国际化框架搭建（0.3 天）✅
- 翻译文件创建（0.4 天）✅ - 比预期多，因为创建了翻译脚本
- 组件国际化改造（0.4 天）✅ - 比预期多，因为添加了语言切换器
- 动态翻译支持（0.3 天）✅ - 额外工作
- 测试和优化（0.1 天）✅

## 额外完成的功能

1. **自定义 i18n 实现**：
   - 不依赖 Chrome i18n API，使用自定义实现
   - 支持手动语言切换（无需重启浏览器）
   - 支持语言持久化存储

2. **语言切换器组件**：
   - 创建 LanguageSelector 组件
   - 支持实时切换语言
   - 触发 languagechange 事件

3. **动态翻译系统**：
   - 存储翻译键而非翻译文本
   - 支持运行时动态翻译
   - 向后兼容旧数据

4. **翻译生成脚本**：
   - 自动化翻译文件生成
   - 保持结构一致性
   - 简化维护工作

## 技术亮点

1. **占位符系统**：
   - 支持命名占位符（$USER$, $COUNT$, $HP$ 等）
   - 自动按顺序替换
   - 类型安全

2. **向后兼容**：
   - 旧的中文数据自动映射到翻译键
   - 不破坏现有用户数据
   - 平滑迁移

3. **模块化设计**：
   - 翻译键按模块组织
   - 易于维护和扩展
   - 清晰的命名规范

## 遇到的问题和解决方案

### 问题 1：英文翻译文件不完整
**现象**：英文文件只有 105 个键，缺少大量翻译
**原因**：文件生成过程中断或损坏
**解决**：删除并重新生成完整的英文翻译文件

### 问题 2：占位符名称不匹配
**现象**：邮件主题显示 $USER$ 而非实际用户名
**原因**：message 中使用 $userName$ 但 placeholders 定义为 "user"
**解决**：统一使用 $USER$ 和 "user" 的组合

### 问题 3：动态内容显示中文
**现象**：英文环境下，原因和关系仍显示中文
**原因**：数据库中存储的是翻译后的文本，而非翻译键
**解决**：改为存储翻译键和参数，运行时动态翻译

### 问题 4：单复数形式处理
**现象**：英文中 "1 contacts" 不符合语法
**原因**：Chrome i18n 不支持自动复数
**解决**：使用 "contact(s)" 格式，或在代码中判断

## 注意事项

1. **翻译键命名**：
   - 使用 camelCase
   - 按模块分组（如 `popup_`, `options_`, `contacts_`）
   - 使用描述性名称

2. **占位符使用**：
   ```json
   {
     "greeting": {
       "message": "Hello, $USER$!",
       "placeholders": {
         "user": {
           "content": "$1",
           "example": "John"
         }
       }
     }
   }
   ```

3. **复数形式**：
   - 中文不需要复数形式
   - 英文需要考虑单复数
   - 使用 "contact(s)" 或代码判断

4. **文化差异**：
   - "木鱼" → "Wooden Fish"
   - "功德" → "Merit"
   - "生命值" → "HP" 或 "Health Points"
   - "敲击" → "Knock" 或 "Tap"

5. **布局考虑**：
   - 英文文本通常比中文长 20-30%
   - 使用弹性布局
   - 避免固定宽度

6. **测试方法**：
   - 使用 LanguageSelector 组件切换语言
   - 或在设置中手动切换
   - 无需重启浏览器

## 技术依赖

- Chrome Extension Manifest V3
- 自定义 i18n 实现（不依赖 Chrome i18n API）
- TypeScript
- React

## 文件清单

### 新增文件
- `src/_locales/zh_CN/messages.json` - 中文翻译（243 个键）
- `src/_locales/en/messages.json` - 英文翻译（243 个键）
- `src/shared/utils/i18n.ts` - i18n 工具函数
- `src/options/components/LanguageSelector.tsx` - 语言切换器组件
- `src/options/components/LanguageSelector.css` - 语言切换器样式
- `scripts/translate-en.js` - 翻译文件生成脚本

### 修改文件
- `src/shared/constants.ts` - 更新 COMMON_RELATIONSHIPS 为翻译键
- `src/shared/types.ts` - 添加 reasonKey 和 reasonParams 到 DeathStatus
- `src/background/index.ts` - 初始化 i18n
- `src/background/services/death-detection-service.ts` - 使用翻译键
- `src/options/components/SettingsPage.tsx` - 动态翻译原因
- `src/options/components/ContactsPage.tsx` - 动态翻译关系
- `src/options/components/ContactForm.tsx` - 翻译关系选项
- `src/options/components/EmailPreview.tsx` - 支持邮件主题翻译
- `src/shared/templates/death-notification-email.ts` - 双语邮件模板
- 所有其他组件 - 使用 t() 函数替换硬编码文本

## 下一步

完成 M6 后：
1. ✅ 国际化支持已完成
2. 可以进入 M3：优化和完善
3. 可以进入 M4：测试和发布
4. 准备发布 v0.2.0 版本（包含国际化支持）

**"还活着吗"现在已经走向世界！🌍**

## 归档说明

本 milestone 已于 2026-01-20 完成，所有任务已完成，验收标准已达成。

**主要成就**：
- ✅ 完整的双语支持（中文 + 英文）
- ✅ 243 个翻译键，覆盖所有 UI 文本
- ✅ 动态翻译系统，支持运行时切换
- ✅ 向后兼容旧数据
- ✅ 自动化翻译工具

**质量指标**：
- 翻译覆盖率：100%
- 构建成功率：100%
- 类型检查：通过
- 手动测试：通过
