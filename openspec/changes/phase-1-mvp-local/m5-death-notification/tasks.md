# M5：死亡通知系统 - 任务清单

## 迭代 1.15：紧急联系人管理（0.5 天）

### 数据模型和服务
- [ ] 1.15.1 创建联系人数据模型
  - 定义 `EmergencyContact` 接口
  - 定义 `ContactGroup` 枚举
  - 定义 `ContactsData` 接口
  - 添加到 `src/shared/types/index.ts`
  - _Requirements: 紧急联系人管理_

- [ ] 1.15.2 实现联系人服务
  - 创建 `src/background/services/contact-service.ts`
  - 实现 `addContact()` - 添加联系人
  - 实现 `updateContact()` - 更新联系人
  - 实现 `deleteContact()` - 删除联系人
  - 实现 `getAllContacts()` - 获取所有联系人
  - 实现 `getContactsByGroup()` - 按分组获取
  - 实现 `getContactsByPriority()` - 按优先级排序
  - 实现 `validateEmail()` - 邮箱验证
  - 使用 Chrome Storage API 持久化数据
  - _Requirements: 联系人增删改查_

- [ ] 1.15.3 创建联系人存储常量
  - 在 `src/shared/constants.ts` 添加 `STORAGE_KEYS.CONTACTS`
  - 定义默认联系人数据结构
  - _Requirements: 数据持久化_

### UI 组件
- [ ] 1.15.4 创建联系人管理页面
  - 创建 `src/options/components/ContactsPage.tsx`
  - 创建 `src/options/components/ContactsPage.css`
  - 实现联系人列表展示
  - 按分组显示联系人（家人、朋友、同事、其他）
  - 显示联系人信息（姓名、邮箱、关系、优先级）
  - 添加"添加联系人"按钮
  - _Requirements: 联系人列表展示_

- [ ] 1.15.5 创建联系人表单组件
  - 创建 `src/options/components/ContactForm.tsx`
  - 创建 `src/options/components/ContactForm.css`
  - 实现表单字段：姓名、邮箱、关系、分组、优先级
  - 实现表单验证（必填项、邮箱格式）
  - 支持添加和编辑两种模式
  - _Requirements: 联系人添加和编辑_

- [ ] 1.15.6 创建联系人卡片组件
  - 创建 `src/options/components/ContactCard.tsx`
  - 创建 `src/options/components/ContactCard.css`
  - 显示联系人详细信息
  - 添加编辑和删除按钮
  - 实现删除确认对话框
  - _Requirements: 联系人展示和操作_

- [ ] 1.15.7 添加设置入口到 Popup 页面
  - 在 `src/popup/Popup.tsx` 底部 footer 添加设置图标（⚙️）
  - 点击图标打开 Options 页面
  - 使用 `chrome.runtime.openOptionsPage()` API
  - 更新 `src/popup/popup.css` 样式
  - _Requirements: 设置入口_

- [ ] 1.15.8 集成联系人页面到 Options
  - 在 `src/options/Options.tsx` 添加"紧急联系人"标签
  - 添加"设置"标签
  - 实现标签切换逻辑
  - 更新 Options 页面样式
  - 支持从 URL 参数指定默认标签（如 `?tab=settings`）
  - _Requirements: 页面导航_

### 数据管理
- [ ] 1.15.9 创建联系人 Hook
  - 创建 `src/options/hooks/useContacts.ts`
  - 实现联系人数据加载
  - 实现添加、更新、删除操作
  - 实现按分组过滤
  - 实现按优先级排序
  - 处理加载和错误状态
  - _Requirements: 联系人数据管理_

---

## 迭代 1.16：死亡检测算法（0.5 天）

### 检测配置
- [ ] 1.16.1 创建死亡检测配置模型
  - 定义 `DeathDetectionConfig` 接口
  - 定义可配置参数：
    - `inactivityThreshold`: 未活跃天数阈值（默认 7 天）
    - `hpThreshold`: HP 阈值（默认 0）
    - `checkInterval`: 检查间隔（默认 1 小时）
    - `enabled`: 是否启用检测（默认 false）
  - 添加到 `src/shared/types/index.ts`
  - _Requirements: 死亡检测配置_

