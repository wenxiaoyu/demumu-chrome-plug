# 跨日重置 Bug 修复

**问题编号**: BUG-001  
**发现日期**: 2026-01-22  
**修复日期**: 2026-01-22  
**严重程度**: P1（重要功能受影响）  
**状态**: ✅ 已修复

---

## 问题描述

### 现象
改变系统时间后，需要重启浏览器，今日敲击次数才会重置为 0。

### 复现步骤
1. 打开 Popup，敲击木鱼若干次（例如 5 次）
2. 记录今日敲击次数 = 5
3. 修改系统时间到明天
4. 重新打开 Popup
5. **问题**：今日敲击次数仍然显示 5，而不是 0

### 预期行为
修改系统时间到明天后，重新打开 Popup，今日敲击次数应该自动重置为 0。

---

## 根本原因

在 `src/popup/hooks/useKnock.ts` 的 `loadUserData` 函数中，只检查了 HP 的变化（时间惩罚），但没有检查是否跨日需要重置 `todayKnocks`。

### 问题代码
```typescript
// 只检查 HP 变化
if (actualHP !== data.hp) {
  data = {
    ...data,
    hp: actualHP,
    status: actualHP > 0 ? 'alive' : 'dead',
  };
  await storage.set(STORAGE_KEYS.USER_DATA, data);
}
```

---

## 解决方案

### 修复代码
在加载用户数据时，增加跨日检查逻辑：

```typescript
// 计算当前实际 HP（考虑时间惩罚）
const now = Date.now();
const actualHP = calculateCurrentHP(data.lastKnockTime, data.hp, now);

// 检查是否跨日（需要重置今日敲击次数）
const isToday = isSameDay(data.lastKnockTime, now);
const needsReset = !isToday && data.lastKnockTime > 0;

// 如果 HP 有变化或需要重置今日敲击，更新数据
if (actualHP !== data.hp || needsReset) {
  data = {
    ...data,
    hp: actualHP,
    status: actualHP > 0 ? 'alive' : 'dead',
    todayKnocks: needsReset ? 0 : data.todayKnocks, // 跨日重置
  };
  await storage.set(STORAGE_KEYS.USER_DATA, data);
  
  if (needsReset) {
    console.log('[useKnock] Day changed, reset todayKnocks to 0');
  }
}
```

### 修复逻辑
1. 使用 `isSameDay()` 函数检查 `lastKnockTime` 和当前时间是否在同一天
2. 如果不在同一天且 `lastKnockTime > 0`（已有敲击记录），则需要重置
3. 重置时将 `todayKnocks` 设为 0
4. 同时更新 HP 和状态

---

## 测试验证

### 测试用例 1: 跨日重置
**步骤**:
1. 清空数据：`chrome.storage.local.clear()`
2. 打开 Popup，敲击 5 次
3. 记录：`todayKnocks = 5`
4. 修改系统时间到明天
5. 重新打开 Popup

**预期结果**:
- `todayKnocks = 0` ✅
- `totalKnocks = 5` ✅
- `hp = 90`（-10 惩罚）✅
- Console 输出：`[useKnock] Day changed, reset todayKnocks to 0` ✅

### 测试用例 2: 同一天不重置
**步骤**:
1. 打开 Popup，敲击 3 次
2. 记录：`todayKnocks = 3`
3. 关闭 Popup
4. 重新打开 Popup（不改变时间）

**预期结果**:
- `todayKnocks = 3`（保持不变）✅
- 无重置日志输出 ✅

### 测试用例 3: 首次使用不重置
**步骤**:
1. 清空数据：`chrome.storage.local.clear()`
2. 打开 Popup（从未敲击过）

**预期结果**:
- `todayKnocks = 0` ✅
- `lastKnockTime = 0` ✅
- 不触发重置逻辑 ✅

### 测试用例 4: 跨多天重置
**步骤**:
1. 打开 Popup，敲击 10 次
2. 记录：`todayKnocks = 10`
3. 修改系统时间到 3 天后
4. 重新打开 Popup

**预期结果**:
- `todayKnocks = 0` ✅
- `hp = 70`（-30 惩罚）✅
- `consecutiveDays = 0`（连续天数重置）✅

---

## 测试脚本

### 快速测试脚本
在浏览器 Console 中执行：

```javascript
// 1. 设置测试数据（昨天敲击了 5 次）
const yesterday = Date.now() - (24 * 60 * 60 * 1000);
chrome.storage.local.set({
  userData: {
    userId: 'test-user',
    lastKnockTime: yesterday,
    todayKnocks: 5,
    totalKnocks: 5,
    merit: 10,
    consecutiveDays: 1,
    combo: 0,
    hp: 100,
    status: 'alive',
    createdAt: yesterday,
    updatedAt: yesterday,
  }
}, () => {
  console.log('✅ Test data set (yesterday, 5 knocks)');
  console.log('📝 Now reload the popup to test day reset');
});

// 2. 重新加载 Popup 后，检查数据
chrome.storage.local.get('userData', (result) => {
  const data = result.userData;
  console.log('📊 Current data:', {
    todayKnocks: data.todayKnocks, // 应该是 0
    totalKnocks: data.totalKnocks, // 应该是 5
    hp: data.hp, // 应该是 90
  });
  
  if (data.todayKnocks === 0) {
    console.log('✅ PASS: todayKnocks reset to 0');
  } else {
    console.error('❌ FAIL: todayKnocks not reset:', data.todayKnocks);
  }
});
```

---

## 影响范围

### 受影响的功能
- ✅ 今日敲击次数显示
- ✅ 跨日数据重置
- ✅ HP 时间惩罚计算

### 不受影响的功能
- ✅ 总敲击次数（正常累加）
- ✅ 功德值计算
- ✅ 连续天数计算
- ✅ 数据持久化

---

## 相关文件

- `src/popup/hooks/useKnock.ts` - 主要修复文件
- `src/shared/utils/date.ts` - 日期工具函数
- `src/shared/utils/hp-calculator.ts` - HP 计算逻辑

---

## 后续改进建议

### 1. 添加单元测试
为 `useKnock` Hook 添加单元测试，覆盖跨日场景：
```typescript
describe('useKnock - Day Reset', () => {
  it('should reset todayKnocks when day changes', async () => {
    // 测试逻辑
  });
  
  it('should not reset todayKnocks on same day', async () => {
    // 测试逻辑
  });
});
```

### 2. 添加日志监控
在生产环境中监控跨日重置的执行情况：
```typescript
if (needsReset) {
  console.log('[useKnock] Day changed, reset todayKnocks to 0', {
    lastKnockTime: new Date(data.lastKnockTime).toISOString(),
    now: new Date(now).toISOString(),
    oldTodayKnocks: data.todayKnocks,
  });
}
```

### 3. 考虑时区问题
当前实现使用本地时间，在跨时区使用时可能有问题。建议：
- 使用 UTC 时间进行日期比较
- 或者明确使用用户本地时区

---

## 验收标准

- [x] 修改系统时间到明天，重新打开 Popup，今日敲击次数自动重置为 0
- [x] 同一天内多次打开 Popup，今日敲击次数保持不变
- [x] 首次使用时不触发重置逻辑
- [x] 跨多天时正确重置并计算 HP 惩罚
- [x] 总敲击次数不受影响
- [x] 添加 Console 日志便于调试

---

**修复完成时间**: 2026-01-22  
**修复人员**: AI 助手  
**审核状态**: ✅ 已验证

