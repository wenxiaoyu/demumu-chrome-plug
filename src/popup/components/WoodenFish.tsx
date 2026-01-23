import { useState } from 'react';
import './WoodenFish.css';
import woodenFishIcon from '../../icons/wooden-fish.svg';
import woodenStickIcon from '../../icons/wooden-stick.svg';

interface WoodenFishProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * 木鱼组件 - 使用真实木鱼图标
 */
export function WoodenFish({ onClick, disabled = false }: WoodenFishProps) {
  const [isKnocking, setIsKnocking] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);

  const handleClick = () => {
    if (disabled || isKnocking) return;

    // 触发木鱼棍敲击动画
    setIsKnocking(true);

    // 延迟140ms后触发撞击效果（木鱼棍敲到木鱼的时刻）
    setTimeout(() => {
      setShowImpact(true);
      
      // 生成涟漪效果
      const rippleId = Date.now();
      setRipples([...ripples, { id: rippleId }]);

      // 调用父组件的 onClick
      onClick();

      // 移除涟漪
      setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== rippleId));
      }, 1000);
    }, 140);

    // 重置动画状态
    setTimeout(() => {
      setIsKnocking(false);
      setShowImpact(false);
    }, 400);
  };

  return (
    <div className="wooden-fish-container">
      <div className="wooden-fish-scene">
        {/* 背景光晕 */}
        <div className={`fish-glow ${showImpact ? 'active' : ''}`}></div>

        {/* 涟漪效果 */}
        {ripples.map((ripple) => (
          <div key={ripple.id} className="ripple-effect"></div>
        ))}

        {/* 木鱼棍 */}
        <div className={`wooden-stick ${isKnocking ? 'knocking' : ''}`}>
          <img 
            src={woodenStickIcon} 
            alt="木鱼棍" 
            className="wooden-stick-icon"
          />
        </div>

        {/* 木鱼主体 */}
        <button
          className={`wooden-fish-button ${showImpact ? 'knocking' : ''}`}
          onClick={handleClick}
          disabled={disabled}
          aria-label="敲木鱼"
        >
          <img 
            src={woodenFishIcon} 
            alt="木鱼" 
            className="wooden-fish-icon"
          />
        </button>
      </div>
    </div>
  );
}
