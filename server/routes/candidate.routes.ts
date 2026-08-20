import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const candidateRouter = Router();

// Candidate Dashboard Data
candidateRouter.get('/dashboard', authenticateToken, requireRole(['CANDIDATE', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const candidateId = req.user!.candidateId || 'cand-1';

    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId) as any;
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user!.id) as any;

    const resumes = db.prepare(`
      SELECT * FROM resumes
      WHERE candidate_id = ?
      ORDER BY upload_timestamp DESC
    `).all(candidateId);

    const applications = db.prepare(`
      SELECT 
        a.id as application_id,
        a.job_id,
        a.status,
        a.stage,
        a.applied_at,
        a.evaluated_at,
        a.blind_code,
        j.title as job_title,
        j.company as job_company,
        j.location as job_location,
        fs.overall_score,
        fs.current_fit,
        fs.evidence_quality,
        fs.potential_fit,
        fr.strong_skills_json,
        fr.partial_skills_json,
        fr.missing_evidence_json,
        fr.summary as report_summary
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN fit_scores fs ON a.id = fs.application_id
      LEFT JOIN fit_reports fr ON a.id = fr.application_id
      WHERE a.candidate_id = ?
      ORDER BY a.applied_at DESC
    `).all(candidateId) as any[];

    // Parse JSON fields safely and strictly exclude private recruiter notes
    const formattedApps = applications.map(app => ({
      ...app,
      strongSkills: app.strong_skills_json ? JSON.parse(app.strong_skills_json) : [],
      partialSkills: app.partial_skills_json ? JSON.parse(app.partial_skills_json) : [],
      missingEvidence: app.missing_evidence_json ? JSON.parse(app.missing_evidence_json) : [],
      // Ensure private recruiter notes are NOT exposed to candidate
      recruiterNotes: undefined
    }));

    return res.json({
      candidate: {
        ...candidate,
        ...user
      },
      resumesCount: resumes.length,
      activeResumes: resumes,
      applications: formattedApps
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch candidate dashboard error: ${err.message}` });
  }
});
