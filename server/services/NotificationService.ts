import { db } from '../db/database.js';
import crypto from 'crypto';

export class NotificationService {
  static createNotification(
    userId: string,
    type: 'EVALUATION_COMPLETED' | 'APPLICATION_STATUS_UPDATED' | 'NEW_APPLICATION' | 'SYSTEM_ALERT',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const id = `notif-${crypto.randomUUID().slice(0, 8)}`;
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, metadata_json)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `);
    stmt.run(id, userId, type, title, message, metadata ? JSON.stringify(metadata) : null);
    return id;
  }

  static getUserNotifications(userId: string) {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `);
    return stmt.all(userId);
  }

  static markAsRead(notificationId: string, userId: string) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE id = ? AND user_id = ?
    `);
    return stmt.run(notificationId, userId);
  }

  static markAllAsRead(userId: string) {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE user_id = ?
    `);
    return stmt.run(userId);
  }
}
