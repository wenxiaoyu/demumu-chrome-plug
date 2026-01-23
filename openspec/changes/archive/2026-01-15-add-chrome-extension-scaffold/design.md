# Design: Chrome 插件脚手架与 CI/CD 流水线

## Context
这是一个全新的 Chrome 插件项目，需要建立完整的开发、构建和发布基础设施。目标是为个人开发者提供一个现代化、自动化的开发环境，支持快速迭代和无缝发布到 Chrome Web Store。

关键约束：
- 必须使用 Manifest V3（Manifest V2 将于 2024 年停止支持）
- 需要支持 TypeScript 和 React 以提供良好的开发体验
- CI/CD 流程需要完全自动化，减少手动操作
- 个人开发者账号，需要考虑成本（使用免费的 GitHub Actions）

## Goals / Non-Goals

### Goals
- 提供开箱即用的 Chrome 插件开发环境
- 实现快速的开发反馈循环（热重载、类型检查）
- 自动化发布流程，一键发布到 Chrome Web Store
- 保证代码质量（linting, formatting, type checking）
- 清晰的项目结构，易于扩展

### Non-Goals
- 不包含具体的业务功能实现（这是脚手架）
- 不支持 Firefox 或其他浏览器（专注 Chrome）
- 不包含复杂的测试框架（可后续添加）
- 不包含后端 API（纯前端插件脚手架）

## Decisions

### 1. 构建工具：Vite
**决策**: 使用 Vite 作为构建工具

**理由**:
- 极快的开发服务器启动和热更新
- 原生支持 TypeScript 和 React
- 有成熟的 Chrome 插件插件（vite-plugin-web-extension）
- 比 Webpack 配置更简单，更适合个人开发者

**替代方案**:
- Webpack: 更成熟但配置复杂，构建速度较慢
- Plasmo: 专门的 Chrome 插件框架，但抽象层次过高，灵活性较低
- Rollup: 适合库开发，但对应用开发支持不如 Vite

### 2. UI 框架：React
**决策**: 使用 React 作为 UI 框架

**理由**:
- 生态系统成熟，组件库丰富
- TypeScript 支持完善
- 开发者熟悉度高
- 适合构建复杂的 popup 和 options 页面

**替代方案**:
- Vue: 同样优秀，但 React 生态更大
- Svelte: 体积更小，但生态较小
- Vanilla JS: 简单场景可用，但复杂 UI 开发效率低

### 3. 包管理器：npm
**决策**: 使用 npm 作为包管理器

**理由**:
- 磁盘空间效率高（硬链接）
- 安装速度快
- 严格的依赖管理，避免幽灵依赖
- 与 npm 兼容

### 4. CI/CD 平台：GitHub Actions
**决策**: 使用 GitHub Actions 实现 CI/CD

**理由**:
- 与 GitHub 深度集成
- 免费额度充足（个人开发者）
- 配置简单，YAML 格式
- 社区有大量现成的 actions

### 5. Chrome Web Store 发布：chrome-webstore-upload
**决策**: 使用 chrome-webstore-upload npm 包

**理由**:
- 官方推荐的发布工具
- 支持完整的 Chrome Web Store API
- 可以在 CI 环境中使用
- 活跃维护


## Architecture

### 项目结构
```
demumu-chrome-plug/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI 流水线
│       └── release.yml         # 发布流水线
├── src/
│   ├── background/
│   │   └── index.ts            # Service Worker
│   ├── content/
│   │   └── index.ts            # Content Script
│   ├── popup/
│   │   ├── index.html
│   │   ├── Popup.tsx
│   │   └── main.tsx
│   ├── options/
│   │   ├── index.html
│   │   ├── Options.tsx
│   │   └── main.tsx
│   └── manifest.json           # 插件配置
├── scripts/
│   └── upload-to-webstore.js   # 发布脚本
├── dist/                       # 构建输出（gitignore）
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

### 组件交互
```
┌─────────────┐
│   Popup    │ ←→ Chrome Storage API
└─────────────┘
      ↓
   Messages
      ↓
┌─────────────┐
│ Background  │ ←→ Chrome APIs
│   Worker    │
└─────────────┘
      ↑
   Messages
      ↑
┌─────────────┐
│  Content    │ ←→ Web Page DOM
│   Script    │
└─────────────┘
```

### CI/CD 流程
```
Code Push → GitHub
     ↓
  CI Workflow
     ├─ Install Dependencies
     ├─ Lint & Type Check
     ├─ Build
     └─ Tests (optional)
     
Tag Push (v*) → GitHub
     ↓
  Release Workflow
     ├─ Build Production
     ├─ Create Zip
     ├─ Upload to Chrome Web Store
     └─ Create GitHub Release
```

## Risks / Trade-offs

### Risk 1: Chrome Web Store API 凭证泄露
**风险**: 如果 API 凭证泄露，恶意用户可能上传恶意版本

**缓解措施**:
- 使用 GitHub Secrets 存储凭证
- 定期轮换 refresh token
- 监控发布活动

### Risk 2: Manifest V3 限制
**风险**: Manifest V3 对某些功能有限制（如 service worker 生命周期）

**缓解措施**:
- 遵循最佳实践，使用消息传递而非长连接
- 使用 chrome.alarms API 处理定时任务
- 充分测试 service worker 的唤醒和休眠

### Risk 3: 构建产物体积
**风险**: React 可能导致插件体积较大

**缓解措施**:
- Vite 自动进行 tree-shaking 和代码分割
- 使用 Preact 替代 React（如果需要）
- 监控构建产物大小

### Trade-off: 开发体验 vs 体积
选择 React + TypeScript 提供了良好的开发体验，但会增加一些体积。对于大多数插件来说，这个权衡是值得的。如果插件非常简单，可以考虑使用 Vanilla JS。

## Migration Plan

### 初始设置步骤
1. 克隆仓库并安装依赖：`npm install`
2. 配置 Chrome Web Store 开发者账号
3. 获取 API 凭证（CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN）
4. 在 GitHub 仓库设置中添加 Secrets
5. 运行 `npm dev` 开始开发

### Chrome Web Store API 凭证获取
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Chrome Web Store API
4. 创建 OAuth 2.0 客户端 ID
5. 使用 OAuth Playground 获取 refresh token
6. 在 Chrome Developer Dashboard 获取 EXTENSION_ID

详细步骤将在 README.md 中提供。

## Open Questions

1. **是否需要支持多语言（i18n）？**
   - 建议：初始版本使用单一语言，后续可添加 chrome.i18n API 支持

2. **是否需要集成分析工具（如 Google Analytics）？**
   - 建议：根据具体插件需求决定，脚手架不包含

3. **是否需要自动化测试？**
   - 建议：初始版本不包含，可后续添加 Vitest + Testing Library

4. **是否需要支持 Firefox（WebExtensions）？**
   - 建议：专注 Chrome，Firefox 支持可作为未来增强

## Implementation Notes

### Vite 配置关键点
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: './src/manifest.json',
      watchFilePaths: ['src/**/*'],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
```

### Manifest V3 关键配置
```json
{
  "manifest_version": 3,
  "name": "Your Extension",
  "version": "1.0.0",
  "background": {
    "service_worker": "background/index.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/index.js"]
  }],
  "action": {
    "default_popup": "popup/index.html"
  }
}
```

### GitHub Actions 发布关键步骤
```yaml
- name: Upload to Chrome Web Store
  env:
    CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
    CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
    REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
    EXTENSION_ID: ${{ secrets.CHROME_EXTENSION_ID }}
  run: node scripts/upload-to-webstore.js
```