- [ ] 1.16.2 创建死亡检测服务
  - 创建 `src/background/services/death-detection-service.ts`
  - 实现 `checkDeathStatus()` - 检查死亡状态
  - 实现 `calculateInactiveDays()` - 计算未活跃天数
  - 实现 `isDead()` - 判断是否"死亡"
  - 实现 `getDeathReason()` - 获取死亡原因
  - 集成 HP 系统和活跃度数据
  - _Requirements: 死亡检测算法_

- [ ] 1.16.3 实现死亡状态数据模型
  - 定义 `DeathStatus` 接口
  - 包含字段：
    - `isDead`: 是否死亡
    - `reason`: 死亡原因
    - `inactiveDays`: 未活跃天数
    - `lastActiveDate`: 最后活跃日期
    - `detectedAt`: 检测时间
  - _Requirements: 死亡状态追踪_

### 定时检测
- [ ] 1.16.4 实现定时检测机制
  - 在 `src/background/index.ts` 添加定时检测
  - 使用 `chrome.alarms` API 创建定时任务
  - 默认每小时检查一次
  - 检测到死亡状态时触发通知
  - _Requirements: 自动检测_

- [ ] 1.16.5 实现死亡状态存储
  - 在 `src/shared/constants.ts` 添加 `STORAGE_KEYS.DEATH_STATUS`
  - 保存最新的死亡检测结果
  - 保存死亡触发时间
  - _Requirements: 状态持久化_

### 配置界面
- [ ] 1.16.6 创建死亡检测设置页面
  - 创建 `src/options/components/SettingsPage.tsx`
  - 创建 `src/options/components/SettingsPage.css`
  - 添加"启用死亡检测"开关
  - 添加"未活跃天数阈值"滑块（1-30 天）
  - 添加"HP 阈值"滑块（0-100）
  - 显示当前检测状态
  - _Requirements: 检测配置界面_

- [ ] 1.16.7 集成设置页面到 Options
  - 在 `src/options/Options.tsx` 添加"设置"标签
  - 实现配置保存和加载
  - 添加配置验证
  - _Requirements: 设置管理_

---

## 迭代 1.17：邮件发送系统（1 天）

### 邮件模板设计
- [x] 1.17.1 创建邮件模板数据模型
  - 定义 `EmailTemplate` 接口
  - 定义模板变量：
    - `{{userName}}`: 用户名称
    - `{{inactiveDays}}`: 未活跃天数
    - `{{lastActiveDate}}`: 最后活跃日期
    - `{{currentDate}}`: 当前日期
    - `{{merit}}`: 功德值
    - `{{hp}}`: 生命值
  - _Requirements: 邮件模板_

- [x] 1.17.2 设计默认邮件模板
  - 创建 `src/shared/templates/death-notification-email.ts`
  - 设计邮件主题模板
  - 设计邮件正文模板（HTML 和纯文本）
  - 包含以下内容：
    - 标题："紧急通知：{{userName}} 可能需要关注"
    - 问候语
    - 未活跃情况说明
    - 最后活跃时间
    - 建议采取的行动
    - 免责声明
  - 使用温和、关怀的语气
  - _Requirements: 邮件内容设计_

- [x] 1.17.3 实现模板渲染引擎
  - 创建 `src/shared/utils/template-renderer.ts`
  - 实现变量替换功能
  - 实现 HTML 转义
  - 支持条件渲染（可选）
  - _Requirements: 模板渲染_

### 邮件发送服务
- [x] 1.17.4 创建邮件发送服务
  - 创建 `src/background/services/email-service.ts`
  - 实现 `prepareEmail()` - 准备邮件内容
  - 实现 `generateMailtoLink()` - 生成 mailto 链接
  - 实现 `sendEmail()` - 发送邮件（使用 mailto 协议）
  - 支持多个收件人（按优先级）
  - _Requirements: 邮件发送_

- [x] 1.17.5 实现邮件发送触发逻辑
  - 在 `death-detection-service.ts` 集成邮件服务
  - 检测到死亡状态时触发邮件发送
  - 防止重复发送（记录已发送状态）
  - 实现发送失败重试机制（可选）
  - _Requirements: 自动触发_

- [x] 1.17.6 创建邮件发送记录
  - 定义 `EmailRecord` 接口
  - 记录发送时间、收件人、状态
  - 保存到 Chrome Storage
  - _Requirements: 发送历史_

### 邮件预览和测试
- [x] 1.17.7 创建邮件预览组件
  - 创建 `src/options/components/EmailPreview.tsx`
  - 创建 `src/options/components/EmailPreview.css`
  - 显示渲染后的邮件内容
  - 支持切换 HTML 和纯文本视图
  - 添加"发送测试邮件"按钮
  - _Requirements: 邮件预览_

