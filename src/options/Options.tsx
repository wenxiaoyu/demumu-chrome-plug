import { useState, useEffect } from 'react'
import { StatsPage } from './components/StatsPage'
import { ContactsPage } from './components/ContactsPage'
import { SettingsPage } from './components/SettingsPage'
import { AccountSettings } from './components/AccountSettings'
import { HelpPage } from './components/HelpPage'
import { useContacts } from './hooks/useContacts'
import { t, initLanguage } from '../shared/utils/i18n'
import woodenFishIcon from '../icons/wooden-fish.svg'
import './options.css'

type Tab = 'stats' | 'contacts' | 'settings' | 'account' | 'help'

/**
 * Options 页面主组件
 */
export function Options() {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [langReady, setLangReady] = useState(false)
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts()

  // 初始化语言
  useEffect(() => {
    initLanguage().then(() => setLangReady(true))
  }, [])

  // 支持从 URL 参数指定默认标签
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab') as Tab
    if (tab && ['stats', 'contacts', 'settings', 'account', 'help'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  if (!langReady) {
    return (
      <div className="options-container">
        <div className="options-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1 className="options-title">
          <img src={woodenFishIcon} alt={t('woodenFish')} className="title-icon-svg" />
          {t('appName')}
        </h1>

        <nav className="options-tabs">
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            {t('tabStats')}
          </button>
          <button
            className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            {t('tabContacts')}
          </button>
          <button
            className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            {t('tabAccount')}
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            {t('tabSettings')}
          </button>
          <button
            className={`tab-button ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            {t('tabHelp')}
          </button>
        </nav>
      </header>

      <main className="options-main">
        {activeTab === 'stats' && <StatsPage />}
        {activeTab === 'contacts' && (
          <ContactsPage
            contacts={contacts}
            onAdd={addContact}
            onUpdate={updateContact}
            onDelete={deleteContact}
            loading={loading}
          />
        )}
        {activeTab === 'account' && <AccountSettings />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'help' && <HelpPage />}
      </main>
    </div>
  )
}
