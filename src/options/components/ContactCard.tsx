import { useState } from 'react';
import type { EmergencyContact } from '../../shared/types';
import { t } from '../../shared/utils/i18n';
import './ContactCard.css';

interface ContactCardProps {
  contact: EmergencyContact;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="contact-card">
      <div className="contact-info">
        <div className="contact-avatar">👤</div>
        <div className="contact-details">
          <div className="contact-name">{contact.name}</div>
          <div className="contact-email">{contact.email}</div>
        </div>
      </div>

      <div className="contact-meta">
        <div className="contact-priority">
          <span className="priority-label">{t('priority')}:</span>
          <div className="priority-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < contact.priority ? 'star filled' : 'star'}>
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="contact-actions">
        <button className="btn-edit" onClick={onEdit}>
          {t('edit')}
        </button>
        <button className="btn-delete" onClick={handleDelete}>
          {t('delete')}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h4>{t('confirmDelete')}</h4>
            <p>{t('confirmDeleteContact', contact.name)}</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                {t('cancel')}
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
