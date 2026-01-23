import { useState, useEffect } from 'react';
import { getCurrentLanguage, setLanguage, type LanguageCode } from '../../shared/utils/i18n';
import './LanguageSelector.css';

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
  }, []);

  const handleLanguageChange = async (lang: LanguageCode) => {
    if (lang === currentLang) return;
    
    setChanging(true);
    await setLanguage(lang);
    setCurrentLang(lang);
    setChanging(false);
    
    // 刷新页面以应用新语言
    window.location.reload();
  };

  return (
    <div className="language-selector">
      <label className="language-label">
        <span className="language-icon">🌐</span>
        <span className="language-text">Language / 语言</span>
      </label>
      <div className="language-buttons">
        <button
          className={`language-button ${currentLang === 'en' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('en')}
          disabled={changing}
        >
          English
        </button>
        <button
          className={`language-button ${currentLang === 'zh_CN' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('zh_CN')}
          disabled={changing}
        >
          中文
        </button>
      </div>
    </div>
  );
}
