# Change: Chrome 插件脚手架与 CI/CD 流水线

## Why

需要建立一个完整的 Chrome 插件开发环境，包括现代化的构建工具、开发体验优化、以及自动化的发布流程，以支持个人开发者快速迭代和发布插件到 Chrome Web Store。

## What Changes

- 搭建基于 TypeScript + React 的 Chrome 插件项目结构
- 配置 Vite 作为构建工具，提供快速的开发体验
- 实现 Manifest V3 规范的插件配置
- 建立 GitHub Actions CI/CD 流水线
- 实现自动化发布到 Chrome Web Store
- 配置代码质量检查（ESLint, Prettier）
- 添加开发环境热重载支持

## Impact

- Affected specs: `chrome-extension-scaffold`, `ci-cd-pipeline`
- Affected code: 全新项目，创建完整的项目结构
- 依赖: Node.js 18+, pnpm, Chrome Web Store Developer Account
