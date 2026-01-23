import { t } from '../../shared/utils/i18n';
import './HelpPage.css';

export function HelpPage() {
  return (
    <div className="help-page">
      <div className="help-header">
        <h1>{t('help_title')}</h1>
        <p className="help-intro">{t('help_intro')}</p>
      </div>

      <div className="help-section">
        <div className="help-item">
          <div className="help-icon">🪵</div>
          <div className="help-content">
            <h2>{t('help_knock_title')}</h2>
            <p>{t('help_knock_desc')}</p>
          </div>
        </div>

        <div className="help-item">
          <div className="help-icon">🙏</div>
          <div className="help-content">
            <h2>{t('help_merit_title')}</h2>
            <p>{t('help_merit_desc')}</p>
            <ul className="help-list">
              <li>{t('help_merit_base')}</li>
              <li>{t('help_merit_first')}</li>
              <li>{t('help_merit_combo')}</li>
              <li>{t('help_merit_milestone')}</li>
            </ul>
          </div>
        </div>

        <div className="help-item">
          <div className="help-icon">❤️</div>
          <div className="help-content">
            <h2>{t('help_hp_title')}</h2>
            <p>{t('help_hp_desc')}</p>
            <ul className="help-list">
              <li>{t('help_hp_initial')}</li>
              <li>{t('help_hp_reward')}</li>
              <li>{t('help_hp_penalty')}</li>
              <li>{t('help_hp_death')}</li>
            </ul>
          </div>
        </div>

        <div className="help-item">
          <div className="help-icon">🔥</div>
          <div className="help-content">
            <h2>{t('help_streak_title')}</h2>
            <p>{t('help_streak_desc')}</p>
          </div>
        </div>

        <div className="help-tips">
          <h2>{t('help_tips_title')}</h2>
          <ul className="help-list">
            <li>{t('help_tip1')}</li>
            <li>{t('help_tip2')}</li>
            <li>{t('help_tip3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
