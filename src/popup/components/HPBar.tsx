import { getHPColor } from '../../shared/utils/hp-calculator';
import { HP_CONFIG } from '../../shared/constants';
import { t } from '../../shared/utils/i18n';
import './HPBar.css';

interface HPBarProps {
  hp: number;
  status: 'alive' | 'dead';
  consecutiveDays: number;
}


/**
 * HP 进度条组件（融合状态显示）
 */
export function HPBar({ hp, status, consecutiveDays }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (hp / HP_CONFIG.MAX) * 100));
  const color = getHPColor(hp);
  const isAlive = status === 'alive';
  
  // 根据生命值决定心跳速度
  const getHeartbeatSpeed = () => {
    if (hp > 60) return '2s'; // 健康：慢心跳
    if (hp > 30) return '1.5s'; // 警告：中等心跳
    return '1s'; // 危险：快心跳
  };

  return (
    <div className={`hp-card ${isAlive ? 'hp-card-alive' : 'hp-card-dead'}`}>
      {/* 状态头部 */}
      <div className="hp-card-header">
        <div className="hp-status">
          <span className="hp-status-icon">{isAlive ? '😊' : '💀'}</span>
          <span className="hp-status-text">{isAlive ? t('hp_alive') : t('hp_dead')}</span>
        </div>
        {isAlive && consecutiveDays > 0 && (
          <div className="hp-streak">
            <span className="hp-streak-icon">🔥</span>
            <span className="hp-streak-text">{consecutiveDays}</span>
          </div>
        )}
      </div>

      {/* HP条 */}
      <div className="hp-bar-section">
        <div className="hp-bar-label-row">
          <span className="hp-bar-label">{t('hp_label')}</span>
          <span className="hp-bar-value" style={{ color }}>
            {hp}/{HP_CONFIG.MAX}
          </span>
        </div>
        <div className="hp-bar-track">
          <div
            className="hp-bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              animationDuration: isAlive ? getHeartbeatSpeed() : 'none',
            }}
          >
            <div className="hp-bar-shine"></div>
            {isAlive && <div className="hp-bar-heartbeat"></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
