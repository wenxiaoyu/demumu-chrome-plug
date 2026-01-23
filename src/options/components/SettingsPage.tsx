import { useState, useEffect, useRef } from 'react';
import type { DeathDetectionConfig, EmailTemplateVariables, UserData } from '../../shared/types';
import { STORAGE_KEYS } from '../../shared/constants';
import { EmailPreview } from './EmailPreview';
import { LanguageSelector } from './LanguageSelector';
import { SyncStatus } from './SyncStatus';
import { t } from '../../shared/utils/i18n';
import './SettingsPage.css';

export function SettingsPage() {
  const [config, setConfig] = useState<DeathDetectionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVariables, setEmailVariables] = useState<EmailTemplateVariables | null>(null);
  
  // 用于防抖的临时状态
  const [tempInactivityThreshold, setTempInactivityThreshold] = useState<number | null>(null);
  const [tempHpThreshold, setTempHpThreshold] = useState<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // 加载配置和数据
  const loadData = async () => {
    try {
      setLoading(true);
      
      const configRes = await chrome.runtime.sendMessage({ type: 'GET_DEATH_CONFIG' });

      if (configRes.success) {
        setConfig(configRes.data);
      }

      // 加载用户数据用于邮件预览
      await loadEmailVariables();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载邮件预览变量
  const loadEmailVariables = async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.USER_DATA);
      const userData = result[STORAGE_KEYS.USER_DATA] as UserData;
      
      if (userData) {
        const now = Date.now();
        const lastActiveTime = userData.lastKnockTime;
        const diffMs = now - lastActiveTime;
        const inactiveDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        const formatDate = (timestamp: number) => {
          const date = new Date(timestamp);
          return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        };

        // 获取用户显示名称
        let userName = t('user'); // 默认值
        
        try {
          const { authService } = await import('../../shared/services/auth-service');
          const currentUser = authService.getCurrentUser();
          
          if (currentUser) {
            // 尝试从 Firestore 获取自定义显示名称
            try {
              const { firestoreService } = await import('../../shared/services/firestore-service');
              const firestoreUserData = await firestoreService.getUserData(currentUser.uid);
              
              if (firestoreUserData?.displayName) {
                userName = firestoreUserData.displayName;
              } else if (currentUser.displayName) {
                userName = currentUser.displayName;
              } else if (currentUser.email) {
                userName = currentUser.email.split('@')[0];
              }
            } catch (error) {
              console.error('[SettingsPage] Failed to load display name from Firestore:', error);
              // 使用 Google 账号名称作为后备
              if (currentUser.displayName) {
                userName = currentUser.displayName;
              } else if (currentUser.email) {
                userName = currentUser.email.split('@')[0];
              }
            }
          }
        } catch (error) {
          console.error('[SettingsPage] Failed to load user info:', error);
        }

        console.log('[SettingsPage] Using userName for email preview:', userName);

        setEmailVariables({
          userName,
          inactiveDays,
          lastActiveDate: formatDate(lastActiveTime),
          currentDate: formatDate(now),
          merit: userData.merit,
          hp: userData.hp,
        });
      }
    } catch (error) {
      console.error('Failed to load email variables:', error);
    }
  };

  useEffect(() => {
    loadData();
    
    // 清理函数：组件卸载时清除定时器
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 保存配置（防抖）
  const saveConfigDebounced = async (updates: Partial<DeathDetectionConfig>) => {
    if (!config) return;

    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 立即更新本地状态以提供即时反馈
    setConfig({ ...config, ...updates });

    // 延迟保存到后台
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        setSaving(true);
        const response = await chrome.runtime.sendMessage({
          type: 'UPDATE_DEATH_CONFIG',
          data: updates,
        });

        if (response.success) {
          setConfig(response.data);
          
          // 标记配置为待同步
          try {
            const { syncService } = await import('../../shared/services/sync-service');
            await syncService.markSettingsForSync();
          } catch (error) {
            console.error('[SettingsPage] Failed to mark settings for sync:', error);
          }
        }
      } catch (error) {
        console.error('Failed to save config:', error);
      } finally {
        setSaving(false);
      }
    }, 500); // 500ms 防抖延迟
  };

  // 发送测试邮件
  const sendTestEmail = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'TRIGGER_EMAIL_SEND',
      });

      if (response.success) {
        alert(t('testEmailSuccess'));
      } else {
        const errorMsg = response.error || t('unknownError');
        
        // 针对不同错误提供友好提示
        if (errorMsg.includes('No emergency contacts')) {
          alert(t('noContactsError'));
        } else {
          alert(t('sendFailedError', errorMsg));
        }
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      const errorMsg = error instanceof Error ? error.message : t('unknownError');
      
      if (errorMsg.includes('No emergency contacts')) {
        alert(t('noContactsError'));
      } else {
        alert(t('sendFailedError', errorMsg));
      }
    }
  };

  if (loading || !config) {
    return (
      <div className="settings-page">
        <div className="loading">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* 死亡检测配置 */}
      <div className="settings-section">
        <h2>{t('deathDetectionSettings')}</h2>
        <p className="settings-description">
          {t('deathDetectionDescription')}
        </p>

        <div className="setting-item">
          <div className="setting-label">
            <h3>{t('enableDeathDetection')}</h3>
            <p>{t('enableDeathDetectionDesc')}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => saveConfigDebounced({ enabled: e.target.checked })}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {config.enabled && (
          <>
            <div className="setting-item">
              <div className="setting-label">
                <h3>{t('inactivityThreshold')}</h3>
                <p>{t('inactivityThresholdDesc')}</p>
              </div>
              <div className="setting-control">
                <div className="segmented-control">
                  {[1, 2, 3].map((days) => (
                    <button
                      key={days}
                      className={`segment-button ${(tempInactivityThreshold ?? config.inactivityThreshold) === days ? 'active' : ''}`}
                      onClick={() => {
                        setTempInactivityThreshold(days);
                        saveConfigDebounced({ inactivityThreshold: days });
                      }}
                      disabled={saving}
                    >
                      {t('daysCount', String(days))}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <h3>{t('hpThreshold')}</h3>
                <p>{t('hpThresholdDesc')}</p>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tempHpThreshold ?? config.hpThreshold}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setTempHpThreshold(value);
                    saveConfigDebounced({ hpThreshold: value });
                  }}
                  disabled={saving}
                />
                <span className="setting-value">{tempHpThreshold ?? config.hpThreshold}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 语言选择器 */}
      <LanguageSelector />
      
      {/* 同步状态 */}
      <SyncStatus />

      {/* 邮件预览 */}
      {emailVariables && (
        <EmailPreview 
          variables={emailVariables} 
          onSendTest={sendTestEmail}
        />
      )}
    </div>
  );
}
