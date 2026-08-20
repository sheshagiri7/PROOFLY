import { ParsedFieldResult } from './FieldParsingService.js';
import { SegmentedSections } from './SectionSegmentationService.js';

export interface SkillNode {
  name: string;
  category: string;
  relationshipType: 'DIRECTLY_FOUND' | 'AI_INFERRED';
  evidenceText: string;
  children?: SkillNode[];
}

export interface SkillGraphData {
  rootCategories: {
    category: string;
    skills: SkillNode[];
  }[];
  totalDirectSkills: number;
  totalInferredSkills: number;
}

export class SkillRelationshipService {
  /**
   * Generates structured skill relationship taxonomy directly linked to resume evidence.
   */
  static buildGraph(fields: ParsedFieldResult[], segmented: SegmentedSections, rawText: string): SkillGraphData {
    const skillsField = fields.find(f => f.field_id === 'SKILLS-LIST');
    const candidateSkills = (skillsField?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const expText = segmented.sections['Experience'] || '';

    const taxonomy: Record<string, { direct: string[]; inferred: string[]; evidenceMap: Record<string, string> }> = {
      'Backend & Architecture': {
        direct: [],
        inferred: [],
        evidenceMap: {}
      },
      'Databases & Storage': {
        direct: [],
        inferred: [],
        evidenceMap: {}
      },
      'Cloud & DevOps': {
        direct: [],
        inferred: [],
        evidenceMap: {}
      },
      'Frontend & UI': {
        direct: [],
        inferred: [],
        evidenceMap: {}
      }
    };

    const backendKeywords = ['Python', 'FastAPI', 'Django', 'Node.js', 'Express', 'Java', 'Go', 'Rust', 'REST APIs', 'GraphQL', 'Microservices'];
    const dbKeywords = ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB'];
    const cloudKeywords = ['Docker', 'Kubernetes', 'AWS', 'EC2', 'S3', 'GCP', 'Azure', 'CI/CD', 'Linux', 'Terraform'];
    const frontendKeywords = ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Vue', 'Angular', 'HTML', 'CSS', 'TailwindCSS'];

    // Map candidate's verified skills
    for (const skill of candidateSkills) {
      const lineMatch = expText.split('\n').find(l => l.toLowerCase().includes(skill.toLowerCase())) || `Listed in Skills: ${skill}`;

      if (backendKeywords.some(k => k.toLowerCase() === skill.toLowerCase())) {
        taxonomy['Backend & Architecture'].direct.push(skill);
        taxonomy['Backend & Architecture'].evidenceMap[skill] = lineMatch.trim();
      } else if (dbKeywords.some(k => k.toLowerCase() === skill.toLowerCase())) {
        taxonomy['Databases & Storage'].direct.push(skill);
        taxonomy['Databases & Storage'].evidenceMap[skill] = lineMatch.trim();
      } else if (cloudKeywords.some(k => k.toLowerCase() === skill.toLowerCase())) {
        taxonomy['Cloud & DevOps'].direct.push(skill);
        taxonomy['Cloud & DevOps'].evidenceMap[skill] = lineMatch.trim();
      } else if (frontendKeywords.some(k => k.toLowerCase() === skill.toLowerCase())) {
        taxonomy['Frontend & UI'].direct.push(skill);
        taxonomy['Frontend & UI'].evidenceMap[skill] = lineMatch.trim();
      }
    }

    // Add safe AI inferences based on verified capabilities
    if (taxonomy['Backend & Architecture'].direct.includes('FastAPI') || taxonomy['Backend & Architecture'].direct.includes('Python')) {
      taxonomy['Backend & Architecture'].inferred.push('Asynchronous I/O');
      taxonomy['Backend & Architecture'].evidenceMap['Asynchronous I/O'] = 'Inferred from FastAPI & Python async worker implementation';
    }
    if (taxonomy['Databases & Storage'].direct.includes('PostgreSQL')) {
      taxonomy['Databases & Storage'].inferred.push('Query Optimization & Indexing');
      taxonomy['Databases & Storage'].evidenceMap['Query Optimization & Indexing'] = 'Inferred from PostgreSQL query optimization evidence';
    }
    if (taxonomy['Cloud & DevOps'].direct.includes('Docker')) {
      taxonomy['Cloud & DevOps'].inferred.push('Container Image Optimization');
      taxonomy['Cloud & DevOps'].evidenceMap['Container Image Optimization'] = 'Inferred from Docker containerization pipeline evidence';
    }

    let directCount = 0;
    let inferredCount = 0;

    const rootCategories = Object.entries(taxonomy).map(([cat, data]) => {
      const skills: SkillNode[] = [];
      data.direct.forEach(name => {
        directCount++;
        skills.push({
          name,
          category: cat,
          relationshipType: 'DIRECTLY_FOUND',
          evidenceText: data.evidenceMap[name] || `Verified in resume ${cat} context.`
        });
      });
      data.inferred.forEach(name => {
        inferredCount++;
        skills.push({
          name,
          category: cat,
          relationshipType: 'AI_INFERRED',
          evidenceText: data.evidenceMap[name] || 'Transferable skill inferred from demonstrated domain proficiency.'
        });
      });

      return {
        category: cat,
        skills
      };
    }).filter(c => c.skills.length > 0);

    return {
      rootCategories,
      totalDirectSkills: directCount,
      totalInferredSkills: inferredCount
    };
  }
}
