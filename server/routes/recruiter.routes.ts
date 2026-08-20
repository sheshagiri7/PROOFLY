import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const recruiterRouter = Router();

// Recruiter Dashboard Data
recruiterRouter.get('/dashboard', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const recruiterId = req.user!.recruiterId || 'rec-1';

    const recruiter = db.prepare('SELECT * FROM recruiters WHERE id = ?').get(recruiterId) as any;
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user!.id) as any;

    const jobs = db.prepare(`
      SELECT 
        j.*,
        COUNT(DISTINCT a.id) as applicant_count,
        AVG(fs.overall_score) as avg_match_score
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      LEFT JOIN fit_scores fs ON a.id = fs.application_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `).all(recruiterId);

    const applications = db.prepare(`
      SELECT 
        a.id as application_id,
        a.job_id,
        a.candidate_id,
        a.resume_id,
        a.status,
        a.stage,
        a.applied_at,
        a.evaluated_at,
        a.blind_code,
        j.title as job_title,
        j.company as job_company,
        c.current_title as candidate_current_title,
        c.location as candidate_location,
        c.highest_degree as candidate_degree,
        u.name as candidate_name,
        u.email as candidate_email,
        fs.overall_score,
        fs.current_fit,
        fs.evidence_quality,
        fs.potential_fit,
        fr.recruiter_notes,
        fr.strong_skills_json
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN fit_scores fs ON a.id = fs.application_id
      LEFT JOIN fit_reports fr ON a.id = fr.application_id
      WHERE j.recruiter_id = ?
      ORDER BY fs.overall_score DESC NULLS LAST
    `).all(recruiterId) as any[];

    const formattedApps = applications.map(app => ({
      ...app,
      skills: app.strong_skills_json ? JSON.parse(app.strong_skills_json).slice(0, 5) : []
    }));

    const totalApplicants = applications.length;
    const strongMatches = applications.filter(a => (a.overall_score || 0) >= 80).length;
    const needsReview = applications.filter(a => a.status === 'APPLIED' || a.status === 'REVIEW').length;
    const avgMatch = totalApplicants > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.overall_score || 0), 0) / totalApplicants)
      : 0;

    return res.json({
      recruiter: {
        ...recruiter,
        ...user
      },
      stats: {
        activeJobs: jobs.length,
        totalApplicants,
        strongMatches,
        needsReview,
        avgMatch
      },
      jobs,
      applications: formattedApps
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch recruiter dashboard error: ${err.message}` });
  }
});
