# AI 助手工作指引

## 项目上下文

这是一个 Chrome 浏览器插件项目，名为"还活着吗"（Demumu），借鉴"死了么"APP 的理念，通过禅意的敲木鱼交互和游戏化的签到系统来增强用户粘性。

**项目特点：**
- 渐进式开发：分多个里程碑逐步实现功能
- 本地优先：核心功能本地实现，云端作为增强
- 用户体验：简洁、有趣、禅意、不打扰
- 技术栈：TypeScript + React 19 + Vite 7 + Chrome Extension Manifest V3 + Firebase

**当前状态：**
- 版本：v1.0.0
- 阶段：Phase 1 MVP（M7 进行中）
- 完成度：约 85%

## 开发原则

### 1. 渐进式迭代
- 每个阶段独立可用，可以单独发布
- 后续阶段在前一阶段基础上增强
- 不破坏已有功能

### 2. 本地优先
- 核心功能必须在本地可用
- 云端服务作为可选增强
- 离线时基础功能仍可使用
- 数据同步采用"本地立即更新 + 异步云端同步"策略

### 3. 用户体验
- 界面简洁，操作直观
- 趣味性强，黑色幽默风格
- 不过度打扰用户
- 性能优先，响应迅速

### 4. 代码质量
- TypeScript 严格模式
- 完善的类型定义
- 遵循 ESLint 规则
- 代码注释清晰
- 单元测试覆盖关键逻辑

## 当前工作流程

### 查看项目状态

1. **了解项目总体情况**
   ```bash
   # 阅读项目总览
   cat openspec/project.md
   
   # 查看当前状态
   cat openspec/STATUS.md
   ```

2. **查看当前里程碑**
   ```bash
   # 当前正在进行 M7：用户认证与云端同步
   cat openspec/changes/phase-1-mvp-local/m7-auth-sync/spec.md
   cat openspec/changes/phase-1-mvp-local/m7-auth-sync/tasks.md
   
   # 查看最新进展
   cat docs/milestones/M7_CURRENT_STATUS.md
   ```

3. **查看文档结构**
   ```bash
   # 文档已按类型归类到 docs 子文件夹
   cat docs/README.md
   ```

### 执行任务

1. 按照 `tasks.md` 中的顺序执行任务
2. 完成一个任务后，在 `tasks.md` 中标记为完成
3. 提交代码时引用任务编号
4. 遇到问题及时更新 `spec.md`

### 完成阶段

1. 确保所有任务完成
2. 运行测试和类型检查
3. 更新 `openspec/project.md` 中的状态
4. 创建 Git 标签
5. 准备下一阶段的变更提案

## 变更提案规范

### 目录结构
```
openspec/changes/
├── phase-0-setup/           # 阶段 0：项目搭建
│   ├── spec.md             # 详细规格说明
│   └── tasks.md            # 任务清单
├── phase-1-mvp-local/      # 阶段 1：MVP 本地版
│   ├── spec.md
│   └── tasks.md
└── ...
```

### spec.md 格式

```markdown
# 阶段 X：标题

## 目标
简要说明本阶段要达成的目标

## 范围
### 包含
- 功能 1
- 功能 2

### 不包含
- 功能 3
- 功能 4

## 详细设计
### 1. 功能模块 A
设计说明...

### 2. 功能模块 B
设计说明...

## 技术实现
代码结构、关键算法等

## 验收标准
- [ ] 标准 1
- [ ] 标准 2

## 依赖
前置条件

## 风险
潜在风险和应对方案

## 时间估算
预计时间
```

### tasks.md 格式

```markdown
# 阶段 X：标题 - 任务清单

## 任务列表

- [ ] 1. 大任务 A
  - [ ] 1.1 子任务 A1
  - [ ] 1.2 子任务 A2

- [ ] 2. 大任务 B
  - [ ] 2.1 子任务 B1
  - [ ] 2.2 子任务 B2

## 完成标准
所有任务完成，验收标准通过
```

## 代码规范

### 项目目录结构
```
demumu-chrome-extension/
├── openspec/                    # OpenSpec 项目管理
│   ├── project.md              # 项目总览
│   ├── AGENTS.md               # AI 助手指引（本文件）
│   ├── STATUS.md               # 项目状态
│   ├── changes/                # 变更提案（按阶段和里程碑组织）
│   │   └── phase-1-mvp-local/
│   │       ├── m1-core-function/
│   │       ├── m2-data-stats/
│   │       ├── m3-visualization/
│   │       ├── m4-testing-release/
│   │       ├── m5-death-notification/
│   │       ├── m6-i18n/
│   │       └── m7-auth-sync/   # 当前进行中
│   └── templates/              # 文档模板
├── docs/                       # 项目文档（按类型归类）
│   ├── README.md               # 文档索引
│   ├── setup/                  # 设置和配置指南
│   ├── milestones/             # 里程碑和进度文档
│   ├── features/               # 功能说明文档
│   ├── fixes/                  # 修复记录文档
│   └── development/            # 开发相关文档
├── src/
│   ├── background/             # Background Service Worker
│   │   ├── index.ts
│   │   ├── handlers/
│   │   └── services/
│   ├── popup/                  # Popup 页面（React）
│   │   ├── Popup.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── options/                # Options 页面（React）
│   │   ├── Options.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── content/                # Content Scripts
│   ├── shared/                 # 共享代码
│   │   ├── config/             # 配置（Firebase 等）
│   │   ├── services/           # 服务（认证、同步、邮件等）
│   │   ├── templates/          # 邮件模板
│   │   ├── types/              # 类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── types.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   ├── _locales/               # 国际化翻译
│   │   ├── zh_CN/
│   │   └── en/
│   ├── icons/                  # 插件图标
│   └── manifest.json           # 插件清单
├── scripts/                    # 构建和工具脚本
├── dist/                       # 构建输出
└── AGENTS.md                   # 开发规范（根目录）
```

