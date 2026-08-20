import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'proofly.db');
export const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('CANDIDATE', 'RECRUITER', 'ADMIN')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      current_title TEXT,
      phone TEXT,
      location TEXT,
      linkedin_url TEXT,
      portfolio_url TEXT,
      highest_degree TEXT,
      institution TEXT,
      graduation_year INTEGER,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recruiters (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      storage_path TEXT,
      upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL CHECK(status IN ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED', 'UNSUPPORTED')),
      raw_text TEXT,
      version_number INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS resume_versions (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      version_tag TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      parsed_json TEXT NOT NULL,
      fit_score REAL,
      change_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      recruiter_id TEXT NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      department TEXT,
      location TEXT,
      description TEXT NOT NULL,
      experience_level TEXT,
      min_education TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_requirements (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      importance TEXT NOT NULL CHECK(importance IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
      weight REAL NOT NULL,
      raw_weight REAL NOT NULL,
      normalized_weight REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('APPLIED', 'PROCESSING', 'EVALUATED', 'SHORTLISTED', 'REJECTED', 'REVIEW')),
      stage TEXT DEFAULT 'Applied',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      evaluated_at DATETIME,
      blind_code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS extracted_fields (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      field_id TEXT NOT NULL,
      category TEXT NOT NULL,
      field_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('FOUND', 'NOT_FOUND', 'AMBIGUOUS')),
      value TEXT,
      evidence TEXT,
      source_section TEXT,
      confidence REAL DEFAULT 1.0
    );

    CREATE TABLE IF NOT EXISTS evidence_items (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      requirement_id TEXT NOT NULL REFERENCES job_requirements(id) ON DELETE CASCADE,
      field_id TEXT,
      match_status TEXT NOT NULL CHECK(match_status IN ('MATCHED', 'PARTIAL', 'NO EVIDENCE')),
      explanation TEXT NOT NULL,
      evidence_text TEXT,
      source_section TEXT,
      confidence REAL NOT NULL,
      character_offset TEXT
    );

    CREATE TABLE IF NOT EXISTS skill_relationships (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
      skill_name TEXT NOT NULL,
      parent_category TEXT NOT NULL,
      relationship_type TEXT NOT NULL CHECK(relationship_type IN ('DIRECTLY_FOUND', 'AI_INFERRED')),
      evidence_text TEXT
    );

    CREATE TABLE IF NOT EXISTS fit_scores (
      id TEXT PRIMARY KEY,
      application_id TEXT UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      overall_score REAL NOT NULL,
      current_fit REAL NOT NULL,
      evidence_quality REAL NOT NULL,
      potential_fit REAL NOT NULL,
      breakdown_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fit_reports (
      id TEXT PRIMARY KEY,
      application_id TEXT UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      summary TEXT NOT NULL,
      strong_skills_json TEXT NOT NULL,
      partial_skills_json TEXT NOT NULL,
      missing_evidence_json TEXT NOT NULL,
      recruiter_notes TEXT,
      limitations TEXT,
      export_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      user_id TEXT,
      user_email TEXT,
      user_role TEXT,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      details_json TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const existingUsers = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) {
    return; // already seeded
  }

  const salt = bcrypt.genSaltSync(10);
  const candidatePass = bcrypt.hashSync('Candidate123!', salt);
  const recruiterPass = bcrypt.hashSync('Recruiter123!', salt);
  const adminPass = bcrypt.hashSync('Admin123!', salt);

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-cand-1', 'alex.rivera@example.com', candidatePass, 'Alex Rivera', 'CANDIDATE');
  insertUser.run('usr-cand-2', 'sarah.chen@example.com', candidatePass, 'Sarah Chen', 'CANDIDATE');
  insertUser.run('usr-cand-3', 'marcus.vance@example.com', candidatePass, 'Marcus Vance', 'CANDIDATE');
  insertUser.run('usr-rec-1', 'recruiter@proofly.ai', recruiterPass, 'Elena Rostova', 'RECRUITER');
  insertUser.run('usr-adm-1', 'admin@proofly.ai', adminPass, 'System Administrator', 'ADMIN');

  // 2. Candidate Profiles
  const insertCandidate = db.prepare(`
    INSERT INTO candidates (id, user_id, current_title, phone, location, linkedin_url, portfolio_url, highest_degree, institution, graduation_year, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCandidate.run('cand-1', 'usr-cand-1', 'Senior Backend Engineer', '+1 (555) 234-5678', 'San Francisco, CA', 'https://linkedin.com/in/alex-rivera-dev', 'https://alexrivera.dev', 'B.S. in Computer Science', 'University of California, Berkeley', 2019, 'Full-stack & backend developer with 5+ years building scalable Python/Node APIs and distributed databases.');
  insertCandidate.run('cand-2', 'usr-cand-2', 'Lead Full-Stack Developer', '+1 (555) 987-6543', 'Seattle, WA', 'https://linkedin.com/in/sarah-chen-swe', 'https://sarahchen.io', 'M.S. in Software Engineering', 'University of Washington', 2017, 'Full stack engineer with deep AWS, React, Python, and microservices experience.');
  insertCandidate.run('cand-3', 'usr-cand-3', 'Junior Software Engineer', '+1 (555) 345-6789', 'Austin, TX', 'https://linkedin.com/in/marcus-vance', 'https://github.com/marcusv', 'B.A. in Information Systems', 'UT Austin', 2023, 'Early-career software engineer passionate about modern web apps, TypeScript, and Docker.');

  // 3. Recruiter Profile
  const insertRecruiter = db.prepare(`
    INSERT INTO recruiters (id, user_id, company_name, department)
    VALUES (?, ?, ?, ?)
  `);
  insertRecruiter.run('rec-1', 'usr-rec-1', 'Synthetix Cloud Labs', 'Engineering Talent Acquisition');

  // 4. Jobs
  const insertJob = db.prepare(`
    INSERT INTO jobs (id, recruiter_id, title, company, department, location, description, experience_level, min_education)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertJob.run(
    'job-1',
    'rec-1',
    'Senior Full-Stack Engineer (Python & Distributed Systems)',
    'Synthetix Cloud Labs',
    'Core Infrastructure',
    'San Francisco, CA (Hybrid / Remote)',
    'We are looking for a Senior Full-Stack Engineer to architect high-throughput backend services in Python (FastAPI/Django), manage PostgreSQL & Redis databases, deploy containerized workloads using Docker and AWS, and build responsive frontend interfaces in React/TypeScript.',
    'Senior (4+ years)',
    'Bachelor’s Degree in Computer Science or related field'
  );

  // 5. Job Requirements (with normalized weights to 100%)
  const insertReq = db.prepare(`
    INSERT INTO job_requirements (id, job_id, category, description, importance, weight, raw_weight, normalized_weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReq.run('req-1', 'job-1', 'Technical Skills', 'Proficiency in Python backend development (FastAPI or Django)', 'CRITICAL', 25, 25, 0.25);
  insertReq.run('req-2', 'job-1', 'Technical Skills', 'Experience with SQL databases (PostgreSQL or MySQL) and query optimization', 'CRITICAL', 20, 20, 0.20);
  insertReq.run('req-3', 'job-1', 'Technical Skills', 'Containerization and container orchestration using Docker', 'HIGH', 15, 15, 0.15);
  insertReq.run('req-4', 'job-1', 'Cloud / DevOps', 'Cloud deployment and infrastructure on AWS (EC2, S3, ECS)', 'HIGH', 15, 15, 0.15);
  insertReq.run('req-5', 'job-1', 'Frontend', 'Frontend development with modern JavaScript / TypeScript and React', 'MEDIUM', 10, 10, 0.10);
  insertReq.run('req-6', 'job-1', 'Education', 'Degree in Computer Science, Software Engineering, or equivalent experience', 'MEDIUM', 5, 5, 0.05);
  insertReq.run('req-7', 'job-1', 'Cloud / DevOps', 'Container orchestration with Kubernetes cluster management', 'LOW', 5, 5, 0.05);
  insertReq.run('req-8', 'job-1', 'Certifications', 'Relevant cloud or security certification (AWS Solutions Architect, CKA, etc.)', 'LOW', 5, 5, 0.05);

  // 6. Resumes & Versions
  const rawTextAlexV1 = `ALEX RIVERA
alex.rivera@example.com | +1 (555) 234-5678 | San Francisco, CA
LinkedIn: https://linkedin.com/in/alex-rivera-dev | Portfolio: https://alexrivera.dev

SUMMARY
Software Engineer with 3 years of experience writing Python scripts and basic SQL queries.

EDUCATION
University of California, Berkeley
Bachelor of Science in Computer Science | Graduated: 2019

EXPERIENCE
Software Engineer - DataTech Solutions (2019 - 2021)
- Wrote internal Python utility scripts.
- Maintained SQL queries for reporting.

SKILLS
Python, SQL, HTML, CSS, Git`;

  const rawTextAlexV2 = `ALEX RIVERA
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

Software Engineer - DataTech Solutions (2019 - 2021)
- Architected RESTful microservices in Python (Django) and managed PostgreSQL schemas.
- Containerized legacy monolithic services with Docker and Docker Compose.

PROJECTS
OpenSync Distributed Event Bus
- Built an open-source event-driven messaging service in Python and Redis, with Docker deployment recipes.

SKILLS
Technical Skills: Python, FastAPI, Django, SQL, PostgreSQL, Docker, Redis, REST APIs, TypeScript, React, Git, Linux
Cloud & Tools: AWS (EC2, S3), CI/CD, Microservices architecture`;

  const insertResume = db.prepare(`
    INSERT INTO resumes (id, candidate_id, filename, file_type, file_size, storage_path, status, raw_text, version_number, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertResume.run('res-1', 'cand-1', 'Alex_Rivera_Resume_v2.pdf', 'application/pdf', 124500, 'uploads/alex_rivera_v2.pdf', 'COMPLETED', rawTextAlexV2, 2, 1);

  // Resume Versions for Evolution Diff
  const insertVersion = db.prepare(`
    INSERT INTO resume_versions (id, resume_id, candidate_id, version_tag, raw_text, parsed_json, fit_score, change_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVersion.run('ver-1', 'res-1', 'cand-1', 'V1', rawTextAlexV1, JSON.stringify({ skills: ['Python', 'SQL', 'HTML', 'CSS', 'Git'], title: 'Software Engineer' }), 64.0, 'Initial resume submission without Docker, FastAPI, or AWS evidence.');
  insertVersion.run('ver-2', 'res-1', 'cand-1', 'V2', rawTextAlexV2, JSON.stringify({ skills: ['Python', 'FastAPI', 'Django', 'SQL', 'PostgreSQL', 'Docker', 'Redis', 'TypeScript', 'React', 'AWS'], title: 'Senior Software Engineer' }), 87.0, 'Added Senior Engineer experience, FastAPI microservices, Docker pipelines, and AWS EC2/S3 evidence.');

  // 7. Applications
  const insertApp = db.prepare(`
    INSERT INTO applications (id, job_id, candidate_id, resume_id, status, stage, blind_code, evaluated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  insertApp.run('app-1', 'job-1', 'cand-1', 'res-1', 'EVALUATED', 'Evaluation Complete', 'CAND-8F2A');

  // 8. Extracted Fields for Alex Rivera
  const insertField = db.prepare(`
    INSERT INTO extracted_fields (id, resume_id, field_id, category, field_name, status, value, evidence, source_section, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertField.run('f-1', 'res-1', 'NAME', 'Personal', 'Full Name', 'FOUND', 'Alex Rivera', 'ALEX RIVERA', 'Contact', 1.0);
  insertField.run('f-2', 'res-1', 'EMAIL', 'Personal', 'Email Address', 'FOUND', 'alex.rivera@example.com', 'alex.rivera@example.com', 'Contact', 1.0);
  insertField.run('f-3', 'res-1', 'PHONE', 'Personal', 'Phone Number', 'FOUND', '+1 (555) 234-5678', '+1 (555) 234-5678', 'Contact', 1.0);
  insertField.run('f-4', 'res-1', 'LINKS', 'Personal', 'LinkedIn / Portfolio', 'FOUND', 'https://linkedin.com/in/alex-rivera-dev', 'LinkedIn: https://linkedin.com/in/alex-rivera-dev | Portfolio: https://alexrivera.dev', 'Contact', 1.0);
  insertField.run('f-5', 'res-1', 'DEGREE', 'Education', 'Highest Degree', 'FOUND', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Computer Science', 'Education', 1.0);
  insertField.run('f-6', 'res-1', 'INSTITUTION', 'Education', 'Institution', 'FOUND', 'University of California, Berkeley', 'University of California, Berkeley', 'Education', 1.0);
  insertField.run('f-7', 'res-1', 'GRAD_YEAR', 'Education', 'Graduation Year', 'FOUND', '2019', 'Graduated: 2019', 'Education', 1.0);
  insertField.run('f-8', 'res-1', 'JOB_TITLE', 'Experience', 'Most Recent Job Title', 'FOUND', 'Senior Software Engineer', 'Senior Software Engineer - Apex Cloud Systems (2021 - Present)', 'Experience', 1.0);
  insertField.run('f-9', 'res-1', 'COMPANY', 'Experience', 'Most Recent Company', 'FOUND', 'Apex Cloud Systems', 'Senior Software Engineer - Apex Cloud Systems (2021 - Present)', 'Experience', 1.0);
  insertField.run('f-10', 'res-1', 'LOCATION', 'Personal', 'Location', 'FOUND', 'San Francisco, CA', 'San Francisco, CA', 'Contact', 1.0);
  insertField.run('f-11', 'res-1', 'SKILLS-LIST', 'Skills', 'Skills', 'FOUND', 'Python, FastAPI, Django, SQL, PostgreSQL, Docker, Redis, REST APIs, TypeScript, React, Git, Linux, AWS', 'Skills: Technical Skills: Python, FastAPI, Django, SQL, PostgreSQL, Docker, Redis...', 'Skills', 1.0);
  insertField.run('f-12', 'res-1', 'CERTS', 'Certifications', 'Certifications', 'NOT_FOUND', null, 'No certification credentials found in submitted sections.', 'Certifications', 1.0);
  insertField.run('f-13', 'res-1', 'PROJECTS', 'Projects', 'Projects', 'FOUND', 'OpenSync Distributed Event Bus', 'OpenSync Distributed Event Bus: Built an open-source event-driven messaging service in Python and Redis...', 'Projects', 1.0);

  // 9. Evidence Items for Alex Rivera (Signature 87% Match Proof Chain)
  const insertEvidence = db.prepare(`
    INSERT INTO evidence_items (id, application_id, requirement_id, field_id, match_status, explanation, evidence_text, source_section, confidence, character_offset)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEvidence.run(
    'ev-1', 'app-1', 'req-1', 'SKILLS-LIST', 'MATCHED',
    'Candidate explicitly lists Python, FastAPI, and Django with senior-level production experience.',
    'Developed high-performance Python APIs using FastAPI and asynchronous task workers handling 15M+ requests/day.',
    'Experience', 1.0, '340:445'
  );

  insertEvidence.run(
    'ev-2', 'app-1', 'req-2', 'SKILLS-LIST', 'MATCHED',
    'Candidate has direct PostgreSQL query optimization and relational database tuning evidence.',
    'Optimized complex PostgreSQL database queries and connection pools, reducing p99 latency from 450ms to 42ms.',
    'Experience', 1.0, '446:552'
  );

  insertEvidence.run(
    'ev-3', 'app-1', 'req-3', 'SKILLS-LIST', 'MATCHED',
    'Candidate explicitly containerizes microservices and monolithic architectures using Docker.',
    'Built automated Docker container pipelines and integrated continuous testing; Containerized legacy monolithic services with Docker and Docker Compose.',
    'Experience', 1.0, '553:670'
  );

  insertEvidence.run(
    'ev-4', 'app-1', 'req-4', 'SKILLS-LIST', 'PARTIAL',
    'Candidate has deployed auxiliary services on AWS EC2 & S3, but lacks broader AWS networking or multi-region architecture evidence.',
    'Deployed auxiliary microservices to AWS EC2 and S3 for scalable asset storage.',
    'Experience', 0.8, '671:754'
  );

  insertEvidence.run(
    'ev-5', 'app-1', 'req-5', 'SKILLS-LIST', 'MATCHED',
    'Candidate collaborates on admin dashboards using React and TypeScript.',
    'Collaborated with frontend engineers using React and TypeScript for admin dashboards.',
    'Experience', 0.9, '755:836'
  );

  insertEvidence.run(
    'ev-6', 'app-1', 'req-6', 'DEGREE', 'MATCHED',
    'Candidate holds an accredited Bachelor of Science in Computer Science from UC Berkeley.',
    'University of California, Berkeley - Bachelor of Science in Computer Science | Graduated: 2019',
    'Education', 1.0, '180:270'
  );

  insertEvidence.run(
    'ev-7', 'app-1', 'req-7', 'SKILLS-LIST', 'NO EVIDENCE',
    'No Kubernetes cluster management or container orchestration evidence was found in the submitted resume.',
    'No evidence found in the submitted resume.',
    'Skills', 0.0, '0:0'
  );

  insertEvidence.run(
    'ev-8', 'app-1', 'req-8', 'CERTS', 'NO EVIDENCE',
    'No AWS or cloud certification credentials were found in the submitted resume.',
    'No evidence found in the submitted resume.',
    'Certifications', 0.0, '0:0'
  );

  // 10. Fit Score & Breakdown
  const insertFitScore = db.prepare(`
    INSERT INTO fit_scores (id, application_id, overall_score, current_fit, evidence_quality, potential_fit, breakdown_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const breakdown = {
    requirements: [
      { id: 'req-1', title: 'Python Backend (FastAPI/Django)', weight: 0.25, score: 1.0, contribution: 25.0, status: 'MATCHED' },
      { id: 'req-2', title: 'SQL & PostgreSQL Optimization', weight: 0.20, score: 1.0, contribution: 20.0, status: 'MATCHED' },
      { id: 'req-3', title: 'Docker Containerization', weight: 0.15, score: 1.0, contribution: 15.0, status: 'MATCHED' },
      { id: 'req-4', title: 'AWS Cloud Services (EC2, S3)', weight: 0.15, score: 0.70, contribution: 10.5, status: 'PARTIAL' },
      { id: 'req-5', title: 'TypeScript & React Frontend', weight: 0.10, score: 0.90, contribution: 9.0, status: 'MATCHED' },
      { id: 'req-6', title: 'B.S. in Computer Science', weight: 0.05, score: 1.0, contribution: 5.0, status: 'MATCHED' },
      { id: 'req-7', title: 'Kubernetes Cluster Management', weight: 0.05, score: 0.0, contribution: 0.0, status: 'NO EVIDENCE' },
      { id: 'req-8', title: 'Cloud/Security Certification', weight: 0.05, score: 0.0, contribution: 0.0, status: 'NO EVIDENCE' },
    ],
    calculated_total: 84.5,
    final_score: 87.0
  };

  insertFitScore.run('fs-1', 'app-1', 87.0, 84.5, 94.0, 91.5, JSON.stringify(breakdown));

  // 11. Fit Report
  const insertReport = db.prepare(`
    INSERT INTO fit_reports (id, application_id, summary, strong_skills_json, partial_skills_json, missing_evidence_json, recruiter_notes, limitations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReport.run(
    'rep-1',
    'app-1',
    'Alex Rivera presents exceptionally strong evidence for core Python backend development, PostgreSQL query optimization, and Docker containerization. AWS experience is verified for EC2/S3 services. No evidence is present for Kubernetes or formal cloud certifications.',
    JSON.stringify(['Python', 'FastAPI', 'Django', 'SQL', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs', 'TypeScript', 'React']),
    JSON.stringify(['AWS (EC2, S3)']),
    JSON.stringify(['Kubernetes', 'AWS Certified Solutions Architect']),
    'Strong senior candidate for backend & microservices track. Recommend deep-diving into distributed orchestration during technical interview.',
    'Evaluation is strictly bounded to explicit text in the submitted PDF resume. Unstated skills or external repositories were not indexed.'
  );

  // 12. Skill Relationships
  const insertRel = db.prepare(`
    INSERT INTO skill_relationships (id, resume_id, skill_name, parent_category, relationship_type, evidence_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertRel.run('rel-1', 'res-1', 'FastAPI', 'Python', 'DIRECTLY_FOUND', 'Developed high-performance Python APIs using FastAPI');
  insertRel.run('rel-2', 'res-1', 'Django', 'Python', 'DIRECTLY_FOUND', 'Architected RESTful microservices in Python (Django)');
  insertRel.run('rel-3', 'res-1', 'PostgreSQL', 'SQL', 'DIRECTLY_FOUND', 'Optimized complex PostgreSQL database queries');
  insertRel.run('rel-4', 'res-1', 'Redis', 'Backend', 'DIRECTLY_FOUND', 'messaging service in Python and Redis');
  insertRel.run('rel-5', 'res-1', 'EC2 & S3', 'AWS', 'DIRECTLY_FOUND', 'Deployed auxiliary microservices to AWS EC2 and S3');
  insertRel.run('rel-6', 'res-1', 'TypeScript & React', 'Frontend', 'DIRECTLY_FOUND', 'Collaborated with frontend engineers using React and TypeScript');
  insertRel.run('rel-7', 'res-1', 'Asynchronous Programming', 'Python', 'AI_INFERRED', 'Inferred from async task workers and FastAPI endpoint design');
  insertRel.run('rel-8', 'res-1', 'Database Indexing & Tuning', 'SQL', 'AI_INFERRED', 'Inferred from p99 query latency reduction (450ms -> 42ms)');

  // 13. Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, read, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run('notif-1', 'usr-rec-1', 'EVALUATION_COMPLETED', 'New Candidate Evaluation Ready', 'Alex Rivera (Blind: CAND-8F2A) scored 87% match with verified evidence for Senior Full-Stack Engineer.', 0, JSON.stringify({ applicationId: 'app-1', score: 87 }));
  insertNotif.run('notif-2', 'usr-cand-1', 'APPLICATION_STATUS_UPDATED', 'Application Evaluated', 'Your resume for Senior Full-Stack Engineer has been successfully evaluated. View your explainable evidence breakdown.', 0, JSON.stringify({ applicationId: 'app-1' }));

  // 14. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, action, user_id, user_email, user_role, resource_type, resource_id, details_json, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-1', 'RESUME_UPLOADED', 'usr-cand-1', 'alex.rivera@example.com', 'CANDIDATE', 'RESUME', 'res-1', JSON.stringify({ filename: 'Alex_Rivera_Resume_v2.pdf', size: 124500 }), '127.0.0.1');
  insertAudit.run('aud-2', 'RESUME_PARSED', 'usr-cand-1', 'alex.rivera@example.com', 'CANDIDATE', 'RESUME', 'res-1', JSON.stringify({ sectionsFound: 6, fieldsFound: 11 }), '127.0.0.1');
  insertAudit.run('aud-3', 'AI_EVALUATION_COMPLETED', 'usr-cand-1', 'alex.rivera@example.com', 'CANDIDATE', 'APPLICATION', 'app-1', JSON.stringify({ score: 87.0, requirementsMatched: 5, partial: 1, missing: 2 }), '127.0.0.1');
  insertAudit.run('aud-4', 'RECRUITER_VIEWED_CANDIDATE', 'usr-rec-1', 'recruiter@proofly.ai', 'RECRUITER', 'APPLICATION', 'app-1', JSON.stringify({ blindMode: false }), '127.0.0.1');

  console.log('Proofly database initialized and seeded with rich demo dataset.');
}
