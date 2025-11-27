/**
 * Excel Export Service for ADNOC Tag Creation Sheet Generation
 * Generates standardized Excel sheets for tag management
 * Following ADNOC standards for equipment and instrument tagging
 */

import * as XLSX from 'xlsx';

class ExcelExportService {
  constructor() {
    // ADNOC Tag Creation Sheet columns
    this.tagSheetColumns = [
      { field: 'sno', header: 'S.No', width: 10 },
      { field: 'tagNumber', header: 'Tag Number', width: 20 },
      { field: 'tagDescription', header: 'Tag Description', width: 40 },
      { field: 'tagType', header: 'Tag Type', width: 20 },
      { field: 'service', header: 'Service', width: 25 },
      { field: 'pidNumber', header: 'P&ID Number', width: 20 },
      { field: 'pidRevision', header: 'P&ID Revision', width: 15 },
      { field: 'area', header: 'Area', width: 15 },
      { field: 'unit', header: 'Unit', width: 15 },
      { field: 'system', header: 'System', width: 20 },
      { field: 'subSystem', header: 'Sub-System', width: 20 },
      { field: 'equipmentType', header: 'Equipment Type', width: 20 },
      { field: 'manufacturer', header: 'Manufacturer', width: 25 },
      { field: 'model', header: 'Model', width: 20 },
      { field: 'serialNumber', header: 'Serial Number', width: 20 },
      { field: 'capacity', header: 'Capacity', width: 15 },
      { field: 'operatingPressure', header: 'Operating Pressure', width: 20 },
      { field: 'operatingTemperature', header: 'Operating Temperature', width: 22 },
      { field: 'designPressure', header: 'Design Pressure', width: 18 },
      { field: 'designTemperature', header: 'Design Temperature', width: 20 },
      { field: 'material', header: 'Material', width: 20 },
      { field: 'insulation', header: 'Insulation', width: 15 },
      { field: 'paintSpec', header: 'Paint Specification', width: 20 },
      { field: 'criticalityRating', header: 'Criticality Rating', width: 18 },
      { field: 'safetyClass', header: 'Safety Classification', width: 20 },
      { field: 'comments', header: 'Comments', width: 30 },
      { field: 'dateAdded', header: 'Date Added', width: 15 },
      { field: 'addedBy', header: 'Added By', width: 20 },
      { field: 'verificationStatus', header: 'Verification Status', width: 20 },
      { field: 'verifiedBy', header: 'Verified By', width: 20 },
      { field: 'verificationDate', header: 'Verification Date', width: 18 }
    ];

    // Equipment categories for ADNOC
    this.equipmentCategories = {
      'ROTATING': ['Pump', 'Compressor', 'Blower', 'Fan', 'Turbine', 'Motor', 'Agitator'],
      'STATIC': ['Vessel', 'Tower', 'Tank', 'Drum', 'Separator', 'Filter'],
      'HEAT_TRANSFER': ['Exchanger', 'Heater', 'Cooler', 'Condenser', 'Reboiler'],
      'INSTRUMENTATION': ['Transmitter', 'Controller', 'Indicator', 'Recorder', 'Analyzer'],
      'VALVES': ['Control Valve', 'Safety Valve', 'Relief Valve', 'Block Valve', 'Check Valve'],
      'PIPING': ['Process Line', 'Utility Line', 'Drain Line', 'Vent Line']
    };

    // Standard operating parameters
    this.standardParameters = {
      pressure: {
        units: ['barg', 'psig', 'kPa', 'MPa'],
        ranges: {
          low: '0-10 barg',
          medium: '10-50 barg',
          high: '50-100 barg',
          veryHigh: '>100 barg'
        }
      },
      temperature: {
        units: ['°C', '°F', 'K'],
        ranges: {
          cryogenic: '<-50°C',
          cold: '-50 to 0°C',
          ambient: '0 to 50°C',
          medium: '50 to 200°C',
          high: '200 to 400°C',
          veryHigh: '>400°C'
        }
      }
    };

    // Criticality matrix
    this.criticalityMatrix = {
      A: 'Critical - Safety/Environmental Impact',
      B: 'Essential - Production Critical',
      C: 'Important - Quality/Efficiency Impact',
      D: 'Standard - General Service',
      E: 'Non-Critical - Utility Service'
    };
  }

