import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ChatQueryOrchestrator } from '../services/copilot/ChatQueryOrchestrator.js';
import { ChatActionService } from '../services/copilot/ChatActionService.js';

export const copilotRouter = Router();

// POST /api/chat/sessions (Create new Copilot session)
copilotRouter.post('/sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { candidateId = 'cand-1', jobId = 'job-1', applicationId = 'app-1', title = 'Copilot Context Session' } = req.body;
    const sessionId = `session-${Date.now()}`;

    db.prepare(`
      INSERT INTO chat_sessions (id, user_id, role, candidate_id, job_id, application_id, title)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, req.user!.id, req.user!.role, candidateId, jobId, applicationId, title);

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
    return res.json(session);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/sessions (List sessions for user)
copilotRouter.get('/sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = db.prepare(`
      SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC
    `).all(req.user!.id);
    return res.json(sessions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/sessions/:id (Get session messages & citations)
copilotRouter.get('/sessions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const rawMessages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(req.params.id) as any[];

    const messages = rawMessages.map(m => {
      const citations = db.prepare('SELECT * FROM chat_citations WHERE message_id = ?').all(m.id);
      const actions = db.prepare('SELECT * FROM chat_actions WHERE message_id = ?').all(m.id);
      return {
        ...m,
        structure: m.structure_json ? JSON.parse(m.structure_json) : null,
        citations,
        actions
      };
    });

    return res.json({ session, messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/query (Main Query Orchestrator Endpoint)
copilotRouter.post('/query', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, sessionId, candidateId, jobId, applicationId, simulationWeights, compareApplicationIds } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message query is required' });
    }

    const output = await ChatQueryOrchestrator.processQuery({
      sessionId,
      user: {
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.email,
        role: req.user!.role,
        candidateId: req.user!.candidateId,
        recruiterId: req.user!.recruiterId
      },
      message: message.trim(),
      candidateId,
      jobId,
      applicationId,
      simulationWeights,
      compareApplicationIds
    });

    return res.json(output);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Copilot query execution error' });
  }
});

// POST /api/chat/actions/confirm (Confirm Action)
copilotRouter.post('/actions/confirm', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actionId, actionType, payload } = req.body;
    const result = ChatActionService.confirmAction(actionId, actionType, payload, req.user!.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/sessions/:id (Clear Session)
copilotRouter.delete('/sessions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    return res.json({ success: true, message: 'Copilot session cleared successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
