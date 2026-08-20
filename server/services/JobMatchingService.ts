import { ParsedFieldResult } from './FieldParsingService.js';
import { SegmentedSections } from './SectionSegmentationService.js';

export interface EvaluatedRequirementMatch {
  requirementId: string;
  category: string;
  description: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  normalizedWeight: number;
  matchStatus: 'MATCHED' | 'PARTIAL' | 'NO EVIDENCE';
  score: number; // 0.0 to 1.0
  contributionScore: number; // score * (normalizedWeight * 100)
  explanation: string;
  evidenceText: string;
  sourceSection: string;
  fieldId: string | null;
  confidence: number;
  characterOffset: string;
}

export class JobMatchingService {
  /**
   * Evaluates job requirements against parsed fields and raw resume text.
   */
  static match(
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
  ): EvaluatedRequirementMatch[] {
    // 1. Normalize weights so sum is 1.0 (100%)
    const totalRawWeight = requirements.reduce((sum, r) => sum + (r.weight || 1), 0);
    const normalizedReqs = requirements.map(r => ({
      ...r,
      normalizedWeight: totalRawWeight > 0 ? (r.weight / totalRawWeight) : (1 / requirements.length)
    }));

    const results: EvaluatedRequirementMatch[] = [];

    for (const req of normalizedReqs) {
      const matchResult = this.evaluateSingleRequirement(req, fields, segmented, rawText);
      results.push({
        requirementId: req.id,
        category: req.category,
        description: req.description,
        importance: req.importance,
        weight: req.weight,
        normalizedWeight: req.normalizedWeight,
        matchStatus: matchResult.matchStatus,
        score: matchResult.score,
        contributionScore: Math.round(matchResult.score * req.normalizedWeight * 1000) / 10,
        explanation: matchResult.explanation,
        evidenceText: matchResult.evidenceText,
        sourceSection: matchResult.sourceSection,
        fieldId: matchResult.fieldId,
        confidence: matchResult.confidence,
        characterOffset: matchResult.characterOffset
      });
    }

    return results;
  }

