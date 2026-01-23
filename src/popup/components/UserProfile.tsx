/**
 * 用户信息组件
 */

import { useState, useEffect } from 'react';
import { t } from '../../shared/utils/i18n';
import type { User } from '../../shared/types/auth';
import './UserProfile.css';

interface UserProfileProps {
  user: User;
  onSignOut?: () => void;
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    // TODO: 从同步服务获取最后同步时间
    setLastSyncTime(t('notSynced'));
  }, []);

  const handleSignOut = async () => {
    if (!confirm(t('confirmSignOut'))) {
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({ type: 'SIGN_OUT' });
      if (response.success) {
        onSignOut?.();
      }
    } catch (err) {
      console.error('[UserProfile] Sign out error:', err);
    }
  };

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile">
        <div className="user-avatar-wrapper">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || t('user')}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="sync-status-indicator" title={lastSyncTime}>
            ☁️
          </div>
        </div>

        <div className="user-info">
          <div className="user-name">
            {user.displayName || t('user')}
          </div>
          <div className="user-email">
            {user.email}
          </div>
        </div>

        <button
          className="user-menu-button"
          onClick={() => setShowMenu(!showMenu)}
          title={t('menu')}
        >
          ⋮
        </button>

        {showMenu && (
          <>
            <div 
              className="menu-overlay" 
              onClick={() => setShowMenu(false)}
            />
            <div className="user-menu">
              <button 
                className="menu-item"
                onClick={() => {
                  setShowMenu(false);
                  openSettings();
                }}
              >
                ⚙️ {t('accountSettings')}
              </button>
              <button 
                className="menu-item menu-item-danger"
                onClick={() => {
                  setShowMenu(false);
                  handleSignOut();
                }}
              >
                🚪 {t('signOut')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
