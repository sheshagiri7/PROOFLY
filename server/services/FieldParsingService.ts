import { SegmentedSections } from './SectionSegmentationService.js';

export interface ParsedFieldResult {
  field_id: string;
  category: string;
  field_name: string;
  status: 'FOUND' | 'NOT_FOUND' | 'AMBIGUOUS';
  value: string | null;
  evidence: string;
  source_section: string;
  confidence: number;
}

export class FieldParsingService {
  /**
   * Deterministically parses at least 13 standard fields from segmented sections.
   */
  static parseFields(segmented: SegmentedSections, rawText: string): ParsedFieldResult[] {
    const results: ParsedFieldResult[] = [];
    const { sections } = segmented;

    const contactText = sections['Contact'] || '';
    const summaryText = sections['Summary'] || sections['Objective'] || '';
    const eduText = sections['Education'] || '';
    const expText = sections['Experience'] || sections['Work History'] || '';
    const skillsText = sections['Skills'] || '';
    const certsText = sections['Certifications'] || '';
    const projText = sections['Projects'] || '';

    // 1. Full Name
    results.push(this.extractName(contactText, rawText));

    // 2. Email Address
    results.push(this.extractEmail(contactText, rawText));

    // 3. Phone Number
    results.push(this.extractPhone(contactText, rawText));

    // 4. LinkedIn / Portfolio URL
    results.push(this.extractLinks(contactText, rawText));

    // 5. Highest Degree
    results.push(this.extractDegree(eduText, rawText));

    // 6. Institution
    results.push(this.extractInstitution(eduText, rawText));

    // 7. Graduation Year
    results.push(this.extractGradYear(eduText, rawText));

    // 8. Most Recent Job Title
    results.push(this.extractRecentJobTitle(expText, summaryText, rawText));

    // 9. Most Recent Company
    results.push(this.extractRecentCompany(expText, rawText));

    // 10. Location
    results.push(this.extractLocation(contactText, rawText));

    // 11. Skills List
    results.push(this.extractSkills(skillsText, expText, rawText));

    // 12. Certifications
    results.push(this.extractCertifications(certsText, rawText));

    // 13. Projects
    results.push(this.extractProjects(projText, rawText));

    return results;
  }

  // --- Field Extractors ---

  private static extractName(contactText: string, rawText: string): ParsedFieldResult {
    const lines = (contactText || rawText).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    // Usually the very first line of contact or document is the candidate's name
    for (const line of lines.slice(0, 3)) {
      if (line.includes('@') || line.includes('http') || line.includes('.com') || /^\+?\d/.test(line)) {
        continue;
      }
      // Check if it looks like a clean name (2-4 words, capitalized)
      const words = line.split(/\s+/);
      const titleCased = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (words.length >= 2 && words.length <= 4 && /^[A-Z][a-zA-Z.'-]+(\s+[A-Z][a-zA-Z.'-]+){1,3}$/i.test(line.replace(/,/g, ''))) {
        return {
          field_id: 'NAME',
          category: 'Personal',
          field_name: 'Full Name',
          status: 'FOUND',
          value: titleCased,
          evidence: `Name detected from document header: "${line}"`,
          source_section: 'Contact',
          confidence: 0.98
        };
      }
      // If line is all uppercase name
      if (words.length >= 2 && words.length <= 4 && line === line.toUpperCase() && /^[A-Z\s.'-]+$/.test(line)) {
        return {
          field_id: 'NAME',
          category: 'Personal',
          field_name: 'Full Name',
          status: 'FOUND',
          value: words.map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
          evidence: `Name header: "${line}"`,
          source_section: 'Contact',
          confidence: 0.95
        };
      }
    }

    return {
      field_id: 'NAME',
      category: 'Personal',
      field_name: 'Full Name',
      status: 'AMBIGUOUS',
      value: lines[0] || null,
      evidence: lines[0] ? `First line candidate: "${lines[0]}"` : 'No explicit name structure detected.',
      source_section: 'Contact',
      confidence: 0.50
    };
  }

