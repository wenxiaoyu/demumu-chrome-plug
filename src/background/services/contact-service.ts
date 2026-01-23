import { storage } from '../../shared/storage';
import { STORAGE_KEYS, DEFAULT_CONTACTS_DATA, CONTACT_CONFIG } from '../../shared/constants';
import type { EmergencyContact, ContactsData } from '../../shared/types';
import { syncService } from '../../shared/services/sync-service';
import { authService } from '../../shared/services/auth-service';

/**
 * 联系人服务
 * 负责管理紧急联系人的增删改查
 */
class ContactService {
  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证邮箱格式
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 获取联系人数据
   */
  private async getContactsData(): Promise<ContactsData> {
    const data = await storage.get<ContactsData>(STORAGE_KEYS.CONTACTS);
    return data || DEFAULT_CONTACTS_DATA;
  }

  /**
   * 保存联系人数据
   */
  private async saveContactsData(data: ContactsData): Promise<void> {
    await storage.set(STORAGE_KEYS.CONTACTS, data);
    
    // 更新联系人版本和时间戳
    await storage.set('contactsVersion', data.version);
    await storage.set('contactsUpdatedAt', Date.now());

    // 如果已登录，触发同步
    if (authService.isSignedIn()) {
      // 延迟 2 秒后同步，避免频繁操作
      setTimeout(() => {
        syncService.syncEmergencyContacts().catch((error) => {
          console.error('[ContactService] Sync failed:', error);
        });
      }, 2000);
    }
  }

  /**
   * 添加联系人
   */
  async addContact(
    contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmergencyContact> {
    // 验证邮箱
    if (!this.validateEmail(contact.email)) {
      throw new Error('Invalid email format');
    }

    // 验证优先级
    if (contact.priority < CONTACT_CONFIG.MIN_PRIORITY || contact.priority > CONTACT_CONFIG.MAX_PRIORITY) {
      throw new Error(`Priority must be between ${CONTACT_CONFIG.MIN_PRIORITY} and ${CONTACT_CONFIG.MAX_PRIORITY}`);
    }

    const data = await this.getContactsData();

    // 检查联系人数量限制
    if (data.contacts.length >= CONTACT_CONFIG.MAX_CONTACTS) {
      throw new Error(`Maximum ${CONTACT_CONFIG.MAX_CONTACTS} contacts allowed`);
    }

    // 检查邮箱是否已存在
    if (data.contacts.some(c => c.email === contact.email)) {
      throw new Error('Email already exists');
    }

    const now = Date.now();
    const newContact: EmergencyContact = {
      ...contact,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    data.contacts.push(newContact);
    await this.saveContactsData(data);

    return newContact;
  }

  /**
   * 更新联系人
   */
  async updateContact(
    id: string,
    updates: Partial<Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<EmergencyContact> {
    const data = await this.getContactsData();
    const index = data.contacts.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error('Contact not found');
    }

    // 验证邮箱（如果更新了邮箱）
    if (updates.email && !this.validateEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    // 验证优先级（如果更新了优先级）
    if (updates.priority !== undefined) {
      if (updates.priority < CONTACT_CONFIG.MIN_PRIORITY || updates.priority > CONTACT_CONFIG.MAX_PRIORITY) {
        throw new Error(`Priority must be between ${CONTACT_CONFIG.MIN_PRIORITY} and ${CONTACT_CONFIG.MAX_PRIORITY}`);
      }
    }

    // 检查邮箱是否与其他联系人重复
    if (updates.email && updates.email !== data.contacts[index].email) {
      if (data.contacts.some(c => c.id !== id && c.email === updates.email)) {
        throw new Error('Email already exists');
      }
    }

    const updatedContact: EmergencyContact = {
      ...data.contacts[index],
      ...updates,
      updatedAt: Date.now(),
    };

    data.contacts[index] = updatedContact;
    await this.saveContactsData(data);

    return updatedContact;
  }

  /**
   * 删除联系人
   */
  async deleteContact(id: string): Promise<void> {
    const data = await this.getContactsData();
    const index = data.contacts.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error('Contact not found');
    }

    data.contacts.splice(index, 1);
    await this.saveContactsData(data);
  }

  /**
   * 获取所有联系人
   */
  async getAllContacts(): Promise<EmergencyContact[]> {
    const data = await this.getContactsData();
    return data.contacts;
  }

  /**
   * 按关系获取联系人
   */
  async getContactsByRelationship(relationship: string): Promise<EmergencyContact[]> {
    const contacts = await this.getAllContacts();
    return contacts.filter(c => c.relationship === relationship);
  }

  /**
   * 按优先级排序获取联系人
   */
  async getContactsByPriority(): Promise<EmergencyContact[]> {
    const contacts = await this.getAllContacts();
    return contacts.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取单个联系人
   */
  async getContact(id: string): Promise<EmergencyContact | null> {
    const contacts = await this.getAllContacts();
    return contacts.find(c => c.id === id) || null;
  }
}

// 导出单例
export const contactService = new ContactService();
