import { useState, useEffect } from 'react';
import type { EmergencyContact } from '../../shared/types';
import { t } from '../../shared/utils/i18n';

export function useContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载联系人
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_CONTACTS',
      });

      if (response.success) {
        setContacts(response.data || []);
      } else {
        setError(response.error || t('loadFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 添加联系人
  const addContact = async (contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'ADD_CONTACT',
        data: contact,
      });

      if (response.success) {
        await loadContacts();
      } else {
        throw new Error(response.error || '添加失败');
      }
    } catch (err) {
      throw err;
    }
  };

  // 更新联系人
  const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_CONTACT',
        data: { id, updates },
      });

      if (response.success) {
        await loadContacts();
      } else {
        throw new Error(response.error || '更新失败');
      }
    } catch (err) {
      throw err;
    }
  };

  // 删除联系人
  const deleteContact = async (id: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DELETE_CONTACT',
        data: { id },
      });

      if (response.success) {
        await loadContacts();
      } else {
        throw new Error(response.error || '删除失败');
      }
    } catch (err) {
      throw err;
    }
  };

  // 按关系过滤
  const getContactsByRelationship = (relationship: string) => {
    return contacts.filter(c => c.relationship === relationship);
  };

  // 按优先级排序
  const getContactsByPriority = () => {
    return [...contacts].sort((a, b) => a.priority - b.priority);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    getContactsByRelationship,
    getContactsByPriority,
    reload: loadContacts,
  };
}
