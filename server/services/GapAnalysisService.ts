import { EvaluatedRequirementMatch } from './JobMatchingService.js';
import { ParsedFieldResult } from './FieldParsingService.js';

export interface GapAnalysisResult {
  strongSkills: string[];
  partialSkills: string[];
  missingEvidence: string[];
  recommendations: string[];
  summaryStatement: string;
}

export class GapAnalysisService {
  /**
   * Generates evidence-first skill gap analysis with strict phrasing guidelines.
   */
  static analyze(matches: EvaluatedRequirementMatch[], fields: ParsedFieldResult[]): GapAnalysisResult {
    const strongSkills: string[] = [];
    const partialSkills: string[] = [];
    const missingEvidence: string[] = [];
    const recommendations: string[] = [];

    for (const m of matches) {
      const label = m.description.replace(/\(.*\)/g, '').trim();
      if (m.matchStatus === 'MATCHED') {
        strongSkills.push(label);
      } else if (m.matchStatus === 'PARTIAL') {
        partialSkills.push(label);
        recommendations.push(`Expand documentation of ${label} with explicit project metrics, architectural scale, or tools used.`);
      } else {
        missingEvidence.push(label);
        recommendations.push(`Add verified evidence or credentials for ${label} if you possess hands-on exposure.`);
      }
    }

    const summaryStatement = missingEvidence.length === 0
      ? 'Comprehensive evidence detected across all job requirements.'
      : `Evidence detected for ${strongSkills.length} core requirements; ${missingEvidence.length} requirement(s) lack explicit evidence in the submitted resume.`;

    return {
      strongSkills,
      partialSkills,
      missingEvidence,
      recommendations,
      summaryStatement
    };
  }
}
