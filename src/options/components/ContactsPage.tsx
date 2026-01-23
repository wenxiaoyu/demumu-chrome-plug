import { useState } from 'react';
import type { EmergencyContact } from '../../shared/types';
import { ContactCard } from './ContactCard';
import { ContactForm } from './ContactForm';
import { t } from '../../shared/utils/i18n';
import './ContactsPage.css';

interface ContactsPageProps {
  contacts: EmergencyContact[];
  onAdd: (contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<EmergencyContact>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export function ContactsPage({ contacts, onAdd, onUpdate, onDelete, loading }: ContactsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // 按关系分组联系人
  const groupedContacts = contacts.reduce((groups, contact) => {
    const relationship = contact.relationship || t('relationshipOther');
    if (!groups[relationship]) {
      groups[relationship] = [];
    }
    groups[relationship].push(contact);
    return groups;
  }, {} as Record<string, EmergencyContact[]>);

  // 翻译关系名称（处理旧数据和新数据）
  const translateRelationship = (rel: string): string => {
    // 映射旧的中文关系到翻译键
    const legacyMapping: Record<string, string> = {
      '家人': 'relationship_family',
      '朋友': 'relationship_friend',
      '同事': 'relationship_colleague',
      '其他': 'relationship_other',
    };
    
    // 如果是旧的中文数据，转换为翻译键
    const key = legacyMapping[rel] || rel;
    
    // 如果是翻译键，翻译它；否则直接返回
    if (key.startsWith('relationship_')) {
      return t(key);
    }
    return rel;
  };

  const handleAdd = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleFormSubmit = async (contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingContact) {
      await onUpdate(editingContact.id, contact);
    } else {
      await onAdd(contact);
    }
    setShowForm(false);
    setEditingContact(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  if (loading) {
    return (
      <div className="contacts-page">
        <div className="loading">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h2>{t('emergencyContacts')}</h2>
        <p className="contacts-description">
          {t('contactsDescription')}
        </p>
      </div>

      <button className="add-contact-btn" onClick={handleAdd}>
        <span className="add-icon">+</span>
        {t('addContact')}
      </button>

      {showForm && (
        <ContactForm
          contact={editingContact}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {contacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p className="empty-message">{t('noContactsYet')}</p>
          <p className="empty-hint">{t('addFirstContact')}</p>
        </div>
      ) : (
        <div className="contacts-groups">
          {Object.entries(groupedContacts)
            .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
            .map(([relationship, groupContacts]) => (
              <div key={relationship} className="contact-group">
                <h3 className="group-title">
                  {translateRelationship(relationship)} ({groupContacts.length})
                </h3>
                <div className="group-contacts">
                  {groupContacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={() => handleEdit(contact)}
                      onDelete={() => onDelete(contact.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
