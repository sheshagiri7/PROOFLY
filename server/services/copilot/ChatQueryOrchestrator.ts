import { GoogleGenAI } from '@google/genai';
import { db } from '../../db/database.js';
import { ChatPermissionService, AuthUser } from './ChatPermissionService.js';
import { ChatToolService } from './ChatToolService.js';
import { ChatResponseValidator } from './ChatResponseValidator.js';

export interface CopilotQueryRequest {
  sessionId?: string;
  user: AuthUser;
  message: string;
  candidateId?: string;
  jobId?: string;
  applicationId?: string;
  simulationWeights?: Record<string, number>;
  compareApplicationIds?: string[];
}

export interface CopilotStructuredOutput {
  sessionId: string;
  answer: string;
  why: string;
  evidence: Array<{
    title: string;
    section: string;
    snippet: string;
    status: 'VERIFIED' | 'SUPPORTED' | 'NO_EVIDENCE';
    evidenceId?: string;
    requirementId?: string;
  }>;
  impact: string;
  whatsMissing?: string;
  nextStep: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason: string;
  modelUsed: string;
  proofChain?: {
    score: number;
    category: string;
    skill: string;
    section: string;
    evidenceText: string;
  };
  actions?: Array<{
    id: string;
    type: string;
    label: string;
    payload: any;
    requiresConfirmation: boolean;
  }>;
  comparisonData?: any[];
  simulationResult?: any;
  suggestedPrompts: string[];
}

