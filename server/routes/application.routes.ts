import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { SectionSegmentationService } from '../services/SectionSegmentationService.js';
import { FieldParsingService } from '../services/FieldParsingService.js';
import { AIService } from '../services/AIService.js';
import { ReportService } from '../services/ReportService.js';
import { NotificationService } from '../services/NotificationService.js';
import { AuditService } from '../services/AuditService.js';
import { JobMatchingService } from '../services/JobMatchingService.js';
import { ProofScoreService } from '../services/ProofScoreService.js';
import { AskProoflyService } from '../services/AskProoflyService.js';

export const applicationRouter = Router();

// Apply for a Job
applicationRouter.post('/', authenticateToken, requireRole(['CANDIDATE', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, resumeId } = req.body;
    if (!jobId || !resumeId) {
      return res.status(400).json({ error: 'jobId and resumeId are required.' });
    }

    const candidateId = req.user!.candidateId || 'cand-1';

    // Verify resume belongs to candidate
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND candidate_id = ?').get(resumeId, candidateId) as any;
    if (!resume && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Selected resume does not belong to your candidate account.' });
    }

    // Check if already applied
    const existing = db.prepare('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?').get(jobId, candidateId) as any;
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted an application for this role.', applicationId: existing.id });
    }

    const appId = `app-${crypto.randomUUID().slice(0, 8)}`;
    const blindCode = `CAND-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    db.prepare(`
      INSERT INTO applications (id, job_id, candidate_id, resume_id, status, stage, blind_code)
      VALUES (?, ?, ?, ?, 'APPLIED', 'Applied', ?)
    `).run(appId, jobId, candidateId, resumeId, blindCode);

    // Notify Recruiter
    const job = db.prepare('SELECT j.*, r.user_id as recruiter_user_id FROM jobs j JOIN recruiters r ON j.recruiter_id = r.id WHERE j.id = ?').get(jobId) as any;
    if (job) {
      NotificationService.createNotification(
        job.recruiter_user_id,
        'NEW_APPLICATION',
        'New Candidate Application',
        `New application received for ${job.title} (Blind: ${blindCode}).`,
        { applicationId: appId, jobId }
      );
    }

    AuditService.log('APPLICATION_SUBMITTED', 'APPLICATION', appId, req.user, { jobId, resumeId });

    return res.status(201).json({
      message: 'Application submitted successfully. Ready for AI evaluation.',
      applicationId: appId,
      blindCode
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Apply error: ${err.message}` });
  }
});

// Single Application Details
applicationRouter.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const isBlind = req.query.blind === 'true';
    const reportData = ReportService.getFullApplicationReport(req.params.id, isBlind);

    if (!reportData) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Candidate data isolation
    if (req.user!.role === 'CANDIDATE' && req.user!.candidateId !== reportData.candidate.id) {
      return res.status(403).json({ error: 'Access denied. You can only inspect your own applications.' });
    }

    return res.json(reportData);
  } catch (err: any) {
    return res.status(500).json({ error: `Fetch application error: ${err.message}` });
  }
});

