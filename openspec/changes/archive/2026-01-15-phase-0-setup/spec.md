# 阶段 0：项目搭建

## 目标

搭建项目基础架构，配置开发环境，为后续开发做准备。

## 范围

### 包含
- ✅ 项目结构初始化
- ✅ 开发环境配置
- ✅ 基础 UI 框架
- ✅ 图标和资源准备
- ✅ OpenSpec 文档结构

### 不包含
- ❌ 业务逻辑实现
- ❌ 后端服务
- ❌ 复杂的 UI 组件

## 详细设计

### 1. 项目结构

```
alive-checker/
├── .github/workflows/      # CI/CD 流程
├── openspec/              # OpenSpec 文档
├── src/
│   ├── background/        # Background Service Worker
│   ├── popup/             # Popup 页面
│   ├── options/           # Options 页面
│   ├── content/           # Content Scripts
│   ├── shared/            # 共享代码
│   ├── icons/             # 图标
│   └── manifest.json      # 插件清单
├── docs/                  # 文档
├── scripts/               # 构建脚本
└── dist/                  # 构建输出
```

### 2. 基础类型定义

已创建：
- `src/shared/types.ts` - UserData, CheckInRecord, CheckInResult
- `src/shared/constants.ts` - STORAGE_KEYS, HP_CONFIG, NOTIFICATION_CONFIG
- `src/shared/storage.ts` - Storage 类封装

### 3. Manifest 配置

已更新 `src/manifest.json`：
- name: "还活着吗"
- permissions: storage, notifications, alarms

## 验收标准

### 环境配置
- [x] Node.js 和 pnpm 已安装
- [x] 依赖安装成功
- [x] TypeScript 配置正确
- [x] ESLint 配置正确
- [x] Vite 配置正确

### 项目结构
- [x] 目录结构创建完成
- [x] 基础文件创建完成
- [x] OpenSpec 文档结构创建完成

### 构建和运行
- [ ] `pnpm dev` 可以启动开发服务器
- [ ] `pnpm build` 可以成功构建
- [ ] `pnpm type-check` 类型检查通过
- [ ] `pnpm lint` 代码检查通过

### 插件加载
- [ ] 插件可以在 Chrome 中加载
- [ ] Popup 页面可以正常打开
- [ ] Options 页面可以正常打开
- [ ] 无 Console 错误

### 图标和资源
- [ ] 图标设计完成
- [ ] 图标文件放置正确
- [ ] 图标在插件中正常显示

### 文档
- [x] README.md 更新完成
- [x] OpenSpec 文档创建完成
- [ ] 开发指南创建完成

## 时间估算

**总计：1-2 天**

## 下一步

完成阶段 0 后，进入阶段 1：MVP 本地版
- 实现核心签到功能
- 实现生命值系统
- 实现数据可视化
