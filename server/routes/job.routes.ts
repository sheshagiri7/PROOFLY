import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ScoringService } from '../services/ScoringService.js';
import { AuditService } from '../services/AuditService.js';
import { JobIntelligenceService } from '../services/JobIntelligenceService.js';

export const jobRouter = Router();

// GET /api/jobs/:id/intelligence (Recruiter Pool Analytics)
jobRouter.get('/:id/intelligence', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const intel = JobIntelligenceService.getJobIntelligence(req.params.id);
    return res.json(intel);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Create Job with Requirements
jobRouter.post('/', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      company,
      department,
      location,
      description,
      experienceLevel,
      minEducation,
      requirements
    } = req.body;

    if (!title || !description || !Array.isArray(requirements) || requirements.length === 0) {
      return res.status(400).json({ error: 'Job title, description, and at least one requirement are required.' });
    }

    const recruiterId = req.user!.recruiterId || 'rec-1';
    const jobId = `job-${crypto.randomUUID().slice(0, 8)}`;

    const totalRawWeight = requirements.reduce((acc: number, r: any) => acc + (Number(r.weight) || 10), 0);

    db.prepare(`
      INSERT INTO jobs (id, recruiter_id, title, company, department, location, description, experience_level, min_education, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      jobId,
      recruiterId,
      title,
      company || 'Company Inc',
      department || 'Engineering',
      location || 'Remote',
      description,
      experienceLevel || 'Mid-Senior',
      minEducation || 'Bachelor’s Degree'
    );

    const insertReqStmt = db.prepare(`
      INSERT INTO job_requirements (id, job_id, category, description, importance, weight, raw_weight, normalized_weight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createdReqs = [];
    for (const r of requirements) {
      const reqId = `req-${crypto.randomUUID().slice(0, 8)}`;
      const rawWeight = Number(r.weight) || 10;
      const normalizedWeight = totalRawWeight > 0 ? (rawWeight / totalRawWeight) : (1 / requirements.length);
      const importance = r.importance || 'MEDIUM';

      insertReqStmt.run(
        reqId,
        jobId,
        r.category || 'Technical Skills',
        r.description,
        importance,
        rawWeight,
        rawWeight,
        normalizedWeight
      );

      createdReqs.push({
        id: reqId,
        job_id: jobId,
        category: r.category || 'Technical Skills',
        description: r.description,
        importance,
        weight: rawWeight,
        normalized_weight: normalizedWeight
      });
    }

    AuditService.log('JOB_CREATED', 'JOB', jobId, req.user, { title, requirementsCount: requirements.length });

    return res.status(201).json({
      message: 'Job created successfully with normalized requirements.',
      jobId,
      title,
      requirements: createdReqs
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Create job error: ${err.message}` });
  }
});

// List all jobs
jobRouter.get('/', (req, res: Response) => {
  try {
    const jobs = db.prepare(`
      SELECT 
        j.*,
        r.company_name as recruiter_company,
        COUNT(DISTINCT a.id) as applicant_count,
        COUNT(DISTINCT req.id) as requirement_count
      FROM jobs j
      LEFT JOIN recruiters r ON j.recruiter_id = r.id
      LEFT JOIN applications a ON j.id = a.job_id
      LEFT JOIN job_requirements req ON j.id = req.job_id
      WHERE j.is_active = 1
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `).all();

    return res.json({ jobs });
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch jobs error: ${err.message}` });
  }
});

// Single Job Details
jobRouter.get('/:id', (req, res: Response) => {
  try {
    const job = db.prepare(`
      SELECT j.*, r.company_name as recruiter_company, u.name as recruiter_name
      FROM jobs j
      JOIN recruiters r ON j.recruiter_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE j.id = ?
    `).get(req.params.id) as any;

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const requirements = db.prepare(`
      SELECT * FROM job_requirements
      WHERE job_id = ?
      ORDER BY weight DESC
    `).all(job.id);

    const applications = db.prepare(`
      SELECT 
        a.id, a.candidate_id, a.status, a.stage, a.applied_at, a.blind_code,
        u.name as candidate_name, u.email as candidate_email,
        c.current_title, c.location as candidate_location,
        fs.overall_score, fs.current_fit, fs.evidence_quality, fs.potential_fit
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN fit_scores fs ON a.id = fs.application_id
      WHERE a.job_id = ?
      ORDER BY fs.overall_score DESC NULLS LAST
    `).all(job.id);

    return res.json({ job, requirements, applications });
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch job error: ${err.message}` });
  }
});

// Job Gap Simulator: Simulate dynamic weight adjustments
jobRouter.post('/:id/simulate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId, updatedWeights } = req.body;
    if (!applicationId || !updatedWeights) {
      return res.status(400).json({ error: 'applicationId and updatedWeights dictionary are required.' });
    }

    // Fetch existing evidence items for this application
    const evidenceItems = db.prepare(`
      SELECT e.*, req.description as req_description, req.importance, req.category, req.weight as current_weight, req.normalized_weight
      FROM evidence_items e
      JOIN job_requirements req ON e.requirement_id = req.id
      WHERE e.application_id = ?
    `).all(applicationId) as any[];

    if (evidenceItems.length === 0) {
      return res.status(404).json({ error: 'No evaluated evidence found for this application to simulate.' });
    }

    const matchesForScoring = evidenceItems.map(e => ({
      requirementId: e.requirement_id,
      category: e.category,
      description: e.req_description,
      importance: e.importance,
      weight: e.current_weight,
      normalizedWeight: e.normalized_weight,
      matchStatus: e.match_status,
      score: e.match_status === 'MATCHED' ? 1.0 : (e.match_status === 'PARTIAL' ? 0.70 : 0.0),
      contributionScore: 0,
      explanation: e.explanation,
      evidenceText: e.evidence_text,
      sourceSection: e.source_section,
      fieldId: e.field_id,
      confidence: e.confidence,
      characterOffset: e.character_offset || '0:0'
    }));

    const simulation = ScoringService.simulateWeights(matchesForScoring, updatedWeights);

    AuditService.log('JOB_GAP_SIMULATED', 'APPLICATION', applicationId, req.user, {
      originalScore: simulation.originalScore,
      simulatedScore: simulation.simulatedScore,
      delta: simulation.delta
    });

    return res.json({
      applicationId,
      jobId: req.params.id,
      simulation
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Simulation error: ${err.message}` });
  }
});
