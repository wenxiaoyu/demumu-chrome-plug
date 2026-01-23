# M3：可视化增强（迭代 1.11 - 1.12）

## 目标

增强数据可视化，添加统计图表和完善样式动画，提升用户体验。

**里程碑价值：** 完整的数据可视化体验，禅意的视觉风格。

## 时间估算

**总计：2 天**

- 迭代 1.11：统计图表（1 天）
- 迭代 1.12：样式和动画（1 天）

## 范围

### 包含
- ✅ 统计图表（折线图、柱状图）
- ✅ 全局样式系统
- ✅ 禅意风格设计
- ✅ 基础动画效果

### 不包含
- ❌ 复杂的 3D 动画
- ❌ 音效
- ❌ 高级交互效果

## 详细设计

### 迭代 1.11：统计图表

#### 图表类型

**1. 连续活跃趋势图（折线图）**
- X 轴：日期
- Y 轴：连续天数
- 显示最近 30 天的趋势

**2. HP 变化曲线（折线图）**
- X 轴：日期
- Y 轴：HP 值
- 显示最近 30 天的 HP 变化
- 颜色根据 HP 状态变化

**3. 每日敲击趋势（柱状图）**
- X 轴：日期
- Y 轴：敲击次数
- 显示最近 30 天的敲击次数

**4. 功德值累计曲线（面积图）**
- X 轴：日期
- Y 轴：累计功德值
- 显示最近 30 天的功德值增长

#### 技术选型

**方案 1：使用图表库**
- Chart.js：轻量、简单
- ECharts：功能强大
- Recharts：React 友好

**方案 2：自己实现（推荐）**
- 使用 SVG
- 简单的折线图和柱状图
- 完全可控，体积小

#### SVG 实现示例

```typescript
interface ChartData {
  date: string;
  value: number;
}

function LineChart({ data, width, height }: {
  data: ChartData[];
  width: number;
  height: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const xStep = width / (data.length - 1);
  const yScale = height / maxValue;
  
  const points = data.map((d, i) => ({
    x: i * xStep,
    y: height - d.value * yScale
  }));
  
  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');
  
  return (
    <svg width={width} height={height}>
      <path d={pathD} stroke="#239a3b" fill="none" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#239a3b" />
      ))}
    </svg>
  );
}
```

#### 图表组件

```typescript
// StatsChart.tsx
export function StatsChart() {
  const [chartType, setChartType] = useState<'consecutive' | 'hp' | 'knocks' | 'merit'>('consecutive');
  const [data, setData] = useState<ChartData[]>([]);
  
  useEffect(() => {
    loadChartData(chartType);
  }, [chartType]);
  
  return (
    <div className="stats-chart">
      <div className="chart-tabs">
        <button onClick={() => setChartType('consecutive')}>连续活跃</button>
        <button onClick={() => setChartType('hp')}>HP 变化</button>
        <button onClick={() => setChartType('knocks')}>每日敲击</button>
        <button onClick={() => setChartType('merit')}>功德累计</button>
      </div>
      <div className="chart-container">
        {chartType === 'consecutive' && <LineChart data={data} />}
        {chartType === 'hp' && <LineChart data={data} />}
        {chartType === 'knocks' && <BarChart data={data} />}
        {chartType === 'merit' && <AreaChart data={data} />}
      </div>
    </div>
  );
}
```

### 迭代 1.12：样式和动画

#### 全局样式系统

**CSS 变量定义：**
```css
:root {
  /* 颜色 - 禅意配色 */
  --color-primary: #239a3b;      /* 主色 - 绿色 */
  --color-secondary: #7bc96f;    /* 辅助色 */
  --color-accent: #c6e48b;       /* 强调色 */
  --color-background: #f5f5f0;   /* 背景 - 米白色 */
  --color-surface: #ffffff;      /* 表面 */
  --color-text: #333333;         /* 文字 */
  --color-text-secondary: #666666; /* 次要文字 */
  --color-border: #e0e0e0;       /* 边框 */
  
  /* HP 颜色 */
  --color-hp-healthy: #239a3b;   /* 健康 */
  --color-hp-warning: #f59e0b;   /* 警告 */
  --color-hp-critical: #ef4444;  /* 危险 */
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 字体 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
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

#### 禅意风格设计

**设计原则：**
- 简洁：去除不必要的装饰
- 留白：充足的空间感
- 自然：使用自然色彩
- 平静：柔和的过渡和动画

**配色方案：**
- 主色：绿色系（生命、自然）
- 背景：米白色（纸张、平静）
- 文字：深灰色（不刺眼）
- 强调：木色、金色（木鱼、功德）

#### 动画效果

**1. 木鱼点击动画**
```css
.wooden-fish {
  transition: transform var(--transition-fast);
}

.wooden-fish:active {
  transform: scale(0.95);
}

.wooden-fish.knocked {
  animation: knock 300ms ease;
}

@keyframes knock {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

**2. HP 变化动画**
```css
.hp-bar-fill {
  transition: width var(--transition-normal),
              background-color var(--transition-normal);
}

.hp-value {
  animation: pulse 500ms ease;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**3. 功德值增加动画**
```css
.merit-value.increased {
  animation: merit-increase 500ms ease;
}

@keyframes merit-increase {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}
```

**4. 页面过渡动画**
```css
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity var(--transition-normal);
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity var(--transition-normal);
}
```

#### 响应式设计

**Popup 页面：**
- 固定宽度：360px
- 固定高度：600px
- 适配小屏幕

**Options 页面：**
- 最小宽度：768px
- 响应式布局
- 移动端友好

```css
/* Popup */
.popup {
  width: 360px;
  min-height: 500px;
  max-height: 600px;
  padding: var(--spacing-lg);
}

/* Options */
.options {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

@media (max-width: 768px) {
  .options {
    padding: var(--spacing-md);
  }
  
  .data-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 技术实现

### 项目结构扩展
```
src/
├── options/
│   └── components/
│       ├── StatsChart.tsx          # 统计图表（新增）
│       ├── LineChart.tsx           # 折线图（新增）
│       ├── BarChart.tsx            # 柱状图（新增）
│       └── AreaChart.tsx           # 面积图（新增）
├── shared/
│   └── styles/
│       ├── variables.css           # CSS 变量（新增）
│       ├── global.css              # 全局样式（新增）
│       └── animations.css          # 动画（新增）
```

## 验收标准

### 功能验收
- [ ] 统计图表正确显示
- [ ] 图表数据准确
- [ ] 图表可切换类型
- [ ] 样式统一美观
- [ ] 动画流畅自然

### 技术验收
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 无 Console 错误
- [ ] 性能良好

### 用户体验验收
- [ ] 视觉风格统一
- [ ] 禅意氛围浓厚
- [ ] 动画不过度
- [ ] 响应式布局正常

## 依赖

- M2：数据统计完成
- 每日统计数据

## 风险

### 技术风险
1. **图表性能**
   - 风险：大量数据点可能影响性能
   - 应对：限制数据点数量，使用简单图表

2. **动画性能**
   - 风险：过多动画可能卡顿
   - 应对：使用 CSS 动画，避免 JS 动画

## 下一步

完成 M3 后，进入 M4：测试和发布
- 全面测试
- 性能优化
- 文档完善
- 准备发布
