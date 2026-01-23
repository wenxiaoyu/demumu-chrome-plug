import './popup.css';
import { WoodenFish } from './components/WoodenFish';
import { HPBar } from './components/HPBar';
import { StatCard } from './components/StatCard';
import { LoginButton } from './components/LoginButton';
import { UserProfile } from './components/UserProfile';
import { useKnock } from './hooks/useKnock';
import { t, initLanguage } from '../shared/utils/i18n';
import { useEffect, useState } from 'react';
import type { AuthState } from '../shared/types/auth';

function Popup() {
  const { userData, loading, knock } = useKnock();
  const [langReady, setLangReady] = useState(false);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 初始化语言
  useEffect(() => {
    initLanguage().then(() => setLangReady(true));
  }, []);

  // 加载认证状态
  useEffect(() => {
    loadAuthState();

    // 监听认证状态变化
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authState) {
        setAuthState(changes.authState.newValue as AuthState);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadAuthState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
      if (response.success) {
        setAuthState(response.data);
      }
    } catch (err) {
      console.error('[Popup] Failed to load auth state:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthChange = () => {
    loadAuthState();
  };

  if (!langReady || loading) {
    return (
      <div className="popup-container">
        <div className="loading">{langReady ? t('loading') : 'Loading...'}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="popup-container">
        <div className="error">{t('dataLoadError')}</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* 用户信息区域 */}
      {!authLoading && (
        authState?.isSignedIn && authState.user ? (
          <UserProfile user={authState.user} onSignOut={handleAuthChange} />
        ) : (
          <LoginButton onLoginSuccess={handleAuthChange} />
        )
      )}

      <main className="popup-main">
        {/* 状态和HP合并的卡片 */}
        <HPBar 
          hp={userData.hp} 
          status={userData.status}
          consecutiveDays={userData.consecutiveDays}
        />
        
        {/* 木鱼场景 */}
        <div className="fish-scene-wrapper">
          {/* 云朵背景 */}
          <div className="clouds-container">
            <div className="cloud cloud-1">
              <svg viewBox="0 0 2193 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M333.828447 324.37785s-45.863192-280.738328 231.539631-301.029316c0 0 127.583062-7.504886 185.39848 69.489685 0 0 270.453855-173.724213 416.938111 92.560261 0 0 32.521173 68.099891 23.070575 115.908795 0 0 242.102063 82.553746 393.589577 0 0 0 336.885993-125.359392 555.917481 138.97937 0 0-305.198697-26.961998-532.568947 231.539631 0 0-47.252986 86.445168-208.469055 69.489685 0 0-3.891422 300.751357-324.099892 254.888165 0 0-157.046688 3.613464-277.95874-138.97937 0 0-171.778502 117.576547-324.37785 46.419109 0 0-144.538545-52.256243-185.39848-138.97937 0 0-210.970684 41.693811-254.610207-115.908795 0 0-68.655809-262.948969 162.049946-324.37785 0 0 77.550489-29.463626 138.97937 0z" fill="#8b7355"/>
              </svg>
            </div>
            <div className="cloud cloud-2">
              <svg viewBox="0 0 2193 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M333.828447 324.37785s-45.863192-280.738328 231.539631-301.029316c0 0 127.583062-7.504886 185.39848 69.489685 0 0 270.453855-173.724213 416.938111 92.560261 0 0 32.521173 68.099891 23.070575 115.908795 0 0 242.102063 82.553746 393.589577 0 0 0 336.885993-125.359392 555.917481 138.97937 0 0-305.198697-26.961998-532.568947 231.539631 0 0-47.252986 86.445168-208.469055 69.489685 0 0-3.891422 300.751357-324.099892 254.888165 0 0-157.046688 3.613464-277.95874-138.97937 0 0-171.778502 117.576547-324.37785 46.419109 0 0-144.538545-52.256243-185.39848-138.97937 0 0-210.970684 41.693811-254.610207-115.908795 0 0-68.655809-262.948969 162.049946-324.37785 0 0 77.550489-29.463626 138.97937 0z" fill="#a89680"/>
              </svg>
            </div>
            <div className="cloud cloud-3">
              <svg viewBox="0 0 2193 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M333.828447 324.37785s-45.863192-280.738328 231.539631-301.029316c0 0 127.583062-7.504886 185.39848 69.489685 0 0 270.453855-173.724213 416.938111 92.560261 0 0 32.521173 68.099891 23.070575 115.908795 0 0 242.102063 82.553746 393.589577 0 0 0 336.885993-125.359392 555.917481 138.97937 0 0-305.198697-26.961998-532.568947 231.539631 0 0-47.252986 86.445168-208.469055 69.489685 0 0-3.891422 300.751357-324.099892 254.888165 0 0-157.046688 3.613464-277.95874-138.97937 0 0-171.778502 117.576547-324.37785 46.419109 0 0-144.538545-52.256243-185.39848-138.97937 0 0-210.970684 41.693811-254.610207-115.908795 0 0-68.655809-262.948969 162.049946-324.37785 0 0 77.550489-29.463626 138.97937 0z" fill="#c8b299"/>
              </svg>
            </div>
          </div>
          
          <WoodenFish onClick={knock} />
        </div>

        {/* 底部数值栏 */}
        <div className="stats-bar">
          <StatCard
            icon="📅"
            label={t('today')}
            value={userData.todayKnocks}
            color="#239a3b"
          />
          <StatCard
            icon="🙏"
            label={t('merit')}
            value={userData.merit}
            color="#d4a574"
          />
          <StatCard
            icon="📊"
            label={t('total')}
            value={userData.totalKnocks}
            color="#7bc96f"
          />
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="popup-footer">
        <span className="app-name">{t('appName')}</span>
        <span className="footer-divider">·</span>
        <span className="copyright">© 2025</span>
        <button 
          className="help-btn" 
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html?tab=help') })}
          title={t('help')}
        >
          ❓
        </button>
        <button 
          className="settings-btn" 
          onClick={() => chrome.runtime.openOptionsPage()}
          title={t('settings')}
        >
          ⚙️
        </button>
      </footer>
    </div>
  );
}

export default Popup;
