import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './db/database.js';
import { authRouter } from './routes/auth.routes.js';
import { resumeRouter } from './routes/resume.routes.js';
import { jobRouter } from './routes/job.routes.js';
import { applicationRouter } from './routes/application.routes.js';
import { labRouter } from './routes/lab.routes.js';
import { candidateRouter } from './routes/candidate.routes.js';
import { recruiterRouter } from './routes/recruiter.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import { adminRouter } from './routes/admin.routes.js';

dotenv.config();

// Initialize persistent SQLite schema & seed demo dataset
initDatabase();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logging in development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

import { copilotRouter } from './routes/copilot.routes.js';

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/lab', labRouter);
app.use('/api/candidate', candidateRouter);
app.use('/api/recruiter', recruiterRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', copilotRouter);

import { AskProoflyService } from './services/AskProoflyService.js';

// Global LLM Chat API
app.post('/api/chat/llm', async (req, res) => {
  try {
    const { message, applicationId, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const response = await AskProoflyService.answerQuestionAsync(applicationId || 'app-1', message, history || []);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'LLM Chat service error' });
  }
});

// Root health check
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PROOFLY Backend Engine active.',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 PROOFLY Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
