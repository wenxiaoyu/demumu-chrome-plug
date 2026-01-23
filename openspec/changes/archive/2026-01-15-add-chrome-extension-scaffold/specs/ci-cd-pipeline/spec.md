## ADDED Requirements

### Requirement: GitHub Actions CI 流水线

系统 SHALL 提供自动化的持续集成流水线。

#### Scenario: 代码推送触发

- **WHEN** 开发者推送代码到 GitHub
- **THEN** GitHub Actions SHALL 自动触发 CI 流水线
- **AND** 流水线 SHALL 安装依赖并执行构建
- **AND** 流水线 SHALL 运行代码质量检查（lint, type-check）
- **AND** 流水线 SHALL 运行测试（如果存在）

#### Scenario: Pull Request 检查

- **WHEN** 创建或更新 Pull Request
- **THEN** CI 流水线 SHALL 自动运行
- **AND** 检查结果 SHALL 显示在 PR 页面
- **AND** 所有检查通过后才允许合并

### Requirement: 自动发布到 Chrome Web Store

系统 SHALL 支持自动化发布插件到 Chrome Web Store。

#### Scenario: 版本标签触发发布

- **WHEN** 开发者推送版本标签（如 v1.0.0）
- **THEN** GitHub Actions SHALL 触发发布流水线
- **AND** 系统 SHALL 构建生产版本
- **AND** 系统 SHALL 创建 zip 包
- **AND** 系统 SHALL 使用 Chrome Web Store API 上传新版本

#### Scenario: 发布凭证管理

- **WHEN** 发布流水线需要访问 Chrome Web Store
- **THEN** 系统 SHALL 使用 GitHub Secrets 存储敏感信息
- **AND** 必需的凭证包括：CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EXTENSION_ID
- **AND** 凭证 SHALL 不出现在代码仓库中

#### Scenario: 发布状态通知

- **WHEN** 发布流程完成
- **THEN** 系统 SHALL 创建 GitHub Release
- **AND** Release SHALL 包含版本说明和构建产物
- **AND** 发布失败时 SHALL 在 Actions 页面显示错误信息

### Requirement: 版本管理

系统 SHALL 自动管理版本号和变更日志。

#### Scenario: 版本号同步

- **WHEN** 开发者更新版本号
- **THEN** package.json 和 manifest.json 的版本号 SHALL 保持一致
- **AND** 版本号 SHALL 遵循语义化版本规范（Semantic Versioning）

#### Scenario: 变更日志生成

- **WHEN** 创建新版本发布
- **THEN** 系统 SHOULD 生成或更新 CHANGELOG.md
- **AND** 变更日志 SHOULD 包含该版本的主要变更

### Requirement: 构建产物管理

系统 SHALL 正确管理构建产物和发布包。

#### Scenario: 构建产物结构

- **WHEN** 执行生产构建
- **THEN** dist 目录 SHALL 包含所有必需文件
- **AND** 文件结构 SHALL 符合 Chrome 插件规范
- **AND** 不必要的开发文件 SHALL 被排除

#### Scenario: Zip 包创建

- **WHEN** 准备发布
- **THEN** 系统 SHALL 创建包含所有必需文件的 zip 包
- **AND** zip 包大小 SHALL 符合 Chrome Web Store 限制（< 100MB）
- **AND** zip 包 SHALL 不包含源代码和开发依赖
