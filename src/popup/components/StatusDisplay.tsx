import './StatusDisplay.css';

interface StatusDisplayProps {
  status: 'alive' | 'dead';
  consecutiveDays: number;
}

/**
 * 状态显示组件
 */
export function StatusDisplay({ status, consecutiveDays }: StatusDisplayProps) {
  const isAlive = status === 'alive';

  return (
    <div className="status-display">
      <div className="status-main">
        <span className="status-icon">{isAlive ? '😊' : '💀'}</span>
        <span className="status-text">{isAlive ? '存活中' : '已往生'}</span>
      </div>
      {isAlive && consecutiveDays > 0 && (
        <div className="status-streak">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">连续 {consecutiveDays} 天</span>
        </div>
      )}
    </div>
  );
}
