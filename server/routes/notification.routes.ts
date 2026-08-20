import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { NotificationService } from '../services/NotificationService.js';

export const notificationRouter = Router();

notificationRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = NotificationService.getUserNotifications(req.user!.id);
    return res.json({ notifications });
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch notifications error: ${err.message}` });
  }
});

notificationRouter.patch('/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    NotificationService.markAsRead(req.params.id, req.user!.id);
    return res.json({ message: 'Notification marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ error: `Mark read error: ${err.message}` });
  }
});

notificationRouter.patch('/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    NotificationService.markAllAsRead(req.user!.id);
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ error: `Mark all read error: ${err.message}` });
  }
});