### TypeScript 规范

```typescript
// 使用严格模式
// tsconfig.json: "strict": true

// 明确的类型定义
interface UserData {
  userId: string;
  lastCheckIn: number;
  consecutiveDays: number;
  hp: number;
  status: 'alive' | 'dead';
}

// 避免 any，使用 unknown
function processData(data: unknown): void {
  // 类型守卫
  if (isUserData(data)) {
    // ...
  }
}

// 使用枚举
enum CheckInType {
  Normal = 'normal',
  Mood = 'mood',
  Quote = 'quote'
}

// 导出类型
export type { UserData };
export { CheckInType };
```

### React 规范

```typescript
// 使用函数组件 + Hooks
import { useState, useEffect } from 'react';

interface Props {
  userId: string;
  onCheckIn: () => void;
}

export function CheckInButton({ userId, onCheckIn }: Props) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await onCheckIn();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? '签到中...' : '签到'}
    </button>
  );
}
```

### Chrome Storage 规范

```typescript
// 使用类型安全的存储封装
class Storage {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }
}

// 使用常量定义存储键
export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  CHECK_IN_HISTORY: 'checkInHistory',
  ACHIEVEMENTS: 'achievements'
} as const;
```

## 常用命令

### 开发
```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 格式化代码
pnpm format

# 运行测试（计划）
pnpm test
```

### Git 工作流
```bash
# 创建功能分支
git checkout -b feature/task-1-1

# 提交代码
git add .
git commit -m "feat(phase-1): implement check-in service (task 1.1)"

# 推送到远程
git push origin feature/task-1-1

# 合并到主分支
git checkout main
git merge feature/task-1-1

# 创建版本标签
git tag v0.2.0
git push origin v0.2.0
```

## Chrome Extension 注意事项

### Manifest V3 限制

1. **Service Worker 限制**
   - 不能使用 `window` 对象
   - 不能使用 DOM API
   - 生命周期有限，会自动休眠

2. **Content Security Policy**
   - 不能使用 `eval()`
   - 不能使用内联脚本
   - 外部资源需要在 manifest 中声明

3. **权限声明**
   ```json
   {
     "permissions": ["storage", "notifications", "alarms"],
     "host_permissions": ["<all_urls>"]
   }
   ```

### 最佳实践

1. **数据存储**
   ```typescript
   // 使用 chrome.storage.local（无限制）
   // 避免使用 chrome.storage.sync（有配额限制）
   await chrome.storage.local.set({ key: value });
   ```

2. **定时任务**
   ```typescript
   // 使用 chrome.alarms 而不是 setInterval
   chrome.alarms.create('checkStatus', { periodInMinutes: 60 });
   ```

3. **通知**
   ```typescript
   // 使用 chrome.notifications
   chrome.notifications.create({
     type: 'basic',
     iconUrl: 'icons/icon-128.png',
     title: '标题',
     message: '内容'
   });
   ```

## 调试技巧

### 开发者工具

1. **Popup 调试**
   - 右键点击插件图标 → 检查弹出内容

2. **Background 调试**
   - chrome://extensions → 详细信息 → 检查视图：Service Worker

3. **Content Script 调试**
   - 在目标页面打开开发者工具

### 日志规范

```typescript
// 使用统一的日志前缀
const LOG_PREFIX = '[AliveChecker]';

console.log(`${LOG_PREFIX} Check-in successful`);
console.error(`${LOG_PREFIX} Error:`, error);
console.warn(`${LOG_PREFIX} Warning:`, message);
```

## 测试策略

### 单元测试（计划）
- 测试核心业务逻辑
- 测试工具函数
- 使用 Vitest

### 集成测试（计划）
- 测试 Chrome API 交互
- 测试数据流
- 使用 Playwright

### 手动测试
- 每个功能完成后手动测试
- 在不同场景下测试
- 记录测试结果

## 常见问题

### Q: 如何处理异步操作？
A: 使用 async/await，确保错误处理

### Q: 如何在不同页面间共享状态？
A: 使用 Chrome Storage API 或 Message Passing

### Q: 如何优化性能？
A: 
- 减少不必要的存储读写
- 使用防抖和节流
- 延迟加载非关键功能

### Q: 如何处理数据迁移？
A: 
- 在存储中保存版本号
- 检测版本变化时执行迁移
- 保留旧数据作为备份

## 资源链接

- [Chrome Extension 官方文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [React 文档](https://react.dev/)

## 更新日志

- 2026-01-15：创建 AGENTS.md
- 2026-01-15：添加开发规范和最佳实践