  private static extractEmail(contactText: string, rawText: string): ParsedFieldResult {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const searchScope = contactText || rawText;
    const matches = searchScope.match(emailRegex) || rawText.match(emailRegex);

    if (matches && matches.length === 1) {
      return {
        field_id: 'EMAIL',
        category: 'Personal',
        field_name: 'Email Address',
        status: 'FOUND',
        value: matches[0].toLowerCase(),
        evidence: `Direct email address match: "${matches[0]}"`,
        source_section: contactText ? 'Contact' : 'General',
        confidence: 1.0
      };
    } else if (matches && matches.length > 1) {
      return {
        field_id: 'EMAIL',
        category: 'Personal',
        field_name: 'Email Address',
        status: 'AMBIGUOUS',
        value: matches[0].toLowerCase(),
        evidence: `Multiple email addresses identified: ${matches.join(', ')}`,
        source_section: 'Contact',
        confidence: 0.8
      };
    }

    return {
      field_id: 'EMAIL',
      category: 'Personal',
      field_name: 'Email Address',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No email address evidence found in the submitted resume.',
      source_section: 'Contact',
      confidence: 1.0
    };
  }

  private static extractPhone(contactText: string, rawText: string): ParsedFieldResult {
    const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g;
    const searchScope = contactText || rawText;
    const lines = searchScope.split(/\r?\n/);
    
    for (const line of lines) {
      const match = line.match(phoneRegex);
      if (match && match[0].replace(/\D/g, '').length >= 10) {
        return {
          field_id: 'PHONE',
          category: 'Personal',
          field_name: 'Phone Number',
          status: 'FOUND',
          value: match[0].trim(),
          evidence: `Phone number detected in contact details: "${match[0].trim()}"`,
          source_section: 'Contact',
          confidence: 0.95
        };
      }
    }

    return {
      field_id: 'PHONE',
      category: 'Personal',
      field_name: 'Phone Number',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No phone number evidence found in the submitted resume.',
      source_section: 'Contact',
      confidence: 1.0
    };
  }

