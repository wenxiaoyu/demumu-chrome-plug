/**
 * 登录按钮组件
 */

import { useState, useEffect } from 'react'
import { t } from '../../shared/utils/i18n'
import './LoginButton.css'

interface LoginButtonProps {
  onLoginSuccess?: () => void
}

export function LoginButton({ onLoginSuccess }: LoginButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 自动清除错误消息
  useEffect(() => {
    if (error) {
      const timer = window.setTimeout(() => {
        setError(null)
      }, 5000) // 5秒后自动隐藏

      return () => window.clearTimeout(timer)
    }
  }, [error])

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await chrome.runtime.sendMessage({ type: 'SIGN_IN' })

      if (response.success) {
        console.log('[LoginButton] Login successful:', response.data)
        onLoginSuccess?.()
      } else {
        setError(response.error || t('loginFailed'))
      }
    } catch (err) {
      console.error('[LoginButton] Login error:', err)
      setError(t('loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-button-container">
      <button className="login-button" onClick={handleLogin} disabled={loading}>
        {loading ? (
          <>
            <span className="login-spinner">⏳</span>
            {t('loggingIn')}
          </>
        ) : (
          <>
            <span className="google-icon">🔐</span>
            {t('loginWithGoogle')}
          </>
        )}
      </button>

      {error && <div className="login-error">{error}</div>}
    </div>
  )
}