// Run AI Evaluation Pipeline
applicationRouter.post('/:id/evaluate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appId = req.params.id;
    const app = db.prepare(`
      SELECT a.*, r.raw_text, r.candidate_id, c.user_id as candidate_user_id, j.title as job_title, j.id as job_id, rec.user_id as recruiter_user_id
      FROM applications a
      JOIN resumes r ON a.resume_id = r.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN jobs j ON a.job_id = j.id
      JOIN recruiters rec ON j.recruiter_id = rec.id
      WHERE a.id = ?
    `).get(appId) as any;

    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (!app.raw_text || app.raw_text.length < 20) {
      return res.status(400).json({ error: 'Resume raw text is empty or non-extractable.' });
    }

    // Fetch Job Requirements
    const reqs = db.prepare(`
      SELECT * FROM job_requirements
      WHERE job_id = ?
      ORDER BY weight DESC
    `).all(app.job_id) as any[];

    if (reqs.length === 0) {
      return res.status(400).json({ error: 'Job has no defined requirements to evaluate against.' });
    }

    // 1. Segmentation
    const segmented = SectionSegmentationService.segment(app.raw_text);

    // 2. Field Parsing
    const fields = FieldParsingService.parseFields(segmented, app.raw_text);

    // Update / refresh extracted_fields in DB
    db.prepare('DELETE FROM extracted_fields WHERE resume_id = ?').run(app.resume_id);
    const insertFieldStmt = db.prepare(`
      INSERT INTO extracted_fields (id, resume_id, field_id, category, field_name, status, value, evidence, source_section, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of fields) {
      insertFieldStmt.run(`fld-${crypto.randomUUID().slice(0, 8)}`, app.resume_id, f.field_id, f.category, f.field_name, f.status, f.value, f.evidence, f.source_section, f.confidence);
    }

    // 3. AI Evidence & Matching Evaluation
    const evalResult = await AIService.evaluate(reqs, fields, segmented, app.raw_text);

    // 4. Persist Evidence Items
    db.prepare('DELETE FROM evidence_items WHERE application_id = ?').run(appId);
    const insertEvidenceStmt = db.prepare(`
      INSERT INTO evidence_items (id, application_id, requirement_id, field_id, match_status, explanation, evidence_text, source_section, confidence, character_offset)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of evalResult.matches) {
      insertEvidenceStmt.run(
        `ev-${crypto.randomUUID().slice(0, 8)}`,
        appId,
        m.requirementId,
        m.fieldId,
        m.matchStatus,
        m.explanation,
        m.evidenceText,
        m.sourceSection,
        m.confidence,
        m.characterOffset
      );
    }

    // 5. Persist Skill Relationships
    db.prepare('DELETE FROM skill_relationships WHERE resume_id = ?').run(app.resume_id);
    const insertRelStmt = db.prepare(`
      INSERT INTO skill_relationships (id, resume_id, skill_name, parent_category, relationship_type, evidence_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const cat of evalResult.skillGraph.rootCategories) {
      for (const node of cat.skills) {
        insertRelStmt.run(`rel-${crypto.randomUUID().slice(0, 8)}`, app.resume_id, node.name, cat.category, node.relationshipType, node.evidenceText);
      }
    }

    // 6. Persist Fit Score
    db.prepare('DELETE FROM fit_scores WHERE application_id = ?').run(appId);
    const fitScoreId = `fs-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO fit_scores (id, application_id, overall_score, current_fit, evidence_quality, potential_fit, breakdown_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      fitScoreId,
      appId,
      evalResult.fitScore.overallScore,
      evalResult.fitScore.currentFit,
      evalResult.fitScore.evidenceQuality,
      evalResult.fitScore.potentialFit,
      JSON.stringify(evalResult.fitScore.breakdown)
    );

    // 7. Persist Fit Report
    db.prepare('DELETE FROM fit_reports WHERE application_id = ?').run(appId);
    const reportId = `rep-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO fit_reports (id, application_id, summary, strong_skills_json, partial_skills_json, missing_evidence_json, limitations)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      appId,
      evalResult.summary,
      JSON.stringify(evalResult.gapAnalysis.strongSkills),
      JSON.stringify(evalResult.gapAnalysis.partialSkills),
      JSON.stringify(evalResult.gapAnalysis.missingEvidence),
      evalResult.limitations
    );

    // Update Application record
    db.prepare(`
      UPDATE applications
      SET status = 'EVALUATED', stage = 'Evaluation Complete', evaluated_at = datetime('now')
      WHERE id = ?
    `).run(appId);

    // Update resume version score if applicable
    db.prepare(`
      UPDATE resume_versions
      SET fit_score = ?
      WHERE resume_id = ?
    `).run(evalResult.fitScore.overallScore, app.resume_id);

    // 8. Notifications
    NotificationService.createNotification(
      app.recruiter_user_id,
      'EVALUATION_COMPLETED',
      'AI Evaluation Complete',
      `Candidate application for ${app.job_title} scored ${evalResult.fitScore.overallScore}% with verified evidence.`,
      { applicationId: appId, score: evalResult.fitScore.overallScore }
    );

    NotificationService.createNotification(
      app.candidate_user_id,
      'APPLICATION_STATUS_UPDATED',
      'Application Evaluated',
      `Your application for ${app.job_title} has been evaluated with explainable evidence.`,
      { applicationId: appId }
    );

    AuditService.log('AI_EVALUATION_COMPLETED', 'APPLICATION', appId, req.user, {
      score: evalResult.fitScore.overallScore,
      evidenceQuality: evalResult.fitScore.evidenceQuality
    });

    const fullReport = ReportService.getFullApplicationReport(appId, false);
    return res.json({
      message: 'AI evaluation completed successfully with traceable evidence chain.',
      ...fullReport
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Evaluation error: ${err.message}` });
  }
});

