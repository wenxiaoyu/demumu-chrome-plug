# Implementation Tasks: Chrome 插件脚手架与 CI/CD

## 1. 项目初始化与基础配置

- [x] 1.1 初始化 pnpm 项目并配置 package.json
  - 设置项目名称、版本、脚本命令
  - 配置 type: "module"
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

- [x] 1.2 安装核心依赖
  - TypeScript, React, React-DOM
  - Vite 及相关插件（@vitejs/plugin-react, vite-plugin-web-extension）
  - Chrome types (@types/chrome)
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

- [x] 1.3 配置 TypeScript (tsconfig.json)
  - 启用严格模式
  - 配置路径别名
  - 包含 Chrome API 类型定义
  - _Requirements: chrome-extension-scaffold/开发体验优化_

- [x] 1.4 配置 Vite (vite.config.ts)
  - 配置 React 插件
  - 配置 web-extension 插件
  - 设置构建输出目录
  - 配置开发服务器
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

## 2. Chrome 插件核心文件

- [x] 2.1 创建 manifest.json
  - 配置 Manifest V3 基础字段
  - 声明权限（storage, tabs 等）
  - 配置 background service worker
  - 配置 content scripts
  - 配置 popup 和 options 页面
  - _Requirements: chrome-extension-scaffold/Manifest V3 配置_

- [x] 2.2 实现 Popup 页面
  - 创建 src/popup/index.html
  - 创建 src/popup/Popup.tsx React 组件
  - 创建 src/popup/main.tsx 入口文件
  - 添加基础样式
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

- [x] 2.3 实现 Background Service Worker
  - 创建 src/background/index.ts
  - 实现基础的消息监听
  - 实现插件安装/更新处理
  - _Requirements: chrome-extension-scaffold/Manifest V3 配置_

- [x] 2.4 实现 Content Script
  - 创建 src/content/index.ts
  - 实现与 background 的消息通信
  - 添加基础的页面交互示例
  - _Requirements: chrome-extension-scaffold/Manifest V3 配置_

- [x] 2.5 创建 Options 页面（可选）
  - 创建 src/options/index.html
  - 创建 src/options/Options.tsx
  - 实现设置保存/读取功能
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

## 3. 代码质量工具配置

- [x] 3.1 配置 ESLint
  - 安装 ESLint 及相关插件
  - 创建 eslint.config.js 配置文件（ESLint 9 flat config）
  - 配置 React 和 TypeScript 规则
  - _Requirements: chrome-extension-scaffold/代码质量工具_

- [x] 3.2 配置 Prettier
  - 安装 Prettier
  - 创建 .prettierrc 配置文件
  - 创建 .prettierignore
  - _Requirements: chrome-extension-scaffold/代码质量工具_

- [x] 3.3 配置 Git Hooks (Husky + lint-staged)
  - 安装 husky 和 lint-staged
  - 配置 pre-commit hook
  - 配置 lint-staged 规则
  - _Requirements: chrome-extension-scaffold/代码质量工具_

- [x] 3.4 添加 package.json 脚本
  - lint: 运行 ESLint
  - format: 运行 Prettier
  - type-check: 运行 TypeScript 检查
  - _Requirements: chrome-extension-scaffold/代码质量工具_

## 4. GitHub Actions CI/CD 配置

- [x] 4.1 创建 CI 工作流 (.github/workflows/ci.yml)
  - 配置触发条件（push, pull_request）
  - 设置 Node.js 环境
  - 安装 pnpm 和依赖
  - 运行 lint, type-check, build
  - _Requirements: ci-cd-pipeline/GitHub Actions CI 流水线_

- [x] 4.2 创建发布工作流 (.github/workflows/release.yml)
  - 配置标签触发（tags: v\*）
  - 执行生产构建
  - 创建 zip 包
  - 上传到 Chrome Web Store
  - 创建 GitHub Release
  - _Requirements: ci-cd-pipeline/自动发布到 Chrome Web Store_

- [x] 4.3 配置 Chrome Web Store 发布脚本
  - 创建 scripts/upload-to-webstore.js
  - 使用 chrome-webstore-upload 包
  - 处理认证和上传逻辑
  - _Requirements: ci-cd-pipeline/自动发布到 Chrome Web Store_

- [x] 4.4 创建 GitHub Secrets 配置文档
  - 文档说明需要配置的 secrets
  - CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EXTENSION_ID
  - 提供获取这些凭证的步骤说明
  - _Requirements: ci-cd-pipeline/发布凭证管理_

## 5. 项目文档与配置

- [x] 5.1 创建 README.md
  - 项目介绍
  - 开发环境设置
  - 构建和发布流程
  - 贡献指南
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

- [x] 5.2 创建 .gitignore
  - 忽略 node_modules, dist
  - 忽略 IDE 配置文件
  - 忽略环境变量文件
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

- [x] 5.3 创建 .env.example
  - 示例环境变量配置
  - 开发环境配置说明
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

- [x] 5.4 更新 openspec/project.md
  - 填写项目目的和技术栈
  - 记录架构决策
  - 文档化约定和规范
  - _Requirements: chrome-extension-scaffold/项目结构与构建系统_

## 6. 测试与验证

- [x] 6.1 本地开发测试
  - 运行 `pnpm dev` 验证开发环境
  - 在 Chrome 中加载插件
  - 测试 popup, background, content script 功能
  - _Requirements: chrome-extension-scaffold/开发环境启动_

- [x] 6.2 生产构建测试
  - 运行 `pnpm build` 验证生产构建
  - 检查 dist 目录结构
  - 验证 zip 包内容
  - _Requirements: chrome-extension-scaffold/生产构建, ci-cd-pipeline/构建产物管理_

- [ ] 6.3 CI/CD 流水线测试
  - 推送代码触发 CI
  - 验证所有检查通过
  - 创建测试标签验证发布流程（可选）
  - _Requirements: ci-cd-pipeline/GitHub Actions CI 流水线_
