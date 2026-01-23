# M1 核心功能 - 变更日志

## 2026-01-15

### UI 优化：木鱼视觉效果和动画

**优化内容：**
- 重新设计木鱼外观，更像真实的木鱼
  - 3D 立体效果（顶部、主体、阴影）
  - 木质纹理渐变
  - 鱼纹图案装饰
- 添加木槌元素
  - 木槌头部和手柄
  - 敲击时的摆动动画
- 解压动画效果
  - 木鱼震动效果
  - 波纹扩散效果
  - 功德值浮动文字（金色发光）
- 交互优化
  - 悬停放大效果
  - 防止连续点击
  - 提示文字

**文件变更：**
- 修改：`src/popup/components/WoodenFish.tsx` - 添加动画状态和功德浮动
- 修改：`src/popup/components/WoodenFish.css` - 完整重写，3D 效果和动画

**技术细节：**
- 使用 CSS 渐变创建木质纹理
- 使用 box-shadow 创建立体感
- 使用 CSS 动画实现流畅的敲击效果
- 使用 React state 管理动画状态

---

### 已完成迭代

#### ✅ 迭代 1.1：最小可用木鱼（0.5 天）
- 创建基础类型定义和存储管理
- 创建木鱼组件和 UI
- 实现基础敲击功能
- 实现用户数据初始化

**文件变更：**
- 新增：`src/shared/utils/id-generator.ts`
- 新增：`src/popup/hooks/useKnock.ts`
- 新增：`src/popup/components/WoodenFish.tsx`
- 新增：`src/popup/components/WoodenFish.css`
- 修改：`src/popup/Popup.tsx`
- 修改：`src/popup/popup.css`
- 修改：`src/popup/index.html`

#### ✅ 迭代 1.2：今日敲击统计（0.5 天）
- 实现日期工具函数
- 实现跨天检测逻辑
- 区分今日和总敲击次数

**文件变更：**
- 新增：`src/shared/utils/date.ts`
- 修改：`src/popup/hooks/useKnock.ts`

#### ✅ 迭代 1.3：功德值系统（0.5 天）
- 功德值累积逻辑
- 功德值显示

**说明：** 功德值系统在迭代 1.1 中已同步实现

#### ✅ 迭代 1.4：生命值系统（1 天）
- 实现 HP 计算工具
- 实现 HP 奖励和惩罚逻辑
- 创建 HP 进度条组件
- 创建状态显示组件

**文件变更：**
- 新增：`src/shared/utils/hp-calculator.ts`
- 新增：`src/popup/components/HPBar.tsx`
- 新增：`src/popup/components/HPBar.css`
- 新增：`src/popup/components/StatusDisplay.tsx`
- 新增：`src/popup/components/StatusDisplay.css`
- 修改：`src/popup/hooks/useKnock.ts`
- 修改：`src/popup/Popup.tsx`

#### ✅ 迭代 1.5：连续活跃天数（0.5 天）
- 实现连续天数计算
- 显示连续天数

**说明：** 连续天数计算在迭代 1.2 中已同步实现

### 技术验收
- ✅ TypeScript 类型检查通过
- ✅ 构建成功
- ✅ 无编译错误
- ✅ 木鱼动画流畅解压

### 下一步
- 迭代 1.6：状态检测和通知（1 天）
  - 创建 Background Service Worker
  - 实现定时检查
  - 实现通知系统
  - 实现 Badge 更新
