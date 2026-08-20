export interface SegmentedSections {
  version: string;
  sections: Record<string, string>;
  detectedHeadings: { raw: string; normalized: string; lineIndex: number }[];
  unknownHeadings: string[];
}

export const ALLOWED_SECTIONS = [
  'Contact',
  'Summary',
  'Objective',
  'Education',
  'Experience',
  'Work History',
  'Skills',
  'Projects',
  'Certifications',
  'Achievements',
  'Publications',
  'Languages',
  'Interests'
] as const;

export type SectionType = typeof ALLOWED_SECTIONS[number];

const SECTION_SYNONYMS: Record<string, SectionType> = {
  // Contact
  'contact': 'Contact',
  'contact information': 'Contact',
  'contact info': 'Contact',
  'personal info': 'Contact',
  'personal details': 'Contact',

  // Summary / Objective
  'summary': 'Summary',
  'professional summary': 'Summary',
  'executive summary': 'Summary',
  'profile': 'Summary',
  'about me': 'Summary',
  'objective': 'Objective',
  'career objective': 'Objective',
  'professional objective': 'Objective',

  // Education
  'education': 'Education',
  'academic background': 'Education',
  'academic history': 'Education',
  'academic qualifications': 'Education',
  'qualifications': 'Education',
  'education and training': 'Education',
  'degrees': 'Education',

  // Experience / Work History
  'experience': 'Experience',
  'work experience': 'Experience',
  'professional experience': 'Experience',
  'employment history': 'Experience',
  'work history': 'Work History',
  'career history': 'Experience',
  'relevant experience': 'Experience',
  'internships': 'Experience',

  // Skills
  'skills': 'Skills',
  'technical skills': 'Skills',
  'skills & tools': 'Skills',
  'skills and tools': 'Skills',
  'core competencies': 'Skills',
  'technical competencies': 'Skills',
  'technologies': 'Skills',
  'tools & technologies': 'Skills',
  'proficiencies': 'Skills',
  'expertise': 'Skills',

  // Projects
  'projects': 'Projects',
  'personal projects': 'Projects',
  'key projects': 'Projects',
  'technical projects': 'Projects',
  'selected projects': 'Projects',
  'portfolio': 'Projects',

  // Certifications
  'certifications': 'Certifications',
  'licenses': 'Certifications',
  'licenses & certifications': 'Certifications',
  'certificates': 'Certifications',
  'credentials': 'Certifications',
  'professional certifications': 'Certifications',

  // Achievements / Awards
  'achievements': 'Achievements',
  'awards': 'Achievements',
  'honors': 'Achievements',
  'honors & awards': 'Achievements',
  'key achievements': 'Achievements',

  // Publications
  'publications': 'Publications',
  'papers': 'Publications',
  'research': 'Publications',
  'patents': 'Publications',

  // Languages
  'languages': 'Languages',
  'language proficiency': 'Languages',

  // Interests
  'interests': 'Interests',
  'hobbies': 'Interests',
  'activities': 'Interests',
  'volunteer': 'Interests',
  'community': 'Interests'
};

export class SectionSegmentationService {
  static readonly VERSION = '1.0.0';

  /**
   * Segments raw resume text into fixed allowed sections based on heading patterns.
   */
  static segment(rawText: string): SegmentedSections {
    const lines = rawText.split(/\r?\n/);
    const sections: Record<string, string[]> = {};
    const detectedHeadings: { raw: string; normalized: string; lineIndex: number }[] = [];
    const unknownHeadings: string[] = [];

    // Default starting section is 'Contact' if lines precede any heading
    let currentSection: SectionType | 'General' = 'Contact';
    sections['Contact'] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if line looks like a section heading
      const cleanHeader = line.replace(/[:\-_#=*|]+$/, '').replace(/^[:\-_#=*|]+/, '').trim().toLowerCase();
      
      const isPotentialHeader = 
        line.length <= 45 && 
        (
          SECTION_SYNONYMS[cleanHeader] !== undefined ||
          (line === line.toUpperCase() && /[A-Z]/.test(line) && line.split(' ').length <= 4) ||
          /^[A-Z][a-zA-Z\s&/]{2,30}:?$/.test(line)
        );

      if (isPotentialHeader) {
        if (SECTION_SYNONYMS[cleanHeader]) {
          const normalized = SECTION_SYNONYMS[cleanHeader];
          currentSection = normalized;
          if (!sections[currentSection]) {
            sections[currentSection] = [];
          }
          detectedHeadings.push({ raw: line, normalized, lineIndex: i });
          continue;
        } else if (line.length <= 35 && line === line.toUpperCase() && !line.includes('@') && !line.includes('http')) {
          // Unknown header candidate
          unknownHeadings.push(line);
          // Do not crash, keep appending to current section
        }
      }

      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      sections[currentSection].push(line);
    }

    const outputSections: Record<string, string> = {};
    for (const [sec, secLines] of Object.entries(sections)) {
      if (secLines.length > 0) {
        outputSections[sec] = secLines.join('\n');
      }
    }

    return {
      version: this.VERSION,
      sections: outputSections,
      detectedHeadings,
      unknownHeadings
    };
  }
}
