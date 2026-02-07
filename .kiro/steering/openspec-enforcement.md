---
inclusion: always
---

# OpenSpec 强制规则

## 核心规则

**所有涉及新功能开发、架构变更、重大重构的工作，必须通过 OpenSpec 流程管理。不允许跳过。**

## 何时必须使用 OpenSpec

以下场景必须先创建 OpenSpec change，再进行实现：

1. 新增功能或能力
2. 修改现有功能的行为
3. 架构调整或技术迁移
4. 跨多个文件的重构
5. 涉及数据模型变更的工作

## 何时可以跳过

以下场景可以直接修改代码，无需 OpenSpec：

1. 单文件 bug 修复（< 20 行改动）
2. 文档更新
3. 依赖版本升级
4. 代码格式化 / lint 修复
5. 翻译文本更新

## 工作流程

1. 用户描述需求时，先用 `/opsx:ff` 或 `/opsx:new` 创建 change
2. 按 proposal → specs → design → tasks 顺序创建 artifacts
3. 用 `/opsx:apply` 执行实现
4. 完成后用 `/opsx:archive` 归档

## 禁止行为

- 禁止在没有 OpenSpec change 的情况下直接编写新功能代码
- 禁止跳过 specs 或 design 直接写 tasks
- 如果用户要求直接写代码实现新功能，应提醒先创建 OpenSpec change

## 参考

- OpenSpec CLI 文档：`openspec/AGENTS.md`
- 项目配置：`openspec/config.yaml`
- 活跃变更：运行 `openspec list` 查看
