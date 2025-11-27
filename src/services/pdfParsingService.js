/**
 * PDF Parsing Service for P&ID Tag Extraction
 * Extracts equipment and instrument tags from P&ID documents
 * Following ISA 5.1 standard for instrument identification
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

class PDFParsingService {
  constructor() {
    // ISA 5.1 Standard Tag Patterns
    this.tagPatterns = {
      // Equipment tags: Letter(s)-Number(s) with optional suffixes
      equipment: [
        /\b[A-Z]{1,3}-\d{4}[A-Z]?\b/g,        // K-2801, V-3701A
        /\b[A-Z]{1,3}\d{4}[A-Z]?\b/g,         // K2801, V3701A
        /\b[A-Z]{1,3}-\d{3}[A-Z]?\b/g,        // P-101, C-201B
        /\b[A-Z]{1,3}\s*-\s*\d{4}[A-Z]?\b/g,  // K - 2801
      ],

      // Instrument tags with loop numbers
      instruments: [
        /\b[A-Z]{2,4}-\d{4,6}\b/g,            // PIC-10001, LIC-2002
        /\b[A-Z]{2,4}\d{4,6}\b/g,             // PIC10001, LIC2002
        /\b[A-Z]{1}[A-Z]{1,3}-\d{3,5}\b/g,    // PT-101, FT-2001
        /\b[A-Z]{2,4}\s*-\s*\d{4,6}\b/g,      // PIC - 10001
      ],

      // Control valves and special equipment
      controlValves: [
        /\b[A-Z]{2,3}V-\d{3,4}[A-Z]?\b/g,     // PCV-101, FCV-2001
        /\b[A-Z]{2,3}V\d{3,4}[A-Z]?\b/g,      // PCV101, FCV2001
        /\bHV-\d{3,4}[A-Z]?\b/g,              // HV-101 (Hand Valve)
        /\bXV-\d{3,4}[A-Z]?\b/g,              // XV-101 (Safety Valve)
      ],

      // Line numbers (process lines)
      lineNumbers: [
        /\b\d{1,3}"-[A-Z]{1,3}-\d{4,6}\b/g,   // 6"-PG-10001 (size-service-number)
        /\b\d{1,3}['']?-[A-Z]{1,3}-\d{4,6}\b/g, // 6'-PG-10001
      ]
    };

    // ISA 5.1 First Letter Designations
    this.isaFirstLetters = {
      A: 'Analysis',
      B: 'Burner/Combustion',
      C: 'Conductivity',
      D: 'Density/Specific Gravity',
      E: 'Voltage',
      F: 'Flow',
      G: 'Gauging/Position',
      H: 'Hand',
      I: 'Current',
      J: 'Power',
      K: 'Time/Schedule',
      L: 'Level',
      M: 'Moisture/Humidity',
      N: 'User Choice',
      O: 'User Choice',
      P: 'Pressure/Vacuum',
      Q: 'Quantity',
      R: 'Radiation',
      S: 'Speed/Frequency',
      T: 'Temperature',
      U: 'Multivariable',
      V: 'Vibration',
      W: 'Weight/Force',
      X: 'Unclassified',
      Y: 'Event/State',
      Z: 'Position/Dimension'
    };

    // ISA 5.1 Succeeding Letter Functions
    this.isaSucceedingLetters = {
      A: 'Alarm',
      B: 'User Choice',
      C: 'Control',
      D: 'Differential',
      E: 'Element',
      F: 'Ratio',
      G: 'Glass/Gauge',
      H: 'High',
      I: 'Indicate',
      J: 'Scan',
      K: 'Control Station',
      L: 'Light/Low',
      M: 'Middle/Intermediate',
      N: 'User Choice',
      O: 'Orifice',
      P: 'Point/Test',
      Q: 'Integrate/Totalize',
      R: 'Record',
      S: 'Switch',
      T: 'Transmit',
      U: 'Multifunction',
      V: 'Valve',
      W: 'Well',
      X: 'Unclassified',
      Y: 'Relay/Compute',
      Z: 'Driver/Actuator'
    };

    // Common equipment type codes
    this.equipmentCodes = {
      // Vessels
      V: 'Vessel',
      T: 'Tower/Column',
      D: 'Drum',
      TK: 'Tank',

      // Rotating Equipment
      P: 'Pump',
      K: 'Compressor',
      B: 'Blower',
      F: 'Fan',
      A: 'Agitator',
      M: 'Motor',

      // Heat Transfer
      E: 'Exchanger',
      H: 'Heater',
      C: 'Cooler',
      R: 'Reactor',

      // Other
      S: 'Separator',
      FLT: 'Filter',
      MX: 'Mixer',
      Y: 'Strainer'
    };
  }

  /**
   * Extract tags from a PDF file
   * @param {File} file - PDF file to parse
   * @returns {Promise<Object>} Extracted tags and metadata
   */
  async extractTags(file) {
    try {
      const startTime = performance.now();

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const extractedData = {
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          pageCount: numPages,
          extractionDate: new Date().toISOString(),
          processingTime: 0
        },
        tags: {
          equipment: new Map(),
          instruments: new Map(),
          controlValves: new Map(),
          lineNumbers: new Map()
        },
        summary: {
          totalTags: 0,
          equipmentCount: 0,
          instrumentCount: 0,
          controlValveCount: 0,
          lineNumberCount: 0
        },
        pageDetails: []
      };

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');

        const pageTags = this.extractTagsFromText(pageText);

        // Aggregate tags
        pageTags.equipment.forEach(tag => {
          const existing = extractedData.tags.equipment.get(tag.tag) || { ...tag, occurrences: [] };
          existing.occurrences.push({ page: pageNum, context: tag.context });
          extractedData.tags.equipment.set(tag.tag, existing);
        });

        pageTags.instruments.forEach(tag => {
          const existing = extractedData.tags.instruments.get(tag.tag) || { ...tag, occurrences: [] };
          existing.occurrences.push({ page: pageNum, context: tag.context });
          extractedData.tags.instruments.set(tag.tag, existing);
        });

        pageTags.controlValves.forEach(tag => {
          const existing = extractedData.tags.controlValves.get(tag.tag) || { ...tag, occurrences: [] };
          existing.occurrences.push({ page: pageNum, context: tag.context });
          extractedData.tags.controlValves.set(tag.tag, existing);
        });

        pageTags.lineNumbers.forEach(tag => {
          const existing = extractedData.tags.lineNumbers.get(tag.tag) || { ...tag, occurrences: [] };
          existing.occurrences.push({ page: pageNum, context: tag.context });
          extractedData.tags.lineNumbers.set(tag.tag, existing);
        });

        extractedData.pageDetails.push({
          pageNumber: pageNum,
          tagsFound: pageTags.equipment.length + pageTags.instruments.length +
                    pageTags.controlValves.length + pageTags.lineNumbers.length
        });
      }

      // Convert Maps to Arrays and update summary
      extractedData.tags.equipment = Array.from(extractedData.tags.equipment.values());
      extractedData.tags.instruments = Array.from(extractedData.tags.instruments.values());
      extractedData.tags.controlValves = Array.from(extractedData.tags.controlValves.values());
      extractedData.tags.lineNumbers = Array.from(extractedData.tags.lineNumbers.values());

      // Update summary counts
      extractedData.summary.equipmentCount = extractedData.tags.equipment.length;
      extractedData.summary.instrumentCount = extractedData.tags.instruments.length;
      extractedData.summary.controlValveCount = extractedData.tags.controlValves.length;
      extractedData.summary.lineNumberCount = extractedData.tags.lineNumbers.length;
      extractedData.summary.totalTags = extractedData.summary.equipmentCount +
                                      extractedData.summary.instrumentCount +
                                      extractedData.summary.controlValveCount +
                                      extractedData.summary.lineNumberCount;

      // Calculate processing time
      extractedData.metadata.processingTime = Math.round(performance.now() - startTime);

      return extractedData;

    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Extract tags from text content
   * @param {string} text - Text to parse
   * @returns {Object} Extracted tags by category
   */
  extractTagsFromText(text) {
    const results = {
      equipment: [],
      instruments: [],
      controlValves: [],
      lineNumbers: []
    };

    // Normalize text (remove excessive whitespace)
    text = text.replace(/\s+/g, ' ');

    // Extract equipment tags
    this.tagPatterns.equipment.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const normalized = this.normalizeTag(match);
        if (this.isValidEquipmentTag(normalized) && !this.isDuplicate(results.equipment, normalized)) {
          results.equipment.push({
            tag: normalized,
            type: this.identifyEquipmentType(normalized),
            description: this.generateDescription(normalized, 'equipment'),
            context: this.extractContext(text, match)
          });
        }
      });
    });

    // Extract instrument tags
    this.tagPatterns.instruments.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const normalized = this.normalizeTag(match);
        if (this.isValidInstrumentTag(normalized) && !this.isDuplicate(results.instruments, normalized)) {
          results.instruments.push({
            tag: normalized,
            type: this.identifyInstrumentType(normalized),
            description: this.generateDescription(normalized, 'instrument'),
            context: this.extractContext(text, match)
          });
        }
      });
    });

    // Extract control valve tags
    this.tagPatterns.controlValves.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const normalized = this.normalizeTag(match);
        if (!this.isDuplicate(results.controlValves, normalized)) {
          results.controlValves.push({
            tag: normalized,
            type: 'Control Valve',
            description: this.generateDescription(normalized, 'controlValve'),
            context: this.extractContext(text, match)
          });
        }
      });
    });

    // Extract line numbers
    this.tagPatterns.lineNumbers.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const normalized = this.normalizeTag(match);
        if (!this.isDuplicate(results.lineNumbers, normalized)) {
          results.lineNumbers.push({
            tag: normalized,
            type: 'Process Line',
            description: this.generateDescription(normalized, 'line'),
            context: this.extractContext(text, match)
          });
        }
      });
    });

    return results;
  }

  /**
   * Normalize a tag (remove spaces, uppercase)
   */
  normalizeTag(tag) {
    return tag.replace(/\s+/g, '').toUpperCase();
  }

  /**
   * Check if tag is valid equipment tag
   */
  isValidEquipmentTag(tag) {
    // Extract prefix letters
    const match = tag.match(/^([A-Z]{1,3})/);
    if (!match) return false;

    const prefix = match[1];
    return this.equipmentCodes.hasOwnProperty(prefix);
  }

  /**
   * Check if tag is valid instrument tag
   */
  isValidInstrumentTag(tag) {
    // Must have at least 2 letters at start
    const match = tag.match(/^([A-Z]{2,4})/);
    if (!match) return false;

    const letters = match[1];
    // Check if first letter is valid ISA designation
    return this.isaFirstLetters.hasOwnProperty(letters[0]);
  }

  /**
   * Identify equipment type from tag
   */
  identifyEquipmentType(tag) {
    const match = tag.match(/^([A-Z]{1,3})/);
    if (match && this.equipmentCodes[match[1]]) {
      return this.equipmentCodes[match[1]];
    }
    return 'Equipment';
  }

  /**
   * Identify instrument type from tag
   */
  identifyInstrumentType(tag) {
    const match = tag.match(/^([A-Z]{2,4})/);
    if (match) {
      const letters = match[1];
      const variable = this.isaFirstLetters[letters[0]] || 'Unknown';
      const functions = letters.slice(1).split('').map(l =>
        this.isaSucceedingLetters[l] || ''
      ).filter(f => f).join('/');

      return `${variable} ${functions}`.trim();
    }
    return 'Instrument';
  }

  /**
   * Generate description for a tag
   */
  generateDescription(tag, category) {
    switch (category) {
      case 'equipment':
        return `${this.identifyEquipmentType(tag)} - ${tag}`;
      case 'instrument':
        return `${this.identifyInstrumentType(tag)} - ${tag}`;
      case 'controlValve':
        return `Control Valve - ${tag}`;
      case 'line':
        return `Process Line - ${tag}`;
      default:
        return tag;
    }
  }

  /**
   * Extract context around a match
   */
  extractContext(text, match) {
    const index = text.indexOf(match);
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + match.length + 30);
    return '...' + text.slice(start, end) + '...';
  }

  /**
   * Check if tag already exists in results
   */
  isDuplicate(array, tag) {
    return array.some(item => item.tag === tag);
  }

  /**
   * Generate tag statistics
   */
  generateStatistics(extractedData) {
    const stats = {
      byType: {},
      byPage: {},
      duplicates: 0,
      unique: extractedData.summary.totalTags
    };

    // Count by equipment type
    extractedData.tags.equipment.forEach(tag => {
      stats.byType[tag.type] = (stats.byType[tag.type] || 0) + 1;
    });

    // Count by page
    extractedData.pageDetails.forEach(page => {
      stats.byPage[`Page ${page.pageNumber}`] = page.tagsFound;
    });

    return stats;
  }
}

// Create singleton instance
const pdfParsingService = new PDFParsingService();

export default pdfParsingService;