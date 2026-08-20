import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AuditService } from '../services/AuditService.js';

export const authRouter = Router();

// Register new user
authRouter.post('/register', (req, res: Response) => {
  try {
    const { email, password, name, role, companyName, department, currentTitle } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required.' });
    }

    if (!['CANDIDATE', 'RECRUITER'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either CANDIDATE or RECRUITER.' });
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `usr-${crypto.randomUUID().slice(0, 8)}`;

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run(userId, email.toLowerCase(), passwordHash, name, role);

    let candidateId: string | undefined;
    let recruiterId: string | undefined;

    if (role === 'CANDIDATE') {
      candidateId = `cand-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO candidates (id, user_id, current_title)
        VALUES (?, ?, ?)
      `).run(candidateId, userId, currentTitle || 'Software Professional');
    } else if (role === 'RECRUITER') {
      recruiterId = `rec-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO recruiters (id, user_id, company_name, department)
        VALUES (?, ?, ?, ?)
      `).run(recruiterId, userId, companyName || 'Company Inc', department || 'Talent Acquisition');
    }

    const authUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role: role as 'CANDIDATE' | 'RECRUITER' | 'ADMIN',
      candidateId,
      recruiterId
    };

    const token = generateToken(authUser);

    AuditService.log('USER_REGISTERED', 'USER', userId, authUser, { role });

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: authUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Registration error: ${err.message}` });
  }
});

// Login
authRouter.post('/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let candidateId: string | undefined;
    let recruiterId: string | undefined;

    if (user.role === 'CANDIDATE') {
      const cand = db.prepare('SELECT id FROM candidates WHERE user_id = ?').get(user.id) as any;
      candidateId = cand?.id;
    } else if (user.role === 'RECRUITER') {
      const rec = db.prepare('SELECT id FROM recruiters WHERE user_id = ?').get(user.id) as any;
      recruiterId = rec?.id;
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      candidateId,
      recruiterId
    };

    const token = generateToken(authUser);

    AuditService.log('USER_LOGIN', 'USER', user.id, authUser);

    return res.json({
      message: 'Login successful.',
      token,
      user: authUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Login error: ${err.message}` });
  }
});

// Quick Demo Login (switches persona instantly for demo presentations)
authRouter.post('/demo-switch', (req, res: Response) => {
  try {
    const { persona } = req.body; // 'candidate' | 'recruiter' | 'admin'
    let email = 'alex.rivera@example.com';
    if (persona === 'recruiter') email = 'recruiter@proofly.ai';
    if (persona === 'admin') email = 'admin@proofly.ai';
    if (persona === 'candidate_sarah') email = 'sarah.chen@example.com';
    if (persona === 'candidate_marcus') email = 'marcus.vance@example.com';

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(404).json({ error: `Demo user ${email} not found in database.` });
    }

    let candidateId: string | undefined;
    let recruiterId: string | undefined;

    if (user.role === 'CANDIDATE') {
      const cand = db.prepare('SELECT id FROM candidates WHERE user_id = ?').get(user.id) as any;
      candidateId = cand?.id;
    } else if (user.role === 'RECRUITER') {
      const rec = db.prepare('SELECT id FROM recruiters WHERE user_id = ?').get(user.id) as any;
      recruiterId = rec?.id;
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      candidateId,
      recruiterId
    };

    const token = generateToken(authUser);

    return res.json({
      message: `Switched to demo persona: ${user.name} (${user.role})`,
      token,
      user: authUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Demo switch error: ${err.message}` });
  }
});

// Current User Profile
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let profileData: any = {};
    if (user.role === 'CANDIDATE') {
      profileData = db.prepare('SELECT * FROM candidates WHERE user_id = ?').get(user.id);
    } else if (user.role === 'RECRUITER') {
      profileData = db.prepare('SELECT * FROM recruiters WHERE user_id = ?').get(user.id);
    }

    return res.json({
      user: {
        ...user,
        ...profileData
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch profile error: ${err.message}` });
  }
});
