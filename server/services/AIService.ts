import { ParsedFieldResult } from './FieldParsingService.js';
import { EvaluatedRequirementMatch, JobMatchingService } from './JobMatchingService.js';
import { SegmentedSections } from './SectionSegmentationService.js';
import { ScoringService, FitScoreResult } from './ScoringService.js';
import { GapAnalysisService, GapAnalysisResult } from './GapAnalysisService.js';
import { SkillRelationshipService, SkillGraphData } from './SkillRelationshipService.js';

export interface FullEvaluationOutput {
  matches: EvaluatedRequirementMatch[];
  fitScore: FitScoreResult;
  gapAnalysis: GapAnalysisResult;
  skillGraph: SkillGraphData;
  summary: string;
  limitations: string;
  isDeterministicFallback: boolean;
}

export class AIService {
  /**
   * Evaluates structured resume data against job requirements.
   * Architecture: Receives structured fields, evidence snippets, and JD requirements (not unparsed raw text),
   * enforcing complete traceability, zero drift, and high reliability.
   */
  static async evaluate(
    requirements: Array<{
      id: string;
      category: string;
      description: string;
      importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      weight: number;
    }>,
    fields: ParsedFieldResult[],
    segmented: SegmentedSections,
    rawText: string
  ): Promise<FullEvaluationOutput> {
    // 1. Run deterministic matching and scoring
    const matches = JobMatchingService.match(requirements, fields, segmented, rawText);
    const fitScore = ScoringService.calculateScores(matches, fields);
    const gapAnalysis = GapAnalysisService.analyze(matches, fields);
    const skillGraph = SkillRelationshipService.buildGraph(fields, segmented, rawText);

    // 2. Generate explainable summary
    const matchedCount = matches.filter(m => m.matchStatus === 'MATCHED').length;
    const partialCount = matches.filter(m => m.matchStatus === 'PARTIAL').length;
    const missingCount = matches.filter(m => m.matchStatus === 'NO EVIDENCE').length;

    const summary = `Candidate achieves an explainable ${fitScore.overallScore}% match based on ${matchedCount} fully verified requirement(s), ${partialCount} partial requirement(s), and ${missingCount} unverified requirement(s). Evidence is derived directly from submitted resume sections without speculative inference.`;

    const limitations = `This evaluation is strictly bound to explicit text identified in the candidate's submitted document. Skills or experience not documented in the resume are classified as 'NO EVIDENCE' rather than an absence of ability. Final hiring decisions rest with the human recruiter.`;

    return {
      matches,
      fitScore,
      gapAnalysis,
      skillGraph,
      summary,
      limitations,
      isDeterministicFallback: true
    };
  }
}
