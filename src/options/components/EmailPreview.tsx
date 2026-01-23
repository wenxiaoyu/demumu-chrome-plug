/**
 * 邮件预览组件
 * 
 * 显示渲染后的邮件内容
 * 支持 HTML 和纯文本视图切换
 */

import React, { useState, useEffect } from 'react';
import { EmailTemplate, EmailTemplateVariables } from '../../shared/types';
import { getDeathNotificationTemplate } from '../../shared/templates/death-notification-email';
import { renderTemplate } from '../../shared/utils/template-renderer';
import { t } from '../../shared/utils/i18n';
import './EmailPreview.css';

interface EmailPreviewProps {
  variables?: EmailTemplateVariables;
  onSendTest?: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ variables, onSendTest }) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [renderedEmail, setRenderedEmail] = useState<EmailTemplate | null>(null);
  const [hasContacts, setHasContacts] = useState(false);
  const [contactCount, setContactCount] = useState(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 检查是否有联系人
  const checkContacts = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_CONTACTS' });
      if (response.success) {
        const contacts = response.data || [];
        setHasContacts(contacts.length > 0);
        setContactCount(contacts.length);
      }
    } catch (error) {
      console.error('Failed to check contacts:', error);
    }
  };

  // 加载用户显示名称
  const loadDisplayName = async () => {
    try {
      const { authService } = await import('../../shared/services/auth-service');
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        setIsSignedIn(true);
        
        // 尝试从 Firestore 加载自定义显示名称
        try {
          const { firestoreService } = await import('../../shared/services/firestore-service');
          const userData = await firestoreService.getUserData(currentUser.uid);
          
          if (userData?.displayName) {
            console.log('[EmailPreview] Using custom display name:', userData.displayName);
            setDisplayName(userData.displayName);
          } else if (currentUser.displayName) {
            console.log('[EmailPreview] Using Google display name:', currentUser.displayName);
            setDisplayName(currentUser.displayName);
          } else if (currentUser.email) {
            const emailName = currentUser.email.split('@')[0];
            console.log('[EmailPreview] Using email prefix:', emailName);
            setDisplayName(emailName);
          }
        } catch (error) {
          console.error('[EmailPreview] Failed to load display name from Firestore:', error);
          // 使用 Google 账号名称作为后备
          if (currentUser.displayName) {
            setDisplayName(currentUser.displayName);
          } else if (currentUser.email) {
            setDisplayName(currentUser.email.split('@')[0]);
          }
        }
      } else {
        console.log('[EmailPreview] User not signed in');
        setIsSignedIn(false);
        setDisplayName('');
      }
    } catch (error) {
      console.error('[EmailPreview] Failed to load user info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 加载用户信息
    loadDisplayName();
    
    // 检查联系人
    checkContacts();
  }, []);

  useEffect(() => {
    // 等待加载完成
    if (loading) {
      return;
    }

    // 默认变量（用于预览）
    const defaultVariables: EmailTemplateVariables = {
      userName: 'John Doe',
      inactiveDays: 7,
      lastActiveDate: '2024-01-15 10:30:00',
      currentDate: '2024-01-22 14:20:00',
      merit: 150,
      hp: 20,
    };

    // 渲染邮件模板
    let vars: EmailTemplateVariables;
    
    if (variables) {
      // 如果传入了 variables，使用传入的
      vars = variables;
    } else {
      // 否则使用默认变量
      vars = defaultVariables;
      
      // 如果用户已登录且有显示名称，替换用户名
      if (isSignedIn && displayName) {
        console.log('[EmailPreview] Replacing userName with:', displayName);
        vars = {
          ...defaultVariables,
          userName: displayName
        };
      }
    }
    
    console.log('[EmailPreview] Rendering template with userName:', vars.userName);
    const template = getDeathNotificationTemplate(vars.userName);
    const rendered = renderTemplate(template, vars, true);
    setRenderedEmail(rendered);
  }, [variables, displayName, isSignedIn, loading]);

  if (!renderedEmail) {
    return <div className="email-preview-loading">{t('loading')}</div>;
  }

  return (
    <div className="email-preview">
      <div className="email-preview-header">
        <h3>📧 {t('emailPreview')}</h3>
        <div className="email-preview-controls">
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'html' ? 'active' : ''}
              onClick={() => setViewMode('html')}
            >
              {t('htmlView')}
            </button>
            <button
              className={viewMode === 'text' ? 'active' : ''}
              onClick={() => setViewMode('text')}
            >
              {t('textView')}
            </button>
          </div>
          {onSendTest && (
            <button 
              className="send-test-button" 
              onClick={onSendTest}
              disabled={!hasContacts}
              title={hasContacts ? t('sendTestEmail') : t('addContactsFirst')}
            >
              📨 {t('sendTestEmail')}
            </button>
          )}
        </div>
      </div>

      {!hasContacts && (
        <div className="email-preview-warning">
          {t('noContactsWarning')}
        </div>
      )}

      {hasContacts && (
        <div className="email-preview-info">
          {t('contactsInfo', String(contactCount))}
        </div>
      )}

      <div className="email-preview-content">
        <div className="email-subject">
          <strong>{t('subject')}：</strong>
          <span>{renderedEmail.subject}</span>
        </div>

        <div className="email-body">
          {viewMode === 'html' ? (
            <div
              className="email-html-view"
              dangerouslySetInnerHTML={{ __html: renderedEmail.htmlBody }}
            />
          ) : (
            <pre className="email-text-view">{renderedEmail.textBody}</pre>
          )}
        </div>
      </div>

      <div className="email-preview-footer">
        <p className="preview-note">
          {t('previewNote')}
        </p>
      </div>
    </div>
  );
};
