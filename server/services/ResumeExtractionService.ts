import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ExtractedDocument {
  rawText: string;
  paragraphs: string[];
  headings: string[];
  pageCount: number;
  extractionWarnings: string[];
  hasTextLayer: boolean;
  fileType: string;
  status: 'COMPLETED' | 'UNKNOWN' | 'FAILED' | 'UNSUPPORTED';
  failureReason?: string;
}

export class ResumeExtractionService {
  /**
   * Shared extractor interface for PDF and DOCX documents.
   */
  static async extract(buffer: Buffer, originalFilename: string, mimeType?: string): Promise<ExtractedDocument> {
    const ext = originalFilename.split('.').pop()?.toLowerCase() || '';
    const warnings: string[] = [];

    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return this.extractPDF(buffer, warnings);
    } else if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.extractDOCX(buffer, warnings);
    } else if (ext === 'doc') {
      return {
        rawText: '',
        paragraphs: [],
        headings: [],
        pageCount: 0,
        extractionWarnings: ['Legacy .doc format requires conversion to modern .docx or .pdf.'],
        hasTextLayer: false,
        fileType: 'doc',
        status: 'UNSUPPORTED',
        failureReason: 'Legacy .doc format is unsupported. Please upload .pdf or .docx'
      };
    } else {
      return {
        rawText: '',
        paragraphs: [],
        headings: [],
        pageCount: 0,
        extractionWarnings: [`Unsupported file format: .${ext}`],
        hasTextLayer: false,
        fileType: ext,
        status: 'UNSUPPORTED',
        failureReason: `Unsupported file extension .${ext}. Only PDF and DOCX are supported.`
      };
    }
  }

  private static async extractPDF(buffer: Buffer, warnings: string[]): Promise<ExtractedDocument> {
    try {
      const data = await pdfParse(buffer);
      const rawText = data.text ? data.text.trim() : '';

      // Check if text layer is present
      if (!rawText || rawText.replace(/\s+/g, '').length < 20) {
        return {
          rawText: '',
          paragraphs: [],
          headings: [],
          pageCount: data.numpages || 1,
          extractionWarnings: ['No text layer detected in PDF. The document may be an image or scanned document.'],
          hasTextLayer: false,
          fileType: 'pdf',
          status: 'UNKNOWN',
          failureReason: 'No text layer detected.'
        };
      }

      // Check for two-column or unusual line formatting
      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const paragraphs: string[] = [];
      let currentPara = '';

      for (const line of lines) {
        if (line.length === 0) {
          if (currentPara) {
            paragraphs.push(currentPara);
            currentPara = '';
          }
        } else {
          currentPara += (currentPara ? ' ' : '') + line;
        }
      }
      if (currentPara) paragraphs.push(currentPara);

      // Detect potential headings (all caps or short lines)
      const headings = lines.filter(line => 
        line.length <= 40 && 
        (line === line.toUpperCase() && /[A-Z]/.test(line) || /^[A-Z][a-zA-Z\s]{2,25}:?$/.test(line))
      );

      if (data.numpages > 5) {
        warnings.push('Document length exceeds standard 1-3 page resume guidelines.');
      }

      return {
        rawText,
        paragraphs,
        headings,
        pageCount: data.numpages || 1,
        extractionWarnings: warnings,
        hasTextLayer: true,
        fileType: 'pdf',
        status: 'COMPLETED'
      };
    } catch (err: any) {
      return {
        rawText: '',
        paragraphs: [],
        headings: [],
        pageCount: 0,
        extractionWarnings: [`PDF parsing failed: ${err.message}`],
        hasTextLayer: false,
        fileType: 'pdf',
        status: 'FAILED',
        failureReason: `Corrupted or unreadable PDF: ${err.message}`
      };
    }
  }

  private static async extractDOCX(buffer: Buffer, warnings: string[]): Promise<ExtractedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value ? result.value.trim() : '';

      if (!rawText || rawText.replace(/\s+/g, '').length < 20) {
        return {
          rawText: '',
          paragraphs: [],
          headings: [],
          pageCount: 1,
          extractionWarnings: ['Empty or non-text DOCX document.'],
          hasTextLayer: false,
          fileType: 'docx',
          status: 'UNKNOWN',
          failureReason: 'No text layer detected in DOCX.'
        };
      }

      if (result.messages && result.messages.length > 0) {
        result.messages.forEach(m => warnings.push(m.message));
      }

      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const paragraphs = lines.filter(l => l.length > 30);
      const headings = lines.filter(line => 
        line.length <= 40 && 
        (line === line.toUpperCase() && /[A-Z]/.test(line) || /^[A-Z][a-zA-Z\s]{2,25}:?$/.test(line))
      );

      return {
        rawText,
        paragraphs,
        headings,
        pageCount: Math.ceil(lines.length / 45) || 1,
        extractionWarnings: warnings,
        hasTextLayer: true,
        fileType: 'docx',
        status: 'COMPLETED'
      };
    } catch (err: any) {
      return {
        rawText: '',
        paragraphs: [],
        headings: [],
        pageCount: 0,
        extractionWarnings: [`DOCX parsing error: ${err.message}`],
        hasTextLayer: false,
        fileType: 'docx',
        status: 'FAILED',
        failureReason: `Corrupted or invalid DOCX: ${err.message}`
      };
    }
  }
}