  private static evaluateSingleRequirement(
    req: { id: string; category: string; description: string; importance: string; normalizedWeight: number },
    fields: ParsedFieldResult[],
    segmented: SegmentedSections,
    rawText: string
  ): {
    matchStatus: 'MATCHED' | 'PARTIAL' | 'NO EVIDENCE';
    score: number;
    explanation: string;
    evidenceText: string;
    sourceSection: string;
    fieldId: string | null;
    confidence: number;
    characterOffset: string;
  } {
    const descLower = req.description.toLowerCase();
    const skillsField = fields.find(f => f.field_id === 'SKILLS-LIST');
    const degreeField = fields.find(f => f.field_id === 'DEGREE');
    const expText = segmented.sections['Experience'] || segmented.sections['Work History'] || '';
    const projectsText = segmented.sections['Projects'] || '';
    const skillsText = segmented.sections['Skills'] || '';

    // Keywords extracted from requirement description
    const keywords = this.extractKeywords(req.description);

    // Check 1: Education Requirements
    if (req.category === 'Education' || descLower.includes('degree') || descLower.includes('computer science')) {
      if (degreeField && degreeField.status === 'FOUND' && degreeField.value) {
        const charOffset = this.calculateOffset(rawText, degreeField.value);
        return {
          matchStatus: 'MATCHED',
          score: 1.0,
          explanation: `Candidate holds a verified degree: "${degreeField.value}".`,
          evidenceText: degreeField.evidence,
          sourceSection: 'Education',
          fieldId: 'DEGREE',
          confidence: 1.0,
          characterOffset: charOffset
        };
      }
    }

    // Check 2: Certifications
    if (req.category === 'Certifications' || descLower.includes('certification') || descLower.includes('certified')) {
      const certsField = fields.find(f => f.field_id === 'CERTS');
      if (certsField && certsField.status === 'FOUND' && certsField.value) {
        return {
          matchStatus: 'MATCHED',
          score: 1.0,
          explanation: `Candidate holds certification: "${certsField.value}".`,
          evidenceText: certsField.evidence,
          sourceSection: 'Certifications',
          fieldId: 'CERTS',
          confidence: 0.95,
          characterOffset: this.calculateOffset(rawText, certsField.value)
        };
      }
      return {
        matchStatus: 'NO EVIDENCE',
        score: 0.0,
        explanation: 'No relevant certification credentials found in the submitted resume.',
        evidenceText: 'No evidence found in the submitted resume.',
        sourceSection: 'Certifications',
        fieldId: 'CERTS',
        confidence: 0.0,
        characterOffset: '0:0'
      };
    }

    // Check 3: Technical Skills & Experience in Experience / Projects / Skills
    const expLines = expText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const projLines = projectsText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Look for exact keyword match in Experience lines first (strongest evidence)
    for (const line of expLines) {
      const lineLower = line.toLowerCase();
      const matchedKeywords = keywords.filter(k => lineLower.includes(k.toLowerCase()));
      if (matchedKeywords.length >= Math.min(keywords.length, 2) && matchedKeywords.length > 0) {
        return {
          matchStatus: 'MATCHED',
          score: 1.0,
          explanation: `Candidate demonstrates production experience with ${matchedKeywords.join(', ')}.`,
          evidenceText: line,
          sourceSection: 'Experience',
          fieldId: 'SKILLS-LIST',
          confidence: 1.0,
          characterOffset: this.calculateOffset(rawText, line)
        };
      }
    }

    // Look in Projects
    for (const line of projLines) {
      const lineLower = line.toLowerCase();
      const matchedKeywords = keywords.filter(k => lineLower.includes(k.toLowerCase()));
      if (matchedKeywords.length >= 1) {
        return {
          matchStatus: 'PARTIAL',
          score: 0.75,
          explanation: `Candidate has applied ${matchedKeywords.join(', ')} in project work.`,
          evidenceText: line,
          sourceSection: 'Projects',
          fieldId: 'PROJECTS',
          confidence: 0.85,
          characterOffset: this.calculateOffset(rawText, line)
        };
      }
    }

    // Look in Skills list
    const candidateSkills = (skillsField?.value || '').split(',').map(s => s.trim().toLowerCase());
    const matchedSkills = keywords.filter(k => candidateSkills.some(cs => cs.includes(k.toLowerCase()) || k.toLowerCase().includes(cs)));

    if (matchedSkills.length > 0) {
      // If found in skills list but not explicitly detailed in experience
      const snippet = skillsText.slice(0, 140) || `Skills: ${matchedSkills.join(', ')}`;
      return {
        matchStatus: matchedSkills.length >= keywords.length ? 'MATCHED' : 'PARTIAL',
        score: matchedSkills.length >= keywords.length ? 0.90 : 0.65,
        explanation: `Candidate explicitly lists ${matchedSkills.join(', ')} in skills portfolio.`,
        evidenceText: snippet,
        sourceSection: 'Skills',
        fieldId: 'SKILLS-LIST',
        confidence: 0.90,
        characterOffset: this.calculateOffset(rawText, snippet)
      };
    }

    // Single keyword partial search across entire raw text
    for (const kw of keywords) {
      if (kw.length > 2 && rawText.toLowerCase().includes(kw.toLowerCase())) {
        const line = rawText.split(/\r?\n/).find(l => l.toLowerCase().includes(kw.toLowerCase())) || kw;
        return {
          matchStatus: 'PARTIAL',
          score: 0.40,
          explanation: `Mention of ${kw} detected in resume, but limited contextual depth.`,
          evidenceText: line.trim(),
          sourceSection: 'General',
          fieldId: null,
          confidence: 0.70,
          characterOffset: this.calculateOffset(rawText, line.trim())
        };
      }
    }

    // No evidence found
    const targetTerm = keywords[0] || req.description;
    return {
      matchStatus: 'NO EVIDENCE',
      score: 0.0,
      explanation: `No ${targetTerm} evidence was found in the submitted resume.`,
      evidenceText: 'No evidence found in the submitted resume.',
      sourceSection: 'Skills',
      fieldId: null,
      confidence: 0.0,
      characterOffset: '0:0'
    };
  }

  private static extractKeywords(description: string): string[] {
    const clean = description
      .replace(/[(),]/g, ' ')
      .replace(/\bor\b/gi, ' ')
      .replace(/\band\b/gi, ' ')
      .replace(/\bwith\b/gi, ' ')
      .replace(/\bin\b/gi, ' ')
      .replace(/\bof\b/gi, ' ')
      .replace(/\bexperience\b/gi, ' ')
      .replace(/\bproficiency\b/gi, ' ')
      .replace(/\bdevelopment\b/gi, ' ');

    const words = clean.split(/\s+/).filter(w => w.length > 2);
    
    // Look for recognizable tech terms
    const recognizedTerms = [
      'Python', 'FastAPI', 'Django', 'SQL', 'PostgreSQL', 'MySQL', 'Docker',
      'Kubernetes', 'AWS', 'GCP', 'Azure', 'TypeScript', 'React', 'Redis',
      'GraphQL', 'CI/CD', 'Linux', 'Microservices', 'Node.js', 'Java'
    ];

    const found = recognizedTerms.filter(term => description.toLowerCase().includes(term.toLowerCase()));
    if (found.length > 0) {
      return found;
    }

    return words.slice(0, 3);
  }

  private static calculateOffset(rawText: string, snippet: string): string {
    if (!snippet || snippet === 'No evidence found in the submitted resume.') return '0:0';
    const index = rawText.indexOf(snippet.slice(0, 30));
    if (index !== -1) {
      return `${index}:${index + snippet.length}`;
    }
    return '0:0';
  }
}