  /**
   * Generate ADNOC Tag Creation Sheet
   * @param {Object} extractedData - Data from PDF parsing
   * @param {Object} project - Project information
   * @param {Object} process - Process information
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Blob>} Excel file as Blob
   */
  async generateTagSheet(extractedData, project, process, metadata = {}) {
    try {
      // Create new workbook
      const wb = XLSX.utils.book_new();

      // Set workbook properties
      wb.Props = {
        Title: `Tag Creation Sheet - ${project.name}`,
        Subject: `P&ID Tags for ${process ? process.name : project.name}`,
        Author: metadata.author || 'AIMS System',
        CreatedDate: new Date(),
        Company: project.client_name || 'ADNOC',
        Keywords: 'P&ID, Tags, Equipment, Instrumentation, ADNOC'
      };

      // Create sheets
      this.createSummarySheet(wb, extractedData, project, process);
      this.createEquipmentSheet(wb, extractedData.tags.equipment || [], project, process);
      this.createInstrumentSheet(wb, extractedData.tags.instruments || [], project, process);
      this.createValveSheet(wb, extractedData.tags.controlValves || [], project, process);
      this.createLineListSheet(wb, extractedData.tags.lineNumbers || [], project, process);
      this.createMasterTagSheet(wb, extractedData, project, process);
      this.createStatisticsSheet(wb, extractedData);
      this.createConfigSheet(wb, project, process);

      // Apply styling to all sheets
      this.applyADNOCFormatting(wb);

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true,
        compression: true
      });

