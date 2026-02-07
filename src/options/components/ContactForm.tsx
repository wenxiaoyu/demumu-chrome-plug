import { useState, useEffect } from 'react'
import type { EmergencyContact } from '../../shared/types'
import { CONTACT_CONFIG } from '../../shared/constants'
import { LoginPrompt } from './LoginPrompt'
import { t } from '../../shared/utils/i18n'
import './ContactForm.css'

interface ContactFormProps {
  contact: EmergencyContact | null
  onSubmit: (contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [priority, setPriority] = useState(3)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    if (contact) {
      setName(contact.name)
      setEmail(contact.email)
      setRelationship(contact.relationship)
      setPriority(contact.priority)
    }
  }, [contact])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证
    if (!name.trim()) {
      setError(t('nameRequired'))
      return
    }

    if (!email.trim()) {
      setError(t('emailRequired'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('emailInvalid'))
      return
    }

    if (!relationship.trim()) {
      setError(t('relationshipRequired'))
      return
    }

    // 检查登录状态（仅在添加新联系人时）
    // 通过消息传递向 background script 查询真实的认证状态
    if (!contact) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' })
        if (!response.success || !response.data?.isSignedIn) {
          setShowLoginPrompt(true)
          return
        }
      } catch {
        setShowLoginPrompt(true)
        return
      }
    }

    await submitContact()
  }

  const submitContact = async () => {
    setSubmitting(true)

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        relationship: relationship.trim(),
        priority,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('operationFailed'))
      setSubmitting(false)
    }
  }

  const handleLogin = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SIGN_IN' })
      if (response.success) {
        setShowLoginPrompt(false)
        // 登录成功后自动提交
        await submitContact()
      } else {
        setError(response.error || t('loginFailed'))
      }
    } catch (error) {
      console.error('[ContactForm] Login failed:', error)
      setError(t('loginFailed'))
    }
  }

  const handleSkipLogin = () => {
    setShowLoginPrompt(false)
    // 跳过登录，继续添加联系人
    submitContact()
  }

  const handleCancelLogin = () => {
    setShowLoginPrompt(false)
  }

  const getPriorityLabel = (p: number): string => {
    if (p === 1) return t('priorityHighest')
    if (p === 5) return t('priorityLowest')
    return t('priorityMedium')
  }

  return (
    <>
      {showLoginPrompt && (
        <LoginPrompt onLogin={handleLogin} onSkip={handleSkipLogin} onCancel={handleCancelLogin} />
      )}

      <div className="contact-form-overlay">
        <div className="contact-form-modal">
          <div className="form-header">
            <h3>{contact ? t('editContact') : t('addContact')}</h3>
            <button className="close-btn" onClick={onCancel} disabled={submitting}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                {t('name')} <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                {t('email')} <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="relationship">
                {t('relationship')} <span className="required">*</span>
              </label>
              <input
                id="relationship"
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder={t('relationshipPlaceholder')}
                list="relationship-suggestions"
                disabled={submitting}
              />
              <datalist id="relationship-suggestions">
                {CONTACT_CONFIG.COMMON_RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={t(rel)} />
                ))}
              </datalist>
              <p className="field-hint">{t('relationshipHint')}</p>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                {t('priority')}
                <span className="priority-hint">
                  （{priority} - {getPriorityLabel(priority)}）
                </span>
              </label>
              <div className="priority-input">
                <input
                  id="priority"
                  type="range"
                  min={CONTACT_CONFIG.MIN_PRIORITY}
                  max={CONTACT_CONFIG.MAX_PRIORITY}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  disabled={submitting}
                />
                <div className="priority-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < priority ? 'star filled' : 'star'}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel} disabled={submitting}>
                {t('cancel')}
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? t('saving') : contact ? t('save') : t('add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
