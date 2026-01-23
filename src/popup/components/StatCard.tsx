import { useEffect, useState } from 'react';
import './StatCard.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
}

/**
 * 格式化数字显示
 * 1000以下：直接显示
 * 1000-9999：显示千位分隔符 (1,234)
 * 10000-99999：显示为 1.2万
 * 100000以上：显示为 12.3万
 */
function formatNumber(value: number | string): string {
  if (typeof value === 'string') return value;
  
  if (value < 1000) {
    return value.toString();
  }
  
  if (value < 10000) {
    // 添加千位分隔符
    return value.toLocaleString('zh-CN');
  }
  
  // 万位显示
  const wan = value / 10000;
  if (wan < 10) {
    // 1.2万 格式
    return wan.toFixed(1) + '万';
  } else if (wan < 100) {
    // 12.3万 格式
    return wan.toFixed(1) + '万';
  } else if (wan < 1000) {
    // 123万 格式（整数）
    return Math.floor(wan) + '万';
  } else {
    // 1234万 -> 1234万
    return Math.floor(wan) + '万';
  }
}

/**
 * 底部数值显示组件
 */
export function StatCard({ icon, label, value, color = '#239a3b' }: StatCardProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevValue !== value && typeof value === 'number' && typeof prevValue === 'number') {
      if (value > prevValue) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
      setPrevValue(value);
    }
  }, [value, prevValue]);

  const displayValue = formatNumber(value);

  return (
    <div className={`stat-item ${isAnimating ? 'stat-animating' : ''}`}>
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-value" style={{ color }}>
        {displayValue}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