// POST /api/applications/:id/ask-proofly (Recruiter Evidence-Grounded Q&A)
applicationRouter.post('/:id/ask-proofly', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await AskProoflyService.answerQuestionAsync(req.params.id, question);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/:id/proof-score-breakdown
applicationRouter.get('/:id/proof-score-breakdown', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id) as any;
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(app.resume_id) as any;
    const reqs = db.prepare('SELECT * FROM job_requirements WHERE job_id = ?').all(app.job_id) as any[];

    const rawText = resume?.raw_text || '';
    const segmented = SectionSegmentationService.segment(rawText);
    const fields = FieldParsingService.parseFields(segmented, rawText);
    const matches = JobMatchingService.match(reqs, fields, segmented, rawText);

    const breakdown = ProofScoreService.calculate(matches, fields, segmented, rawText);
    return res.json(breakdown);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Exportable / Printable Candidate Report
applicationRouter.get('/:id/report', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const isBlind = req.query.blind === 'true';
    const reportData = ReportService.getFullApplicationReport(req.params.id, isBlind);

    if (!reportData) {
      return res.status(404).json({ error: 'Report not found for this application.' });
    }

    return res.json(reportData);
  } catch (err: any) {
    return res.status(500).json({ error: `Report generation error: ${err.message}` });
  }
});

// Compare 2 to 5 Candidates Side-by-Side
applicationRouter.post('/compare', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationIds, isBlind } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length < 2 || applicationIds.length > 5) {
      return res.status(400).json({ error: 'Please provide between 2 and 5 application IDs to compare.' });
    }

    const candidateComparisons = [];
    for (const id of applicationIds) {
      const rep = ReportService.getFullApplicationReport(id, isBlind === true);
      if (rep) {
        candidateComparisons.push({
          applicationId: rep.applicationId,
          candidateName: rep.candidate.name,
          currentTitle: rep.candidate.currentTitle,
          degree: rep.candidate.degree,
          blindCode: rep.candidate.blindCode,
          overallScore: rep.scores?.overallScore || 0,
          currentFit: rep.scores?.currentFit || 0,
          evidenceQuality: rep.scores?.evidenceQuality || 0,
          potentialFit: rep.scores?.potentialFit || 0,
          strongSkills: rep.report?.strongSkills || [],
          partialSkills: rep.report?.partialSkills || [],
          missingEvidence: rep.report?.missingEvidence || [],
          evidenceItems: rep.evidenceItems || []
        });
      }
    }

    AuditService.log('CANDIDATES_COMPARED', 'APPLICATION', applicationIds.join(','), req.user, { count: candidateComparisons.length });

    return res.json({
      candidatesCount: candidateComparisons.length,
      candidates: candidateComparisons
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Comparison error: ${err.message}` });
  }
});

// Update Application Status (Shortlist / Reject / Review)
applicationRouter.patch('/:id/status', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, stage, notes } = req.body;
    if (!['SHORTLISTED', 'REJECTED', 'REVIEW', 'APPLIED', 'EVALUATED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid application status.' });
    }

    db.prepare(`
      UPDATE applications
      SET status = ?, stage = ?
      WHERE id = ?
    `).run(status, stage || status, req.params.id);

    if (notes) {
      db.prepare(`
        UPDATE fit_reports
        SET recruiter_notes = ?
        WHERE application_id = ?
      `).run(notes, req.params.id);
    }

    AuditService.log(`APPLICATION_MARKED_${status}`, 'APPLICATION', req.params.id, req.user, { status, notes });

    return res.json({ message: `Application updated to ${status}.`, status });
  } catch (err: any) {
    return res.status(500).json({ error: `Status update error: ${err.message}` });
  }
});
