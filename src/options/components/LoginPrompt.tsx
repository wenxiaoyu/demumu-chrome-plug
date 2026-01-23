/**
 * 登录提示对话框组件
 * 在添加紧急联系人时提示用户登录
 */

import { useState } from 'react';
import { t } from '../../shared/utils/i18n';
import './LoginPrompt.css';

interface LoginPromptProps {
  onLogin: () => Promise<void>;
  onSkip: () => void;
  onCancel: () => void;
}

export function LoginPrompt({ onLogin, onSkip, onCancel }: LoginPromptProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error('[LoginPrompt] Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-modal">
        <div className="prompt-icon">💡</div>
        <h3 className="prompt-title">{t('loginPrompt_title')}</h3>
        <p className="prompt-message">{t('loginPrompt_message')}</p>
        
        <div className="prompt-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">📧</span>
            <span className="benefit-text">{t('loginPrompt_benefit1')}</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">☁️</span>
            <span className="benefit-text">{t('loginPrompt_benefit2')}</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔄</span>
            <span className="benefit-text">{t('loginPrompt_benefit3')}</span>
          </div>
        </div>

        <div className="prompt-actions">
          <button
            className="btn-login"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner">⏳</span>
                {t('loggingIn')}
              </>
            ) : (
              <>
                <span className="btn-icon">🔐</span>
                {t('loginWithGoogle')}
              </>
            )}
          </button>
          <button
            className="btn-skip"
            onClick={onSkip}
            disabled={loading}
          >
            {t('loginPrompt_skip')}
          </button>
          <button
            className="btn-cancel-prompt"
            onClick={onCancel}
            disabled={loading}
          >
            {t('cancel')}
          </button>
        </div>

        <p className="prompt-note">{t('loginPrompt_note')}</p>
      </div>
    </div>
  );
}
