const API_BASE = '/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  candidateId?: string;
  recruiterId?: string;
  company_name?: string;
  department?: string;
  current_title?: string;
}

export interface JobRequirement {
  id: string;
  job_id: string;
  category: string;
  description: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  normalized_weight: number;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  description: string;
  experience_level?: string;
  min_education?: string;
  created_at: string;
  applicant_count?: number;
  requirement_count?: number;
  requirements?: JobRequirement[];
}

export interface EvidenceItem {
  id: string;
  application_id: string;
  requirement_id: string;
  field_id?: string;
  match_status: 'MATCHED' | 'PARTIAL' | 'NO EVIDENCE';
  explanation: string;
  evidence_text: string;
  source_section: string;
  confidence: number;
  character_offset?: string;
  req_description?: string;
  importance?: string;
  category?: string;
}

export interface ExtractedField {
  id: string;
  resume_id: string;
  field_id: string;
  category: string;
  field_name: string;
  status: 'FOUND' | 'NOT_FOUND' | 'AMBIGUOUS';
  value: string | null;
  evidence: string;
  source_section: string;
  confidence: number;
}

export interface FullApplicationReport {
  applicationId: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    currentTitle: string;
    degree: string;
    institution: string;
    blindCode: string;
    isBlindModeActive: boolean;
  };
  resume: {
    id: string;
    filename: string;
    uploadedAt: string;
  };
  scores: {
    overallScore: number;
    currentFit: number;
    evidenceQuality: number;
    potentialFit: number;
    breakdown: {
      requirements: Array<{
        id: string;
        title: string;
        category: string;
        weight: number;
        normalizedWeight: number;
        score: number;
        contribution: number;
        status: 'MATCHED' | 'PARTIAL' | 'NO EVIDENCE';
        explanation: string;
        evidence: string;
        sourceSection: string;
      }>;
      calculatedTotal: number;
      finalScore: number;
    };
  } | null;
  report: {
    summary: string;
    strongSkills: string[];
    partialSkills: string[];
    missingEvidence: string[];
    recruiterNotes?: string;
    limitations: string;
    generatedAt: string;
  } | null;
  evidenceItems: EvidenceItem[];
  extractedFields: ExtractedField[];
  skillRelationships: Array<{
    id: string;
    skill_name: string;
    parent_category: string;
    relationship_type: 'DIRECTLY_FOUND' | 'AI_INFERRED';
    evidence_text: string;
  }>;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('proofly_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async switchPersona(persona: 'candidate' | 'recruiter' | 'admin' | 'candidate_sarah' | 'candidate_marcus') {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to switch demo persona');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Resumes
  async uploadResume(formData: FormData) {
    const token = localStorage.getItem('proofly_token');
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Resume upload failed');
    }
    return res.json();
  },

  async getMyResumes() {
    const res = await fetch(`${API_BASE}/resumes/my-resumes`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
  },

  async getResumeEvolution(resumeId: string) {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/evolution`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch resume evolution');
    return res.json();
  },

  // Jobs
  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async getJob(id: string) {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    return res.json();
  },

  async createJob(jobData: any) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create job');
    }
    return res.json();
  },

  async simulateJobWeights(jobId: string, applicationId: string, updatedWeights: Record<string, number>) {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ applicationId, updatedWeights })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to run simulation');
    }
    return res.json();
  },

  async getJobIntelligence(jobId: string) {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/intelligence`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch job intelligence');
    return res.json();
  },

  // Applications
  async askProofly(applicationId: string, question: string) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/ask-proofly`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to query Ask Proofly');
    }
    return res.json();
  },

  async getProofScoreBreakdown(applicationId: string) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/proof-score-breakdown`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch proof score breakdown');
    return res.json();
  },
  async applyToJob(jobId: string, resumeId: string) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId, resumeId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
  },

  async getApplication(id: string, isBlind: boolean = false): Promise<FullApplicationReport> {
    const res = await fetch(`${API_BASE}/applications/${id}?blind=${isBlind}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch application');
    return res.json();
  },

  async evaluateApplication(id: string): Promise<FullApplicationReport & { message: string }> {
    const res = await fetch(`${API_BASE}/applications/${id}/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Evaluation failed');
    }
    return res.json();
  },

  async compareCandidates(applicationIds: string[], isBlind: boolean = false) {
    const res = await fetch(`${API_BASE}/applications/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ applicationIds, isBlind })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Comparison failed');
    }
    return res.json();
  },

  async updateApplicationStatus(id: string, status: string, stage?: string, notes?: string) {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, stage, notes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Status update failed');
    }
    return res.json();
  },

  // Dashboards
  async getCandidateDashboard() {
    const res = await fetch(`${API_BASE}/candidate/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch candidate dashboard');
    return res.json();
  },

  async getRecruiterDashboard() {
    const res = await fetch(`${API_BASE}/recruiter/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch recruiter dashboard');
    return res.json();
  },

  // Parser Lab
  async getLabBenchmarks() {
    const res = await fetch(`${API_BASE}/lab/benchmarks`);
    if (!res.ok) throw new Error('Failed to fetch benchmarks');
    return res.json();
  },

  async runLabTest(testCaseId?: string, customText?: string) {
    const res = await fetch(`${API_BASE}/lab/run-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseId, customText })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Test execution failed');
    }
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return { notifications: [] };
    return res.json();
  },

  async markNotificationRead(id: string) {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  async markAllNotificationsRead() {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  // Admin
  async getAdminHealth() {
    const res = await fetch(`${API_BASE}/admin/health`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin telemetry');
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getUsersList() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch users list');
    return res.json();
  },

  async getFailedDocuments() {
    const res = await fetch(`${API_BASE}/admin/failed-documents`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch failed documents');
    return res.json();
  },

  async llmChat(message: string, applicationId?: string, history?: any[]) {
    const res = await fetch(`${API_BASE}/chat/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, applicationId, history })
    });
    if (!res.ok) throw new Error('LLM Chat request failed');
    return res.json();
  }
};
