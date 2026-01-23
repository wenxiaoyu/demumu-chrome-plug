/**
 * 生成唯一的记录 ID
 * 格式：timestamp-random
 * 例如：1737072000000-a3f9
 */
export function generateRecordId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}`;
}

/**
 * 生成唯一的用户 ID
 * 格式：user-timestamp-random
 * 例如：user-1737072000000-a3f9
 */
export function generateUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `user-${timestamp}-${random}`;
}