  private static extractLinks(contactText: string, rawText: string): ParsedFieldResult {
    const urlRegex = /(https?:\/\/(?:www\.)?(?:linkedin\.com\/in\/[A-Za-z0-9_-]+|github\.com\/[A-Za-z0-9_-]+|[A-Za-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?))/gi;
    const searchScope = contactText + '\n' + rawText;
    const matches = Array.from(new Set(searchScope.match(urlRegex) || []));

    if (matches.length > 0) {
      return {
        field_id: 'LINKS',
        category: 'Personal',
        field_name: 'LinkedIn / Portfolio',
        status: 'FOUND',
        value: matches.join(' | '),
        evidence: `Professional links detected: ${matches.join(', ')}`,
        source_section: 'Contact',
        confidence: 0.95
      };
    }

    return {
      field_id: 'LINKS',
      category: 'Personal',
      field_name: 'LinkedIn / Portfolio',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No LinkedIn or portfolio links found in the submitted resume.',
      source_section: 'Contact',
      confidence: 1.0
    };
  }

  private static extractDegree(eduText: string, rawText: string): ParsedFieldResult {
    const degreePatterns = [
      { regex: /\b(Ph\.?D\.?|Doctor of Philosophy|Doctorate)\b/i, name: 'Ph.D.' },
      { regex: /\b(M\.?S\.?|Master of Science|Master's|M\.?A\.?|MBA|Master of Business Administration)\b/i, name: 'Master of Science' },
      { regex: /\b(B\.?S\.?|Bachelor of Science|Bachelor's|B\.?A\.?|Bachelor of Arts|B\.?E\.?|B\.?Tech)\b/i, name: 'Bachelor of Science' },
      { regex: /\b(Associate of Science|Associate Degree|A\.?S\.?)\b/i, name: 'Associate Degree' }
    ];

    const searchScope = eduText || rawText;
    const lines = searchScope.split(/\r?\n/);

    for (const line of lines) {
      for (const deg of degreePatterns) {
        if (deg.regex.test(line)) {
          return {
            field_id: 'DEGREE',
            category: 'Education',
            field_name: 'Highest Degree',
            status: 'FOUND',
            value: line.trim(),
            evidence: `Degree match in education section: "${line.trim()}"`,
            source_section: 'Education',
            confidence: 0.95
          };
        }
      }
    }

    return {
      field_id: 'DEGREE',
      category: 'Education',
      field_name: 'Highest Degree',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No degree evidence found in the submitted resume.',
      source_section: 'Education',
      confidence: 1.0
    };
  }

  private static extractInstitution(eduText: string, rawText: string): ParsedFieldResult {
    const searchScope = eduText || rawText;
    const lines = searchScope.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (/\b(University|College|Institute|Academy|School of|Polytechnic)\b/i.test(line)) {
        return {
          field_id: 'INSTITUTION',
          category: 'Education',
          field_name: 'Institution',
          status: 'FOUND',
          value: line,
          evidence: `Educational institution match: "${line}"`,
          source_section: 'Education',
          confidence: 0.95
        };
      }
    }

    return {
      field_id: 'INSTITUTION',
      category: 'Education',
      field_name: 'Institution',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No university or educational institution found in the submitted resume.',
      source_section: 'Education',
      confidence: 1.0
    };
  }

  private static extractGradYear(eduText: string, rawText: string): ParsedFieldResult {
    const yearRegex = /\b(19\d\d|20\d\d)\b/g;
    const searchScope = eduText || rawText;
    const lines = searchScope.split(/\r?\n/);

    for (const line of lines) {
      if (/\b(Graduated|Class of|Degree|Graduation|Completed)\b/i.test(line) || eduText) {
        const matches = line.match(yearRegex);
        if (matches) {
          const maxYear = Math.max(...matches.map(Number));
          return {
            field_id: 'GRAD_YEAR',
            category: 'Education',
            field_name: 'Graduation Year',
            status: 'FOUND',
            value: String(maxYear),
            evidence: `Graduation year match in education line: "${line.trim()}"`,
            source_section: 'Education',
            confidence: 0.90
          };
        }
      }
    }

    return {
      field_id: 'GRAD_YEAR',
      category: 'Education',
      field_name: 'Graduation Year',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No graduation year evidence found in the submitted resume.',
      source_section: 'Education',
      confidence: 1.0
    };
  }

  private static extractRecentJobTitle(expText: string, summaryText: string, rawText: string): ParsedFieldResult {
    const titleRegex = /\b(Senior|Lead|Principal|Staff|Junior|Mid-level)?\s*(Software Engineer|Backend Engineer|Frontend Engineer|Full-Stack Developer|Full Stack Engineer|Data Engineer|DevOps Engineer|Cloud Architect|Product Manager|Engineering Manager|System Administrator|QA Engineer|Machine Learning Engineer|Solutions Architect)\b/i;
    
    const searchLines = (expText + '\n' + summaryText).split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of searchLines) {
      const match = line.match(titleRegex);
      if (match) {
        return {
          field_id: 'JOB_TITLE',
          category: 'Experience',
          field_name: 'Most Recent Job Title',
          status: 'FOUND',
          value: match[0].trim(),
          evidence: `Job title detected in experience section: "${line}"`,
          source_section: expText.includes(line) ? 'Experience' : 'Summary',
          confidence: 0.92
        };
      }
    }

    return {
      field_id: 'JOB_TITLE',
      category: 'Experience',
      field_name: 'Most Recent Job Title',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No explicit job title found in the submitted resume.',
      source_section: 'Experience',
      confidence: 1.0
    };
  }

  private static extractRecentCompany(expText: string, rawText: string): ParsedFieldResult {
    const lines = expText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const companyPatterns = [
      /([A-Z][a-zA-Z0-9\s&.,'-]+)\s*[-–—|]\s*(?:20\d\d|19\d\d|Present)/i,
      /(?:at|@)\s+([A-Z][a-zA-Z0-9\s&.,'-]+)/i,
      /([A-Z][a-zA-Z0-9\s&]+(?:Systems|Solutions|Labs|Technologies|Corp|Inc|LLC|Tech|Software|Networks))/i
    ];

    for (const line of lines) {
      for (const pattern of companyPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const comp = match[1].trim();
          if (comp.length > 2 && comp.length < 50 && !comp.toLowerCase().includes('engineer')) {
            return {
              field_id: 'COMPANY',
              category: 'Experience',
              field_name: 'Most Recent Company',
              status: 'FOUND',
              value: comp,
              evidence: `Company detected in experience record: "${line}"`,
              source_section: 'Experience',
              confidence: 0.90
            };
          }
        }
      }
    }

    return {
      field_id: 'COMPANY',
      category: 'Experience',
      field_name: 'Most Recent Company',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No recent company name found in the submitted resume.',
      source_section: 'Experience',
      confidence: 1.0
    };
  }

  private static extractLocation(contactText: string, rawText: string): ParsedFieldResult {
    const locationRegex = /\b([A-Z][a-zA-Z\s.-]+),\s*([A-Z]{2}|[A-Z][a-zA-Z\s]+)\b/;
    const searchScope = contactText || rawText;
    const lines = searchScope.split(/\r?\n/);

    for (const line of lines.slice(0, 8)) {
      if (line.includes('@') || line.includes('http')) continue;
      const match = line.match(locationRegex);
      if (match) {
        return {
          field_id: 'LOCATION',
          category: 'Personal',
          field_name: 'Location',
          status: 'FOUND',
          value: match[0].trim(),
          evidence: `Location detected in header/contact details: "${match[0].trim()}"`,
          source_section: 'Contact',
          confidence: 0.92
        };
      }
    }

    return {
      field_id: 'LOCATION',
      category: 'Personal',
      field_name: 'Location',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No geographic location found in the submitted resume.',
      source_section: 'Contact',
      confidence: 1.0
    };
  }

  private static extractSkills(skillsText: string, expText: string, rawText: string): ParsedFieldResult {
    const knownSkills = [
      'Python', 'FastAPI', 'Django', 'Flask', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'TypeScript', 'JavaScript', 'React', 'Next.js',
      'Vue', 'Angular', 'Node.js', 'Express', 'Java', 'Spring', 'C++', 'Go', 'Rust', 'GraphQL',
      'REST APIs', 'CI/CD', 'Git', 'Linux', 'TailwindCSS', 'Terraform', 'Kafka', 'Elasticsearch'
    ];

    const textToSearch = (skillsText + '\n' + expText + '\n' + rawText);
    const foundSkills: string[] = [];

    for (const skill of knownSkills) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(textToSearch)) {
        foundSkills.push(skill);
      }
    }

    if (foundSkills.length > 0) {
      const evidenceStr = skillsText 
        ? `Skills section: "${skillsText.slice(0, 180)}..."` 
        : `Identified skills in resume text: ${foundSkills.slice(0, 8).join(', ')}`;

      return {
        field_id: 'SKILLS-LIST',
        category: 'Skills',
        field_name: 'Skills',
        status: 'FOUND',
        value: foundSkills.join(', '),
        evidence: evidenceStr,
        source_section: skillsText ? 'Skills' : 'Experience',
        confidence: 0.98
      };
    }

    return {
      field_id: 'SKILLS-LIST',
      category: 'Skills',
      field_name: 'Skills',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No explicit skills list or recognized technologies found in the submitted resume.',
      source_section: 'Skills',
      confidence: 1.0
    };
  }

  private static extractCertifications(certsText: string, rawText: string): ParsedFieldResult {
    if (certsText && certsText.trim().length > 10) {
      const lines = certsText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      return {
        field_id: 'CERTS',
        category: 'Certifications',
        field_name: 'Certifications',
        status: 'FOUND',
        value: lines.join('; '),
        evidence: `Certifications section content: "${certsText.slice(0, 150)}"`,
        source_section: 'Certifications',
        confidence: 0.95
      };
    }

    // Check for inline certifications in rawText
    const certPatterns = /\b(AWS Certified|Certified Kubernetes|CKA|CKAD|CISSP|PMP|CompTIA|GCP Certified|Microsoft Certified)\b/i;
    const match = rawText.match(certPatterns);
    if (match) {
      return {
        field_id: 'CERTS',
        category: 'Certifications',
        field_name: 'Certifications',
        status: 'FOUND',
        value: match[0],
        evidence: `Certification credential detected in text: "${match[0]}"`,
        source_section: 'General',
        confidence: 0.90
      };
    }

    return {
      field_id: 'CERTS',
      category: 'Certifications',
      field_name: 'Certifications',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No certification credentials found in the submitted resume.',
      source_section: 'Certifications',
      confidence: 1.0
    };
  }

  private static extractProjects(projText: string, rawText: string): ParsedFieldResult {
    if (projText && projText.trim().length > 10) {
      const lines = projText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      return {
        field_id: 'PROJECTS',
        category: 'Projects',
        field_name: 'Projects',
        status: 'FOUND',
        value: lines.slice(0, 3).join(' | '),
        evidence: `Projects section content: "${projText.slice(0, 160)}"`,
        source_section: 'Projects',
        confidence: 0.95
      };
    }

    return {
      field_id: 'PROJECTS',
      category: 'Projects',
      field_name: 'Projects',
      status: 'NOT_FOUND',
      value: null,
      evidence: 'No dedicated project portfolio or projects section found in the submitted resume.',
      source_section: 'Projects',
      confidence: 1.0
    };
  }
}
