import { db } from '../db/database.js';
import crypto from 'crypto';

export class AuditService {
  static log(
    action: string,
    resourceType: string,
    resourceId: string,
    user?: { id: string; email: string; role: string },
    details?: Record<string, any>,
    ipAddress?: string
  ) {
    const id = `aud-${crypto.randomUUID().slice(0, 8)}`;
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, action, user_id, user_email, user_role, resource_type, resource_id, details_json, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      action,
      user?.id || null,
      user?.email || null,
      user?.role || null,
      resourceType,
      resourceId,
      details ? JSON.stringify(details) : null,
      ipAddress || '127.0.0.1'
    );
    return id;
  }

  static getRecentLogs(limit = 100) {
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
}
