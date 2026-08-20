import { db } from '../db/database.js';

export class ReportService {
  static getFullApplicationReport(applicationId: string, isBlind: boolean = false) {
    const app = db.prepare(`
      SELECT 
        a.*,
        j.title as job_title,
        j.company as job_company,
        j.location as job_location,
        c.current_title as candidate_current_title,
        c.phone as candidate_phone,
        c.location as candidate_location,
        c.linkedin_url as candidate_linkedin,
        c.portfolio_url as candidate_portfolio,
        c.highest_degree as candidate_degree,
        c.institution as candidate_institution,
        u.name as candidate_name,
        u.email as candidate_email,
        r.filename as resume_filename,
        r.upload_timestamp as resume_upload_time,
        r.raw_text as resume_raw_text
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN resumes r ON a.resume_id = r.id
      WHERE a.id = ?
    `).get(applicationId) as any;

    if (!app) return null;

    const fitScore = db.prepare('SELECT * FROM fit_scores WHERE application_id = ?').get(applicationId) as any;
    const fitReport = db.prepare('SELECT * FROM fit_reports WHERE application_id = ?').get(applicationId) as any;
    const evidenceItems = db.prepare(`
      SELECT e.*, req.description as req_description, req.importance, req.category
      FROM evidence_items e
      JOIN job_requirements req ON e.requirement_id = req.id
      WHERE e.application_id = ?
      ORDER BY e.match_status ASC, req.weight DESC
    `).all(applicationId) as any[];

    const extractedFields = db.prepare(`
      SELECT * FROM extracted_fields
      WHERE resume_id = ?
      ORDER BY category, field_name
    `).all(app.resume_id) as any[];

    const skillRelationships = db.prepare(`
      SELECT * FROM skill_relationships
      WHERE resume_id = ?
    `).all(app.resume_id) as any[];

    const parsedBreakdown = fitScore ? JSON.parse(fitScore.breakdown_json) : null;
    const strongSkills = fitReport ? JSON.parse(fitReport.strong_skills_json) : [];
    const partialSkills = fitReport ? JSON.parse(fitReport.partial_skills_json) : [];
    const missingEvidence = fitReport ? JSON.parse(fitReport.missing_evidence_json) : [];

    // Mask PII if Blind Screening is requested
    const candidateDisplayName = isBlind ? `Candidate (${app.blind_code})` : app.candidate_name;
    const candidateDisplayEmail = isBlind ? `[REDACTED - BLIND SCREENING]` : app.candidate_email;
    const candidateDisplayPhone = isBlind ? `[REDACTED - BLIND SCREENING]` : app.candidate_phone;
    const candidateDisplayLocation = isBlind ? `[REDACTED - BLIND SCREENING]` : app.candidate_location;

    return {
      applicationId: app.id,
      job: {
        id: app.job_id,
        title: app.job_title,
        company: app.job_company,
        location: app.job_location
      },
      candidate: {
        id: app.candidate_id,
        name: candidateDisplayName,
        email: candidateDisplayEmail,
        phone: candidateDisplayPhone,
        location: candidateDisplayLocation,
        currentTitle: app.candidate_current_title,
        degree: app.candidate_degree,
        institution: app.candidate_institution,
        blindCode: app.blind_code,
        isBlindModeActive: isBlind
      },
      resume: {
        id: app.resume_id,
        filename: app.resume_filename,
        uploadedAt: app.resume_upload_time
      },
      scores: fitScore ? {
        overallScore: fitScore.overall_score,
        currentFit: fitScore.current_fit,
        evidenceQuality: fitScore.evidence_quality,
        potentialFit: fitScore.potential_fit,
        breakdown: parsedBreakdown
      } : null,
      report: fitReport ? {
        summary: fitReport.summary,
        strongSkills,
        partialSkills,
        missingEvidence,
        recruiterNotes: fitReport.recruiter_notes,
        limitations: fitReport.limitations,
        generatedAt: fitReport.export_timestamp
      } : null,
      evidenceItems,
      extractedFields,
      skillRelationships
    };
  }
}
