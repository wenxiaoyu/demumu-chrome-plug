# 恢复 Google 登录和同步功能 - 任务清单

## 任务列表

- [ ] 1. 恢复 Popup.tsx 认证代码
  - [ ] 1.1 取消注释 LoginButton、UserProfile、AuthState 的 import
  - [ ] 1.2 取消注释认证状态管理和登录 UI 渲染

- [ ] 2. 恢复 AccountSettings.tsx 完整功能
  - [ ] 2.1 用 RESTORE_AUTH_GUIDE.md 中记录的完整实现替换占位代码

- [ ] 3. 清理临时资源
  - [ ] 3.1 从 zh_CN/messages.json 删除临时翻译键
  - [ ] 3.2 从 translate-en.js 删除对应英文翻译
  - [ ] 3.3 运行翻译脚本重新生成英文翻译文件
  - [ ] 3.4 从 AccountSettings.css 删除临时 CSS 样式

- [ ] 4. 构建验证
  - [ ] 4.1 运行 npm run build 验证构建成功
  - [ ] 4.2 最终检查点

## 完成标准

- [ ] Popup 页面显示登录按钮/用户信息
- [ ] AccountSettings 显示完整功能
- [ ] 临时翻译键和 CSS 已清理
- [ ] 构建成功无错误
