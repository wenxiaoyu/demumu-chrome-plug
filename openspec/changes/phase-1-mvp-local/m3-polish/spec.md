# M3：优化和完善（迭代 1.11 - 1.12）

## 目标

完善现有功能，优化用户体验，修复已知问题，为发布做准备。

**里程碑价值：** 打磨产品细节，提升整体质量。

## 时间估算

**总计：1 天**

- 迭代 1.11：功能完善（0.5 天）
- 迭代 1.12：体验优化（0.5 天）

## 范围

### 包含
- ✅ 全局样式系统（CSS 变量）
- ✅ 错误处理优化
- ✅ 加载状态优化
- ✅ 用户引导优化
- ✅ 细节打磨

### 不包含
- ❌ 统计图表（折线图、柱状图）
- ❌ 复杂动画效果
- ❌ 新功能开发

## 详细设计

### 迭代 1.11：功能完善

#### 1. 全局样式系统

**目标**：统一管理样式，提升代码质量

**CSS 变量定义：**
```css
/* src/shared/styles/variables.css */
:root {
  /* 颜色 - 禅意配色 */
  --color-primary: #239a3b;
  --color-secondary: #7bc96f;
  --color-accent: #c6e48b;
  --color-background: #f8f5ed;
  --color-surface: #ffffff;
  --color-text: #4a4035;
  --color-text-secondary: #8b7355;
  --color-border: rgba(139, 115, 85, 0.1);
  
  /* HP 颜色 */
  --color-hp-healthy: #239a3b;
  --color-hp-warning: #f59e0b;
  --color-hp-critical: #ef4444;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

**应用方式**：
- 在现有组件中逐步替换硬编码的颜色和尺寸
- 保持现有视觉效果不变
- 提升代码可维护性

#### 2. 错误处理优化

**当前问题**：
- 数据加载失败时用户体验不好
- 没有统一的错误提示

**优化方案**：
```typescript
// 创建统一的错误处理组件
function ErrorMessage({ message, onRetry }: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry}>重试</button>
      )}
    </div>
  );
}

// 在各个组件中使用
function StatsPage() {
  const [error, setError] = useState<string | null>(null);
  
  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }
  
  // ...
}
```

#### 3. 加载状态优化

**当前问题**：
- 加载状态显示简单
- 没有骨架屏

**优化方案**：
```typescript
// 创建加载组件
function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>加载中...</p>
    </div>
  );
}

// 创建骨架屏（可选）
function StatsSkeleton() {
  return (
    <div className="stats-skeleton">
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
    </div>
  );
}
```

#### 4. 首次使用引导

**目标**：帮助新用户快速上手

**方案**：
```typescript
// 检测是否首次使用
function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState(false);
  
  useEffect(() => {
    const checkFirstTime = async () => {
      const userData = await storage.get(STORAGE_KEYS.USER_DATA);
      if (!userData || userData.totalKnocks === 0) {
        setIsFirstTime(true);
      }
    };
    checkFirstTime();
  }, []);
  
  return isFirstTime;
}

// 显示引导提示
function WelcomeGuide() {
  return (
    <div className="welcome-guide">
      <h2>欢迎使用"还活着吗"！</h2>
      <p>点击木鱼，获得功德，保持活跃 🙏</p>
      <ul>
        <li>每天首次敲击可恢复 10 HP</li>
        <li>每天不敲击会扣除 10 HP</li>
        <li>HP 归零就"往生"了...</li>
      </ul>
      <button>开始敲木鱼</button>
    </div>
  );
}
```

### 迭代 1.12：体验优化

#### 1. 数字格式化统一

**当前问题**：
- 不同地方的数字格式不统一

**优化方案**：
```typescript
// 统一的数字格式化工具
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  }
  return num.toLocaleString('zh-CN');
}

// 在所有地方使用
<div className="merit-value">{formatNumber(userData.merit)}</div>
```

#### 2. 日期显示优化

**当前问题**：
- 日期显示不够友好

**优化方案**：
```typescript
// 相对时间显示
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return formatDate(timestamp, 'YYYY-MM-DD');
}
```

#### 3. 空状态优化

**当前问题**：
- 没有数据时显示空白

**优化方案**：
```typescript
// 空状态组件
function EmptyState({ icon, message, action }: {
  icon: string;
  message: string;
  action?: { text: string; onClick: () => void };
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-message">{message}</p>
      {action && (
        <button onClick={action.onClick}>{action.text}</button>
      )}
    </div>
  );
}

// 使用示例
{calendarData.length === 0 && (
  <EmptyState
    icon="📅"
    message="还没有敲击记录，快去敲木鱼吧！"
    action={{ text: '去敲木鱼', onClick: () => window.close() }}
  />
)}
```

#### 4. 响应式优化

**当前问题**：
- 部分页面在小屏幕上显示不佳

**优化方案**：
- 检查所有页面的响应式
- 优化移动端显示
- 确保关键信息可见

#### 5. 性能优化

**优化点**：
```typescript
// 1. 使用 React.memo 避免不必要的重渲染
export const StatCard = React.memo(function StatCard({ ... }) {
  // ...
});

// 2. 使用 useMemo 缓存计算结果
const calendarData = useMemo(() => {
  return generateCalendarData(year, month, stats);
}, [year, month, stats]);

// 3. 使用 useCallback 缓存函数
const handleKnock = useCallback(() => {
  // ...
}, [userData]);
```

#### 6. 细节打磨

**优化清单**：
- [ ] 统一所有按钮样式
- [ ] 统一所有卡片样式
- [ ] 统一所有间距
- [ ] 检查所有文案
- [ ] 检查所有图标
- [ ] 优化所有动画时长
- [ ] 添加适当的过渡效果

## 技术实现

### 项目结构扩展
```
src/
├── shared/
│   ├── styles/
│   │   ├── variables.css       # CSS 变量（新增）
│   │   └── global.css          # 全局样式（新增）
│   ├── components/
│   │   ├── LoadingSpinner.tsx  # 加载组件（新增）
│   │   ├── ErrorMessage.tsx    # 错误组件（新增）
│   │   └── EmptyState.tsx      # 空状态组件（新增）
│   └── utils/
│       └── format.ts           # 格式化工具（新增）
```

## 验收标准

### 功能验收
- [ ] CSS 变量系统应用完成
- [ ] 错误处理统一
- [ ] 加载状态优化
- [ ] 首次使用引导完成
- [ ] 数字格式化统一
- [ ] 空状态显示正常

### 技术验收
- [ ] TypeScript 类型检查通过
- [ ] 构建成功无错误
- [ ] 无 Console 错误
- [ ] 性能良好

### 用户体验验收
- [ ] 样式统一美观
- [ ] 错误提示友好
- [ ] 加载体验流畅
- [ ] 响应式正常
- [ ] 细节打磨到位

## 依赖

- M1：核心功能完成
- M2：数据统计完成

## 风险

### 技术风险
1. **样式重构风险**
   - 风险：替换 CSS 变量可能影响现有样式
   - 应对：逐步替换，充分测试

2. **性能优化风险**
   - 风险：过度优化可能引入 bug
   - 应对：谨慎优化，保持简单

## 下一步

完成 M3 后，进入 M4：测试和发布
- 全面测试
- Bug 修复
- 文档完善
- 准备发布