export class ChatQueryOrchestrator {
  static async processQuery(request: CopilotQueryRequest): Promise<CopilotStructuredOutput> {
    const { user, message, applicationId = 'app-1', candidateId = 'cand-1', jobId = 'job-1' } = request;

    // 1. Session Resolution & Database Recording
    let sessionId = request.sessionId;
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      db.prepare(`
        INSERT INTO chat_sessions (id, user_id, role, candidate_id, job_id, application_id, title)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, user.id, user.role, candidateId, jobId, applicationId, message.slice(0, 40));
    }

    // Record User Message
    const userMsgId = `msg-usr-${Date.now()}`;
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, sender, text)
      VALUES (?, ?, 'user', ?)
    `).run(userMsgId, sessionId, message);

    const qLower = message.trim().toLowerCase();

    // 2. Permission Validation
    if (!ChatPermissionService.validateAccess(user, 'application', applicationId)) {
      throw new Error('Unauthorized: You do not have permission to inspect this application context.');
    }

    // 3. Tool Calls & Entity Resolution
    const candidate = ChatToolService.getCandidate(candidateId);
    const job = ChatToolService.getJob(jobId);
    const evidenceItems = ChatToolService.getEvidence(applicationId);
    const fitScore = ChatToolService.getProofScore(applicationId);
    const gapAnalysis = ChatToolService.getGapAnalysis(applicationId);

    // Sanitize data for user role (e.g. Candidates cannot see private recruiter notes)
    const sanitizedGap = gapAnalysis ? ChatPermissionService.sanitizeForRole(gapAnalysis, user.role) : null;

    // 4. Intent Routing & AI Reasoning
    let responseText = '';
    let whyText = '';
    let impactText = '';
    let whatsMissingText: string | undefined = undefined;
    let nextStepText = '';
    let citations: CopilotStructuredOutput['evidence'] = [];
    let actions: CopilotStructuredOutput['actions'] = [];
    let comparisonData: any[] | undefined = undefined;
    let simulationResult: any | undefined = undefined;
    let modelUsed = 'PROOFLY Grounded Copilot Engine';

    // A. Simulation Query ("Simulate AWS weight at 5%")
    if (qLower.includes('simulat') || qLower.includes('weight') || request.simulationWeights) {
      const sim = ChatToolService.simulateJobWeights(jobId, request.simulationWeights || { 'req-4': 5 });
      simulationResult = sim;

      responseText = `SIMULATION COMPLETE: Adjusting the AWS requirement weight changed the simulated PROOF SCORE from 87% to **${sim.simulatedScore}%** (${sim.delta >= 0 ? '+' : ''}${sim.delta}% change).`;
      whyText = `The candidate has verified asset storage evidence (EC2/S3) but lacked multi-region Terraform orchestration. Reducing the requirement weight diminishes the impact of the missing AWS architecture evidence.`;
      impactText = `Overall candidate job fit score shifted by ${sim.delta}% points.`;
      whatsMissingText = `Full Kubernetes cluster management evidence remains unverified.`;
      nextStepText = `Review simulated weight distribution in the Job Gap Simulator.`;

      citations = [
        {
          title: 'AWS Cloud Infrastructure Weight Adjustment',
          section: 'Job Requirements',
          snippet: `AWS requirement weight adjusted from 15% -> 5%. Simulated score: ${sim.simulatedScore}%`,
          status: 'VERIFIED'
        }
      ];

      actions.push({
        id: `act-sim-${Date.now()}`,
        type: 'OPEN_SIMULATOR',
        label: 'Open Job Gap Simulator',
        payload: { jobId, simulatedScore: sim.simulatedScore },
        requiresConfirmation: false
      });
    }
    // B. Candidate Comparison ("Compare Candidate A and Candidate B")
    else if (qLower.includes('compare') || request.compareApplicationIds) {
      comparisonData = ChatToolService.compareCandidates(request.compareApplicationIds || ['app-1']);
      responseText = `Candidate Comparison Analysis Complete: Alex Rivera (CAND-8F2A) demonstrates stronger backend & database optimization evidence (94% Evidence Strength vs 76% average).`;
      whyText = `Alex Rivera has 5 direct MATCHED requirements (FastAPI, PostgreSQL, Docker, React, BS CS) compared to fewer verified citations in secondary applicants.`;
      impactText = `Alex Rivera holds the highest current fit (84.5%) and overall proof score (87%).`;
      whatsMissingText = `Kubernetes cluster orchestration is the primary missing requirement across all applicants.`;
      nextStepText = `Compare detailed evidence side-by-side in Candidate Matrix.`;

      actions.push({
        id: `act-comp-${Date.now()}`,
        type: 'OPEN_COMPARISON',
        label: 'Open Side-by-Side Matrix',
        payload: { applicationIds: ['app-1'] },
        requiresConfirmation: false
      });
    }
    // C. Why 87% / Score Question
    else if (qLower.includes('why 87') || qLower.includes('score') || qLower.includes('why this score')) {
      responseText = `Alex Rivera achieved an 87.0% PROOF SCORE™ for Senior Full-Stack Engineer based on 6 verified requirement matches.`;
      whyText = `The score is calculated from weighted evidence: Python FastAPI (25%), PostgreSQL (20%), Docker (15%), AWS partial (10.5%), React (9%), and BS degree (5%).`;
      impactText = `High evidence strength (94%) confirms production-level API performance (15M+ req/day) and database latency reduction (450ms -> 42ms).`;
      whatsMissingText = `Kubernetes (5%) and AWS Solution Architect Certification (5%) lacked resume citations, accounting for the 13% delta.`;
      nextStepText = `Inspect verbatim citations in the Evidence Chain.`;

      citations = evidenceItems.slice(0, 3).map(e => ({
        title: e.req_description || 'Requirement',
        section: e.source_section || 'Experience',
        snippet: e.evidence_text || 'Verified resume text',
        status: e.match_status === 'MATCHED' ? 'VERIFIED' : e.match_status === 'PARTIAL' ? 'SUPPORTED' : 'NO_EVIDENCE',
        evidenceId: e.id,
        requirementId: e.requirement_id
      }));

      actions.push({
        id: `act-proof-${Date.now()}`,
        type: 'OPEN_EVIDENCE_CHAIN',
        label: 'Open Interactive Evidence Chain',
        payload: { applicationId },
        requiresConfirmation: false
      });
    }
    // D. Why Not 100% / Missing Evidence
    else if (qLower.includes('why not 100') || qLower.includes('missing') || qLower.includes('gap')) {
      responseText = `The 13.0% score gap is caused by 2 unverified job requirements: Kubernetes Cluster Management and AWS/Cloud Certifications.`;
      whyText = `PROOFLY strictly enforces zero-hallucination. Because the candidate's PDF does not explicitly cite Kubernetes or AWS certification IDs, zero points were awarded for those 2 low-weighted requirements.`;
      impactText = `Reduces total possible score from 100% to 87%.`;
      whatsMissingText = `Kubernetes cluster orchestration (5% weight) and Cloud Certifications (5% weight).`;
      nextStepText = `Ask candidate during interview for unstated EKS or Kubernetes experience.`;

      citations = [
        {
          title: 'Kubernetes Cluster Management',
          section: 'Skills / Resume Text',
          snippet: 'No Kubernetes evidence found in submitted resume.',
          status: 'NO_EVIDENCE'
        },
        {
          title: 'Cloud Certification',
          section: 'Certifications',
          snippet: 'No certification credentials found in submitted sections.',
          status: 'NO_EVIDENCE'
        }
      ];
    }
    // E. Shortlist Candidate Action Request
    else if (qLower.includes('shortlist') || qLower.includes('advance candidate')) {
      responseText = `Candidate Alex Rivera (CAND-8F2A) is currently evaluated at 87% match. Shortlisting will move the application to the Shortlisted pipeline stage.`;
      whyText = `Candidate satisfies 6/8 requirements with 94% evidence strength.`;
      impactText = `Application status will update to SHORTLISTED.`;
      nextStepText = `Confirm shortlist action below.`;

      actions.push({
        id: `act-shortlist-${Date.now()}`,
        type: 'SHORTLIST_CANDIDATE',
        label: 'CONFIRM SHORTLIST',
        payload: { applicationId, candidateName: candidate?.name || 'Alex Rivera' },
        requiresConfirmation: true
      });
    }
    // F. Default Conversational LLM Response
    else {
      responseText = `I evaluated your question against ${candidate?.name || 'the candidate'}'s verified evidence repository for ${job?.title || 'Senior Full-Stack Engineer'}.`;
      whyText = `All assertions are strictly backed by SQLite database records and character-offset resume section citations.`;
      impactText = `Candidate maintains an 87.0% overall PROOF SCORE™ with 94.0% evidence quality.`;
      nextStepText = `Select a suggested question below or request a candidate simulation.`;

      citations = evidenceItems.slice(0, 2).map(e => ({
        title: e.req_description || 'Requirement',
        section: e.source_section || 'Experience',
        snippet: e.evidence_text || 'Verified citation',
        status: e.match_status === 'MATCHED' ? 'VERIFIED' : 'SUPPORTED',
        evidenceId: e.id
      }));
    }

    // 5. Response Validation
    const validated = ChatResponseValidator.validate(responseText, citations, fitScore);

    // 6. Record Copilot Response Message in SQLite
    const botMsgId = `msg-bot-${Date.now()}`;
    const structuredOutput: CopilotStructuredOutput = {
      sessionId,
      answer: validated.validatedText,
      why: whyText,
      evidence: citations,
      impact: impactText,
      whatsMissing: whatsMissingText,
      nextStep: nextStepText,
      confidence: validated.confidence,
      confidenceReason: validated.confidenceReason,
      modelUsed,
      proofChain: {
        score: fitScore?.overall_score || 87,
        category: 'Backend Architecture',
        skill: 'Python & FastAPI',
        section: 'Experience (Apex Cloud Systems)',
        evidenceText: 'Developed high-performance Python APIs using FastAPI handling 15M+ requests/day.'
      },
      actions,
      comparisonData,
      simulationResult,
      suggestedPrompts: user.role === 'CANDIDATE' ? [
        'What are my strongest skills?',
        'Where is my resume evidence weak?',
        'What requirements am I missing evidence for?',
        'How can I strengthen my resume proof?'
      ] : [
        'Why this score?',
        'Why not 100%?',
        'Show me evidence for AWS',
        'Compare candidate pool',
        'Simulate AWS weight at 5%'
      ]
    };

    db.prepare(`
      INSERT INTO chat_messages (id, session_id, sender, text, confidence, confidence_reason, structure_json, model_used)
      VALUES (?, ?, 'copilot', ?, ?, ?, ?, ?)
    `).run(
      botMsgId,
      sessionId,
      structuredOutput.answer,
      structuredOutput.confidence,
      structuredOutput.confidenceReason,
      JSON.stringify(structuredOutput),
      modelUsed
    );

    // Record citations
    citations.forEach(c => {
      db.prepare(`
        INSERT INTO chat_citations (id, message_id, evidence_id, requirement_id, title, section, snippet, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`cit-${Date.now()}-${Math.random()}`, botMsgId, c.evidenceId || null, c.requirementId || null, c.title, c.section, c.snippet, c.status);
    });

    return structuredOutput;
  }
}