- [x] 1.17.8 集成邮件预览到设置页面
  - 在 `SettingsPage.tsx` 添加邮件预览区域
  - 实时预览邮件内容
  - 支持手动触发测试邮件
  - _Requirements: 测试功能_

### 用户通知
- [ ] 1.17.9 实现死亡通知提醒
  - 检测到死亡状态时显示浏览器通知
  - 通知内容：提示用户已触发死亡检测
  - 提供"立即发送邮件"和"取消"选项
  - 用户确认后才发送邮件
  - _Requirements: 用户确认_

- [ ] 1.17.10 创建死亡状态指示器
  - 在 Popup 页面添加死亡状态提示
  - 显示"已触发死亡检测"警告
  - 提供"查看详情"链接到设置页面
  - _Requirements: 状态提示_

### 隐私和安全
- [ ] 1.17.11 实现数据加密（可选）
  - 对联系人邮箱进行加密存储
  - 使用 Chrome Storage 的加密功能
  - _Requirements: 数据安全_

- [ ] 1.17.12 添加隐私说明
  - 在设置页面添加隐私政策说明
  - 说明数据存储位置（本地）
  - 说明邮件发送方式（mailto 协议）
  - 添加数据导出和删除功能
  - _Requirements: 隐私保护_

---

## 完成标准

### 必须完成
- [ ] 联系人管理功能完整（增删改查）
- [ ] 联系人分组和优先级功能正常
- [ ] 死亡检测算法实现并可配置
- [ ] 定时检测机制正常运行
- [ ] 邮件模板设计合理
- [ ] 邮件发送功能正常（mailto 协议）
- [ ] 用户可以预览和测试邮件
- [ ] 死亡状态通知正常显示

### 验收检查
- [ ] 可以添加至少 5 个联系人
- [ ] 联系人信息正确保存和显示
- [ ] 邮箱格式验证正常
- [ ] 死亡检测算法准确判断状态
- [ ] 配置修改后立即生效
- [ ] 邮件内容渲染正确
- [ ] mailto 链接可以正常打开邮件客户端
- [ ] 所有 UI 响应式正常
- [ ] TypeScript 类型检查通过
- [ ] 构建成功无错误

## 时间安排

**Day 1（上午）：联系人管理**
- 数据模型和服务（1.15.1 - 1.15.3）
- UI 组件（1.15.4 - 1.15.7）
- 数据管理（1.15.8）

**Day 1（下午）：死亡检测**
- 检测配置（1.16.1 - 1.16.3）
- 定时检测（1.16.4 - 1.16.5）
- 配置界面（1.16.6 - 1.16.7）

**Day 2（上午）：邮件模板和服务**
- 邮件模板设计（1.17.1 - 1.17.3）
- 邮件发送服务（1.17.4 - 1.17.6）

**Day 2（下午）：邮件预览和完善**
- 邮件预览和测试（1.17.7 - 1.17.8）
- 用户通知（1.17.9 - 1.17.10）
- 隐私和安全（1.17.11 - 1.17.12）

## 注意事项

1. **邮件发送限制**：
   - Phase 1 使用 mailto 协议，需要用户手动确认
   - 无法自动发送邮件（需要后端服务）
   - Phase 3 将实现云端自动发送

2. **隐私保护**：
   - 所有数据存储在本地
   - 不上传到任何服务器
   - 用户完全控制数据

3. **用户体验**：
   - 邮件内容要温和、关怀
   - 避免使用"死亡"等刺激性词汇
   - 提供清晰的操作指引

4. **测试重点**：
   - 邮箱格式验证
   - 死亡检测算法准确性
   - 邮件模板渲染正确性
   - mailto 链接兼容性

5. **后续优化**：
   - Phase 2：邮件模板自定义
   - Phase 3：云端自动发送
   - Phase 3：发送历史记录

## 技术依赖

- Chrome Storage API（数据存储）
- Chrome Alarms API（定时检测）
- Chrome Notifications API（用户通知）
- mailto 协议（邮件发送）

## 下一步

完成 M5 后：
1. 进入 M3：优化和完善
2. 进入 M4：测试和发布
3. 发布 v0.2.0 版本（包含死亡通知功能）

**让我们实现真正的"还活着吗"核心功能！💌**
