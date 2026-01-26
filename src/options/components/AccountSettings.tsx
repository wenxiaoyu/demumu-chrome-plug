/**
 * 账号设置组件
 * 显示用户信息、同步状态、账号操作
 */

import { t } from '../../shared/utils/i18n'
import './AccountSettings.css'

export function AccountSettings() {
  // 暂时禁用登录功能 - 显示"即将推出"
  return (
    <div className="account-settings">
      <div className="account-card">
        <h3 className="card-title">{t('account_title')}</h3>
        <div className="coming-soon-container">
          <div className="coming-soon-icon">🚀</div>
          <h4 className="coming-soon-title">{t('account_comingSoon')}</h4>
          <p className="coming-soon-desc">{t('account_comingSoonDesc')}</p>
          <div className="coming-soon-features">
            <div className="feature-item">
              <span className="feature-icon">☁️</span>
              <span className="feature-text">{t('account_feature1')}</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span className="feature-text">{t('account_feature2')}</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span className="feature-text">{t('account_feature3')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 原登录功能代码已暂时禁用
 * 等扩展发布后，获取正式的扩展 ID，配置好 OAuth，再启用此功能
 *
 * 需要的步骤：
 * 1. 获取 Chrome Web Store 的扩展 ID
 * 2. 在 Google Cloud Console 配置 OAuth 重定向 URI
 * 3. 在 Firebase Console 添加授权域
 * 4. 取消注释下面的代码
 * 5. 删除上面的"即将推出"UI
 */
