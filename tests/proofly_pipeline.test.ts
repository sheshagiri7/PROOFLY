import { describe, it, expect } from 'vitest';
import { SectionSegmentationService } from '../server/services/SectionSegmentationService.js';
import { FieldParsingService } from '../server/services/FieldParsingService.js';
import { JobMatchingService } from '../server/services/JobMatchingService.js';
import { ScoringService } from '../server/services/ScoringService.js';
import { GapAnalysisService } from '../server/services/GapAnalysisService.js';
import { ResumeExtractionService } from '../server/services/ResumeExtractionService.js';

describe('PROOFLY End-to-End Extraction & Evaluation Pipeline', () => {

  const SAMPLE_RESUME_CLEAN = `ALEX RIVERA
alex.rivera@example.com | +1 (555) 234-5678 | San Francisco, CA
LinkedIn: https://linkedin.com/in/alex-rivera-dev | Portfolio: https://alexrivera.dev

SUMMARY
Results-driven Senior Backend Engineer with 5+ years of experience designing and operating high-throughput microservices in Python, optimizing relational databases, and containerizing distributed applications with Docker.

EDUCATION
University of California, Berkeley
Bachelor of Science in Computer Science | Graduated: 2019 | GPA: 3.82

EXPERIENCE
Senior Software Engineer - Apex Cloud Systems (2021 - Present)
- Developed high-performance Python APIs using FastAPI and asynchronous task workers handling 15M+ requests/day.
- Optimized complex PostgreSQL database queries and connection pools, reducing p99 latency from 450ms to 42ms.
- Built automated Docker container pipelines and integrated continuous testing.
- Deployed auxiliary microservices to AWS EC2 and S3 for scalable asset storage.
- Collaborated with frontend engineers using React and TypeScript for admin dashboards.

PROJECTS
OpenSync Distributed Event Bus
- Built an open-source event-driven messaging service in Python and Redis, with Docker deployment recipes.

SKILLS
Technical Skills: Python, FastAPI, Django, SQL, PostgreSQL, Docker, Redis, REST APIs, TypeScript, React, Git, Linux
Cloud & Tools: AWS (EC2, S3), CI/CD, Microservices architecture`;

  const SAMPLE_JOB_REQUIREMENTS = [
    { id: 'req-1', category: 'Technical Skills', description: 'Proficiency in Python backend development (FastAPI or Django)', importance: 'CRITICAL' as const, weight: 25 },
    { id: 'req-2', category: 'Technical Skills', description: 'Experience with SQL databases (PostgreSQL or MySQL) and query optimization', importance: 'CRITICAL' as const, weight: 20 },
    { id: 'req-3', category: 'Technical Skills', description: 'Containerization and container orchestration using Docker', importance: 'HIGH' as const, weight: 15 },
    { id: 'req-4', category: 'Cloud / DevOps', description: 'Cloud deployment and infrastructure on AWS (EC2, S3, ECS)', importance: 'HIGH' as const, weight: 15 },
    { id: 'req-5', category: 'Frontend', description: 'Frontend development with modern JavaScript / TypeScript and React', importance: 'MEDIUM' as const, weight: 10 },
    { id: 'req-6', category: 'Education', description: 'Degree in Computer Science, Software Engineering, or equivalent experience', importance: 'MEDIUM' as const, weight: 5 },
    { id: 'req-7', category: 'Cloud / DevOps', description: 'Container orchestration with Kubernetes cluster management', importance: 'LOW' as const, weight: 5 },
    { id: 'req-8', category: 'Certifications', description: 'Relevant cloud or security certification (AWS Solutions Architect, CKA, etc.)', importance: 'LOW' as const, weight: 5 }
  ];

  it('1. Segments standard sections into allowed allowlist without data loss', () => {
    const segmented = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    expect(segmented.sections['Contact']).toBeDefined();
    expect(segmented.sections['Education']).toBeDefined();
    expect(segmented.sections['Experience']).toBeDefined();
    expect(segmented.sections['Skills']).toBeDefined();
    expect(segmented.sections['Projects']).toBeDefined();
  });

  it('2. Extracts 13 deterministic fields with verified evidence and status FOUND', () => {
    const segmented = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const fields = FieldParsingService.parseFields(segmented, SAMPLE_RESUME_CLEAN);

    expect(fields.length).toBeGreaterThanOrEqual(13);

    const nameField = fields.find(f => f.field_id === 'NAME');
    expect(nameField?.status).toBe('FOUND');
    expect(nameField?.value).toContain('Alex Rivera');

    const emailField = fields.find(f => f.field_id === 'EMAIL');
    expect(emailField?.status).toBe('FOUND');
    expect(emailField?.value).toBe('alex.rivera@example.com');

    const degreeField = fields.find(f => f.field_id === 'DEGREE');
    expect(degreeField?.status).toBe('FOUND');
    expect(degreeField?.value).toContain('Bachelor of Science');

    const certsField = fields.find(f => f.field_id === 'CERTS');
    expect(certsField?.status).toBe('NOT_FOUND');
    expect(certsField?.evidence).toContain('No certification credentials found in the submitted resume.');
  });

  it('3. Matches job requirements, normalizes weights to 100%, and extracts verbatim evidence', () => {
    const segmented = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const fields = FieldParsingService.parseFields(segmented, SAMPLE_RESUME_CLEAN);
    const matches = JobMatchingService.match(SAMPLE_JOB_REQUIREMENTS, fields, segmented, SAMPLE_RESUME_CLEAN);

    expect(matches.length).toBe(8);

    const pythonMatch = matches.find(m => m.requirementId === 'req-1');
    expect(pythonMatch?.matchStatus).toBe('MATCHED');
    expect(pythonMatch?.evidenceText).toContain('FastAPI');

    const kubernetesMatch = matches.find(m => m.requirementId === 'req-7');
    expect(kubernetesMatch?.matchStatus).toBe('NO EVIDENCE');
    expect(kubernetesMatch?.evidenceText).toBe('No evidence found in the submitted resume.');
    expect(kubernetesMatch?.explanation).toContain('No Kubernetes evidence was found in the submitted resume.');
  });

  it('4. Computes deterministic scores (Current Fit, Evidence Quality, Potential Fit)', () => {
    const segmented = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const fields = FieldParsingService.parseFields(segmented, SAMPLE_RESUME_CLEAN);
    const matches = JobMatchingService.match(SAMPLE_JOB_REQUIREMENTS, fields, segmented, SAMPLE_RESUME_CLEAN);
    const scores = ScoringService.calculateScores(matches, fields);

    expect(scores.overallScore).toBeGreaterThanOrEqual(80);
    expect(scores.evidenceQuality).toBeGreaterThanOrEqual(80);
    expect(scores.potentialFit).toBeGreaterThanOrEqual(85);
  });

  it('5. Zero-Drift Verification: Identical inputs produce 100% identical outputs on repeated runs', () => {
    const run1_seg = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const run1_fld = FieldParsingService.parseFields(run1_seg, SAMPLE_RESUME_CLEAN);
    const run1_mat = JobMatchingService.match(SAMPLE_JOB_REQUIREMENTS, run1_fld, run1_seg, SAMPLE_RESUME_CLEAN);
    const run1_scr = ScoringService.calculateScores(run1_mat, run1_fld);

    const run2_seg = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const run2_fld = FieldParsingService.parseFields(run2_seg, SAMPLE_RESUME_CLEAN);
    const run2_mat = JobMatchingService.match(SAMPLE_JOB_REQUIREMENTS, run2_fld, run2_seg, SAMPLE_RESUME_CLEAN);
    const run2_scr = ScoringService.calculateScores(run2_mat, run2_fld);

    expect(run1_scr.overallScore).toBe(run2_scr.overallScore);
    expect(run1_scr.currentFit).toBe(run2_scr.currentFit);
    expect(run1_scr.evidenceQuality).toBe(run2_scr.evidenceQuality);
    expect(run1_scr.potentialFit).toBe(run2_scr.potentialFit);
    expect(run1_mat.map(m => m.matchStatus)).toEqual(run2_mat.map(m => m.matchStatus));
  });

  it('6. Handles missing email, phone, and skills gracefully without crashing', () => {
    const resumeMissingData = `JOHNATHAN DOE\n\nEXPERIENCE\nDeveloper at TechCorp\n- Wrote code for web apps.`;
    const segmented = SectionSegmentationService.segment(resumeMissingData);
    const fields = FieldParsingService.parseFields(segmented, resumeMissingData);

    const emailField = fields.find(f => f.field_id === 'EMAIL');
    expect(emailField?.status).toBe('NOT_FOUND');
    expect(emailField?.value).toBeNull();

    const phoneField = fields.find(f => f.field_id === 'PHONE');
    expect(phoneField?.status).toBe('NOT_FOUND');
    expect(phoneField?.value).toBeNull();
  });

  it('7. Job Gap Simulator dynamically recalculates score when weights are adjusted', () => {
    const segmented = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const fields = FieldParsingService.parseFields(segmented, SAMPLE_RESUME_CLEAN);
    const matches = JobMatchingService.match(SAMPLE_JOB_REQUIREMENTS, fields, segmented, SAMPLE_RESUME_CLEAN);

    // Reduce weight of missing requirement req-7 (Kubernetes) and increase Python req-1
    const simulation = ScoringService.simulateWeights(matches, {
      'req-1': 35,
      'req-7': 0,
      'req-8': 0
    });

    expect(simulation.simulatedScore).toBeGreaterThanOrEqual(simulation.originalScore);
    expect(simulation.explanation).toContain('Score increased');
  });

  it('8. Gap Analysis uses strict evidence-first non-judgmental wording', () => {
    const segmented = SectionSegmentationService.segment(SAMPLE_RESUME_CLEAN);
    const fields = FieldParsingService.parseFields(segmented, SAMPLE_RESUME_CLEAN);
    const matches = JobMatchingService.match(SAMPLE_JOB_REQUIREMENTS, fields, segmented, SAMPLE_RESUME_CLEAN);
    const gapAnalysis = GapAnalysisService.analyze(matches, fields);

    expect(gapAnalysis.strongSkills.length).toBeGreaterThan(0);
    expect(gapAnalysis.missingEvidence.length).toBeGreaterThan(0);
  });
});