      // Create Blob
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      return blob;

    } catch (error) {
      console.error('Error generating Excel:', error);
      throw new Error(`Failed to generate Excel: ${error.message}`);
    }
  }

  /**
   * Create Summary Sheet
   */
  createSummarySheet(wb, extractedData, project, process) {
    const summaryData = [
      ['TAG CREATION SHEET - SUMMARY'],
      [],
      ['Project Information'],
      ['Project Name:', project.name],
      ['Client:', project.client_name || 'ADNOC'],
      ['Site:', process?.site || project.site_default],
      ['Unit:', process?.unit_code || project.unit_code_default],
      ['Process:', process?.name || 'N/A'],
      [],
      ['Document Information'],
      ['P&ID File:', extractedData.metadata.fileName],
      ['Pages:', extractedData.metadata.pageCount],
      ['Extraction Date:', new Date(extractedData.metadata.extractionDate).toLocaleString()],
      ['Processing Time:', `${extractedData.metadata.processingTime}ms`],
      [],
      ['Tag Summary'],
      ['Total Tags Extracted:', extractedData.summary.totalTags],
      ['Equipment Tags:', extractedData.summary.equipmentCount],
      ['Instrument Tags:', extractedData.summary.instrumentCount],
      ['Control Valves:', extractedData.summary.controlValveCount],
      ['Line Numbers:', extractedData.summary.lineNumberCount],
      [],
      ['Verification Status'],
      ['Unverified:', extractedData.summary.totalTags],
      ['Verified:', 0],
      ['Rejected:', 0],
      [],
      ['Generated By:', 'AIMS - Asset Information Management System'],
      ['Version:', process.env.VITE_APP_VERSION || '1.0.0'],
      ['Date:', new Date().toLocaleString()]
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 50 }
    ];

    // Apply header styling
    this.applyCellStyle(ws, 'A1', {
      font: { bold: true, size: 16 },
      fill: { fgColor: { rgb: '004C8C' } },
      alignment: { horizontal: 'center' }
    });

    // Apply section headers styling
    ['A3', 'A10', 'A16', 'A23'].forEach(cell => {
      this.applyCellStyle(ws, cell, {
        font: { bold: true, size: 12 },
        fill: { fgColor: { rgb: 'E6F2FF' } }
      });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  }

  /**
   * Create Equipment Sheet
   */
  createEquipmentSheet(wb, equipment, project, process) {
    const headers = this.tagSheetColumns.map(col => col.header);
    const data = [headers];

    equipment.forEach((item, index) => {
      const row = this.tagSheetColumns.map(col => {
        switch (col.field) {
          case 'sno': return index + 1;
          case 'tagNumber': return item.tag;
          case 'tagDescription': return item.description;
          case 'tagType': return 'Equipment';
          case 'service': return item.type;
          case 'pidNumber': return process?.name || project.name;
          case 'pidRevision': return 'Rev. 0';
          case 'area': return process?.site || project.site_default;
          case 'unit': return process?.unit_code || project.unit_code_default;
          case 'system': return this.identifySystem(item.tag);
          case 'subSystem': return this.identifySubSystem(item.tag);
          case 'equipmentType': return item.type;
          case 'criticalityRating': return 'TBD';
          case 'safetyClass': return 'TBD';
          case 'dateAdded': return new Date().toLocaleDateString();
          case 'addedBy': return 'AIMS System';
          case 'verificationStatus': return 'Pending';
          default: return '';
        }
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = this.tagSheetColumns.map(col => ({ wch: col.width }));

    // Apply header row styling
    this.applyHeaderRowStyle(ws, headers.length);

    // Add filters
    ws['!autofilter'] = { ref: `A1:${this.getColumnLetter(headers.length)}${data.length}` };

    XLSX.utils.book_append_sheet(wb, ws, 'Equipment');
  }

  /**
   * Create Instrument Sheet
   */
  createInstrumentSheet(wb, instruments, project, process) {
    const headers = this.tagSheetColumns.map(col => col.header);
    const data = [headers];

    instruments.forEach((item, index) => {
      const row = this.tagSheetColumns.map(col => {
        switch (col.field) {
          case 'sno': return index + 1;
          case 'tagNumber': return item.tag;
          case 'tagDescription': return item.description;
          case 'tagType': return 'Instrument';
          case 'service': return item.type;
          case 'pidNumber': return process?.name || project.name;
          case 'pidRevision': return 'Rev. 0';
          case 'area': return process?.site || project.site_default;
          case 'unit': return process?.unit_code || project.unit_code_default;
          case 'system': return this.identifySystem(item.tag);
          case 'subSystem': return this.identifySubSystem(item.tag);
          case 'equipmentType': return 'Instrumentation';
          case 'criticalityRating': return this.assignCriticality(item.type);
          case 'safetyClass': return this.assignSafetyClass(item.type);
          case 'dateAdded': return new Date().toLocaleDateString();
          case 'addedBy': return 'AIMS System';
          case 'verificationStatus': return 'Pending';
          default: return '';
        }
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = this.tagSheetColumns.map(col => ({ wch: col.width }));

    // Apply header row styling
    this.applyHeaderRowStyle(ws, headers.length);

    // Add filters
    ws['!autofilter'] = { ref: `A1:${this.getColumnLetter(headers.length)}${data.length}` };

    XLSX.utils.book_append_sheet(wb, ws, 'Instruments');
  }

  /**
   * Create Valve Sheet
   */
  createValveSheet(wb, valves, project, process) {
    const headers = this.tagSheetColumns.map(col => col.header);
    const data = [headers];

    valves.forEach((item, index) => {
      const row = this.tagSheetColumns.map(col => {
        switch (col.field) {
          case 'sno': return index + 1;
          case 'tagNumber': return item.tag;
          case 'tagDescription': return item.description;
          case 'tagType': return 'Valve';
          case 'service': return item.type;
          case 'pidNumber': return process?.name || project.name;
          case 'pidRevision': return 'Rev. 0';
          case 'area': return process?.site || project.site_default;
          case 'unit': return process?.unit_code || project.unit_code_default;
          case 'system': return this.identifySystem(item.tag);
          case 'subSystem': return this.identifySubSystem(item.tag);
          case 'equipmentType': return 'Control Valve';
          case 'criticalityRating': return 'B';
          case 'safetyClass': return this.isValveSafety(item.tag) ? 'SIL-1' : 'Non-SIS';
          case 'dateAdded': return new Date().toLocaleDateString();
          case 'addedBy': return 'AIMS System';
          case 'verificationStatus': return 'Pending';
          default: return '';
        }
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = this.tagSheetColumns.map(col => ({ wch: col.width }));

    // Apply header row styling
    this.applyHeaderRowStyle(ws, headers.length);

    // Add filters
    ws['!autofilter'] = { ref: `A1:${this.getColumnLetter(headers.length)}${data.length}` };

    XLSX.utils.book_append_sheet(wb, ws, 'Valves');
  }

  /**
   * Create Line List Sheet
   */
  createLineListSheet(wb, lines, project, process) {
    const lineHeaders = [
      'S.No', 'Line Number', 'Size', 'Service Code', 'Spec',
      'From', 'To', 'P&ID Number', 'Operating Press.', 'Operating Temp.',
      'Design Press.', 'Design Temp.', 'Test Press.', 'Insulation',
      'Heat Tracing', 'Material', 'Comments'
    ];

    const data = [lineHeaders];

    lines.forEach((item, index) => {
      const lineInfo = this.parseLineNumber(item.tag);
      data.push([
        index + 1,
        item.tag,
        lineInfo.size,
        lineInfo.service,
        lineInfo.spec,
        '', // From
        '', // To
        process?.name || project.name,
        '', // Operating Pressure
        '', // Operating Temperature
        '', // Design Pressure
        '', // Design Temperature
        '', // Test Pressure
        '', // Insulation
        '', // Heat Tracing
        lineInfo.material || '',
        item.context || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = lineHeaders.map(() => ({ wch: 15 }));

    // Apply header row styling
    this.applyHeaderRowStyle(ws, lineHeaders.length);

    // Add filters
    ws['!autofilter'] = { ref: `A1:${this.getColumnLetter(lineHeaders.length)}${data.length}` };

    XLSX.utils.book_append_sheet(wb, ws, 'Line List');
  }

  /**
   * Create Master Tag Sheet (All tags combined)
   */
  createMasterTagSheet(wb, extractedData, project, process) {
    const headers = ['S.No', 'Tag Number', 'Type', 'Category', 'Description', 'Page(s)', 'Status'];
    const data = [headers];

    let sno = 1;

    // Add all equipment
    extractedData.tags.equipment?.forEach(item => {
      const pages = item.occurrences?.map(o => o.page).join(', ') || '';
      data.push([sno++, item.tag, item.type, 'Equipment', item.description, pages, 'Pending']);
    });

    // Add all instruments
    extractedData.tags.instruments?.forEach(item => {
      const pages = item.occurrences?.map(o => o.page).join(', ') || '';
      data.push([sno++, item.tag, item.type, 'Instrument', item.description, pages, 'Pending']);
    });

    // Add all valves
    extractedData.tags.controlValves?.forEach(item => {
      const pages = item.occurrences?.map(o => o.page).join(', ') || '';
      data.push([sno++, item.tag, item.type, 'Valve', item.description, pages, 'Pending']);
    });

    // Add all lines
    extractedData.tags.lineNumbers?.forEach(item => {
      const pages = item.occurrences?.map(o => o.page).join(', ') || '';
      data.push([sno++, item.tag, item.type, 'Line', item.description, pages, 'Pending']);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },   // S.No
      { wch: 20 },  // Tag Number
      { wch: 20 },  // Type
      { wch: 15 },  // Category
      { wch: 40 },  // Description
      { wch: 12 },  // Page(s)
      { wch: 12 }   // Status
    ];

    // Apply header row styling
    this.applyHeaderRowStyle(ws, headers.length);

    // Add filters
    ws['!autofilter'] = { ref: `A1:G${data.length}` };

    // Apply conditional formatting for status column
    for (let i = 2; i <= data.length; i++) {
      const cell = `G${i}`;
      this.applyCellStyle(ws, cell, {
        fill: { fgColor: { rgb: 'FFF3CD' } }
      });
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Master Tag List');
  }

  /**
   * Create Statistics Sheet
   */
  createStatisticsSheet(wb, extractedData) {
    const statsData = [
      ['TAG EXTRACTION STATISTICS'],
      [],
      ['Category', 'Count', 'Percentage'],
      ['Equipment', extractedData.summary.equipmentCount, this.calculatePercentage(extractedData.summary.equipmentCount, extractedData.summary.totalTags)],
      ['Instruments', extractedData.summary.instrumentCount, this.calculatePercentage(extractedData.summary.instrumentCount, extractedData.summary.totalTags)],
      ['Control Valves', extractedData.summary.controlValveCount, this.calculatePercentage(extractedData.summary.controlValveCount, extractedData.summary.totalTags)],
      ['Line Numbers', extractedData.summary.lineNumberCount, this.calculatePercentage(extractedData.summary.lineNumberCount, extractedData.summary.totalTags)],
      [],
      ['Total Tags', extractedData.summary.totalTags, '100%'],
      [],
      ['Page Analysis'],
      ['Page Number', 'Tags Found']
    ];

    // Add page-wise tag count
    extractedData.pageDetails?.forEach(page => {
      statsData.push([`Page ${page.pageNumber}`, page.tagsFound]);
    });

    const ws = XLSX.utils.aoa_to_sheet(statsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Apply styling
    this.applyCellStyle(ws, 'A1', {
      font: { bold: true, size: 14 },
      fill: { fgColor: { rgb: '004C8C' } }
    });

    this.applyCellStyle(ws, 'A3:C3', {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E6F2FF' } }
    });

    this.applyCellStyle(ws, 'A11:B11', {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E6F2FF' } }
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Statistics');
  }

  /**
   * Create Configuration Sheet
   */
  createConfigSheet(wb, project, process) {
    const configData = [
      ['CONFIGURATION & SETTINGS'],
      [],
      ['Project Configuration'],
      ['Parameter', 'Value'],
      ['Project Name', project.name],
      ['Client', project.client_name || 'ADNOC'],
      ['Site Code', process?.site || project.site_default],
      ['Unit Code', process?.unit_code || project.unit_code_default],
      ['Process Name', process?.name || 'N/A'],
      [],
      ['ISA 5.1 Standard Compliance'],
      ['First Letter', 'Variable Measured'],
      ['F', 'Flow'],
      ['L', 'Level'],
      ['P', 'Pressure'],
      ['T', 'Temperature'],
      [],
      ['Succeeding Letters', 'Function'],
      ['I', 'Indicate'],
      ['C', 'Control'],
      ['T', 'Transmit'],
      ['V', 'Valve'],
      [],
      ['Criticality Matrix'],
      ['Rating', 'Description'],
      ['A', 'Critical - Safety/Environmental Impact'],
      ['B', 'Essential - Production Critical'],
      ['C', 'Important - Quality/Efficiency Impact'],
      ['D', 'Standard - General Service'],
      ['E', 'Non-Critical - Utility Service']
    ];

    const ws = XLSX.utils.aoa_to_sheet(configData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 45 }
    ];

    // Apply section headers styling
    ['A1', 'A3', 'A11', 'A18', 'A24'].forEach(cell => {
      this.applyCellStyle(ws, cell, {
        font: { bold: true, size: 12 },
        fill: { fgColor: { rgb: 'E6F2FF' } }
      });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Configuration');
  }

  /**
   * Helper Functions
   */

  identifySystem(tag) {
    // Extract system identifier from tag (customize based on client standards)
    const match = tag.match(/^([A-Z]+)/);
    if (match) {
      const prefix = match[1];
      const systemMap = {
        'P': 'Pumping System',
        'K': 'Compression System',
        'E': 'Heat Transfer System',
        'V': 'Vessel System',
        'T': 'Tower/Column System',
        'F': 'Flow System',
        'L': 'Level System'
      };
      return systemMap[prefix[0]] || 'Process System';
    }
    return 'Process System';
  }

  identifySubSystem(tag) {
    // Extract sub-system based on tag number range
    const match = tag.match(/\d+/);
    if (match) {
      const number = parseInt(match[0]);
      if (number < 1000) return 'Utilities';
      if (number < 2000) return 'Feed System';
      if (number < 3000) return 'Reaction System';
      if (number < 4000) return 'Separation System';
      if (number < 5000) return 'Product System';
      return 'Auxiliary System';
    }
    return 'General';
  }

  assignCriticality(type) {
    // Assign criticality based on instrument type
    if (type.includes('Safety') || type.includes('Alarm')) return 'A';
    if (type.includes('Control') || type.includes('Pressure')) return 'B';
    if (type.includes('Temperature') || type.includes('Flow')) return 'C';
    if (type.includes('Level')) return 'D';
    return 'E';
  }

  assignSafetyClass(type) {
    if (type.includes('Safety')) return 'SIL-2';
    if (type.includes('Alarm') || type.includes('Shutdown')) return 'SIL-1';
    return 'Non-SIS';
  }

  isValveSafety(tag) {
    return tag.includes('PSV') || tag.includes('PRV') || tag.includes('TSV');
  }

  parseLineNumber(lineTag) {
    // Parse line number format: Size"-Service-Number
    const match = lineTag.match(/(\d+)['"]-([A-Z]+)-(\d+)/);
    if (match) {
      return {
        size: match[1] + '"',
        service: match[2],
        spec: match[3],
        material: this.getLineMaterial(match[2])
      };
    }
    return { size: '', service: '', spec: '', material: '' };
  }

  getLineMaterial(serviceCode) {
    const materialMap = {
      'PG': 'CS',  // Process Gas - Carbon Steel
      'PL': 'CS',  // Process Liquid - Carbon Steel
      'CW': 'CS',  // Cooling Water - Carbon Steel
      'ST': 'CS',  // Steam - Carbon Steel
      'HC': 'SS',  // Hydrocarbon - Stainless Steel
      'AC': 'SS'   // Acid - Stainless Steel
    };
    return materialMap[serviceCode] || 'CS';
  }

  calculatePercentage(value, total) {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }

  getColumnLetter(columnNumber) {
    let letter = '';
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return letter;
  }

  applyCellStyle(ws, cellRef, style) {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = style;
  }

  applyHeaderRowStyle(ws, columnCount) {
    for (let i = 0; i < columnCount; i++) {
      const cellRef = `${this.getColumnLetter(i + 1)}1`;
      this.applyCellStyle(ws, cellRef, {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '004C8C' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      });
    }
  }

  applyADNOCFormatting(wb) {
    // Apply ADNOC corporate colors and formatting
    // This is a placeholder for additional formatting requirements
    // ADNOC Blue: #004C8C
    // ADNOC Light Blue: #0073CF
    // ADNOC Gray: #707070
  }

  /**
   * Generate filename for the Excel export
   */
  generateFileName(project, process, type = 'TagSheet') {
    const timestamp = new Date().toISOString().split('T')[0];
    const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const processName = process ? process.name.replace(/[^a-zA-Z0-9]/g, '_') : 'AllProcesses';
    return `${projectName}_${processName}_${type}_${timestamp}.xlsx`;
  }
}

// Create singleton instance
const excelExportService = new ExcelExportService();

export default excelExportService;