import { EvaluatedRequirementMatch } from './JobMatchingService.js';
import { ParsedFieldResult } from './FieldParsingService.js';

export interface FitScoreResult {
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
}

export class ScoringService {
  /**
   * Deterministically calculates Current Fit, Evidence Quality, and Potential Fit.
   */
  static calculateScores(
    matches: EvaluatedRequirementMatch[],
    fields: ParsedFieldResult[]
  ): FitScoreResult {
    let currentFitTotal = 0;
    let highQualityEvidenceCount = 0;
    let totalAssessedEvidence = matches.length;

    const breakdownItems = matches.map(m => {
      const contribution = Math.round(m.score * m.normalizedWeight * 1000) / 10;
      currentFitTotal += contribution;

      if (m.matchStatus === 'MATCHED' && m.sourceSection === 'Experience') {
        highQualityEvidenceCount += 1.0;
      } else if (m.matchStatus === 'MATCHED' || (m.matchStatus === 'PARTIAL' && m.sourceSection === 'Projects')) {
        highQualityEvidenceCount += 0.8;
      } else if (m.matchStatus === 'PARTIAL') {
        highQualityEvidenceCount += 0.5;
      }

      return {
        id: m.requirementId,
        title: m.description,
        category: m.category,
        weight: m.weight,
        normalizedWeight: Math.round(m.normalizedWeight * 1000) / 1000,
        score: m.score,
        contribution: contribution,
        status: m.matchStatus,
        explanation: m.explanation,
        evidence: m.evidenceText,
        sourceSection: m.sourceSection
      };
    });

    const currentFit = Math.round(currentFitTotal * 10) / 10;

    // Evidence Quality: assesses richness of verifiable citations in Experience/Projects vs missing/generic lists
    const fieldsWithFound = fields.filter(f => f.status === 'FOUND').length;
    const fieldCompleteness = Math.min(1.0, fieldsWithFound / 11);
    const evidenceQuality = Math.round(( (highQualityEvidenceCount / Math.max(1, totalAssessedEvidence)) * 0.6 + fieldCompleteness * 0.4 ) * 1000) / 10;

    // Potential Fit: AI analysis accounting for strong fundamental core and adjacent skill transferability
    const partialBoost = matches.filter(m => m.matchStatus === 'PARTIAL').length * 4.0;
    const experienceField = fields.find(f => f.field_id === 'JOB_TITLE');
    const seniorityBoost = (experienceField?.value?.toLowerCase().includes('senior') || experienceField?.value?.toLowerCase().includes('lead')) ? 5.0 : 2.0;
    const potentialFit = Math.min(98.0, Math.round((currentFit + partialBoost + seniorityBoost) * 10) / 10);

    // Final overall score (deterministic)
    const overallScore = Math.round(currentFit);

    return {
      overallScore,
      currentFit,
      evidenceQuality: Math.min(100, evidenceQuality),
      potentialFit,
      breakdown: {
        requirements: breakdownItems,
        calculatedTotal: currentFit,
        finalScore: overallScore
      }
    };
  }

  /**
   * Recalculates match score dynamically for Job Gap Simulator.
   */
  static simulateWeights(
    matches: EvaluatedRequirementMatch[],
    updatedWeights: Record<string, number>
  ): {
    originalScore: number;
    simulatedScore: number;
    delta: number;
    explanation: string;
    simulatedBreakdown: Array<{ id: string; title: string; oldWeight: number; newWeight: number; score: number; contribution: number }>;
  } {
    const totalNewWeight = Object.values(updatedWeights).reduce((a, b) => a + (Number(b) || 0), 0);
    let originalTotal = 0;
    let newTotal = 0;

    const simulatedBreakdown = matches.map(m => {
      const origContrib = m.score * m.normalizedWeight * 100;
      originalTotal += origContrib;

      const rawNew = updatedWeights[m.requirementId] !== undefined ? updatedWeights[m.requirementId] : m.weight;
      const normalizedNew = totalNewWeight > 0 ? (rawNew / totalNewWeight) : m.normalizedWeight;
      const newContrib = m.score * normalizedNew * 100;
      newTotal += newContrib;

      return {
        id: m.requirementId,
        title: m.description,
        oldWeight: m.weight,
        newWeight: rawNew,
        score: m.score,
        contribution: Math.round(newContrib * 10) / 10
      };
    });

    const origScore = Math.round(originalTotal);
    const simScore = Math.round(newTotal);
    const delta = simScore - origScore;

    let explanation = `Adjusting weights altered the candidate's simulated match from ${origScore}% to ${simScore}%.`;
    if (delta > 0) {
      explanation = `Score increased by +${delta}% because reduced weight on missing/partial requirements and increased weight on verified core competencies.`;
    } else if (delta < 0) {
      explanation = `Score decreased by ${delta}% due to higher emphasis on requirements where resume evidence is missing or partial.`;
    }

    return {
      originalScore: origScore,
      simulatedScore: simScore,
      delta,
      explanation,
      simulatedBreakdown
    };
  }
}
