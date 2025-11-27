const OpenAI = require('openai');
const pdf = require('pdf-parse');
const fs = require('fs').promises;

class PIDTagExtractor {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Embedded AI Prompt - No need for users to copy/paste
    this.EXTRACTION_PROMPT = `You are a P&ID tag extraction expert. Analyze this engineering drawing and extract ALL equipment, instruments, and piping line tags into ADNOC Tag Creation Excel format.

EXTRACTION REQUIREMENTS:
1. Equipment Tags: K-, P-, V-, C-, E-, T-, H-, F-, R-, TK- (e.g., K-2801, P-3709)
2. Instrument Tags per ISA 5.1: PA, PT, PI, HS, HV, PSV, XOV, etc. (e.g., PA-3221, PT-3211)
3. Piping Lines: SIZE-SERVICE-NUMBER-LOCATION format (e.g., 8"-FW-0491-018100-X)

EXCEL OUTPUT - 17 COLUMNS:
1. S/N (sequential: 1, 2, 3...)
2. Functional Location (format: 11.31.{TAG})
3. Functional Location Description (equipment name or instrument function)
4. Functional Location Long Description (Optional) (same as #3)
5. Location Label (format: 11.31-{TAG})
6. Site (always: 11)
7. Unit Code (always: A-OK-1131)
8. Parent (Superior functional location) (always: A-OK-1131)
9. Work Center (CRAFT) (empty)
10. HSECES or Not (on HSE for equipment, empty for others)
11. ABC Indicator (Criticality) (empty)
12. Hazardous Area (empty)
13. Ex-Equipment (H1 for some equipment, empty for others)
14. Manufacturer Model No (Optional) (empty)
15. Manufacturer serial number (Optional) (empty)
16. Base Tag (tag without 11.31 prefix, e.g., K-2801)
17. Category (Equipment, Instrument, Line, or Other)

DESCRIPTION RULES:
- Equipment: Use name from drawing (e.g., "HC GAS COMPRESSOR")
- Instruments: Format as "{TAG} {Function}" (e.g., "PA-3221 Pressure Alarm", "PT-3211 Pressure Transmitter", "HS-7205 Hand Switch")
- Lines: Format as "{SIZE} {SERVICE_NAME} line {NUMBER}-{LOCATION}" (e.g., "8\\" Firewater line 0491-018100-X")

ISA 5.1 INSTRUMENT DECODING:
First Letter (Variable): P=Pressure, T=Temperature, F=Flow, L=Level, A=Analysis, H=Hand, S=Speed, V=Vibration
Second Letter (Function): A=Alarm, T=Transmitter, I=Indicator, S=Switch, V=Valve, C=Control, E=Element, R=Recorder
Examples:
- PA = Pressure Alarm
- PT = Pressure Transmitter
- PI = Pressure Indicator
- HS = Hand Switch
- HV = Hand Valve (or Hydraulic Valve)
- PSV = Pressure Safety Valve
- XOV = Solenoid Operated Valve
- XSOV = Solenoid Operated Valve (X-prefix)
- HSR = Hand Switch Reset
- TSO = Temperature Switch Open

SERVICE CODES FOR LINES:
FW=Firewater, IA=Instrument Air, PA=Plant Air, SW=Service Water, ST=Steam, FG=Fuel Gas, N2=Nitrogen, HC=Hydrocarbon, AG=Above Ground, UG=Underground

SORTING ORDER:
1. Equipment (alphabetically by Base Tag)
2. Instruments (alphabetically by Base Tag)
3. Lines (by size, then service)
4. Other (alphabetically)

OUTPUT FORMAT:
Return ONLY valid JSON array with this exact structure:
[
  {
    "sn": 1,
    "functionalLocation": "11.31.K-2801",
    "functionalLocationDescription": "HC GAS COMPRESSOR",
    "functionalLocationLongDescription": "HC GAS COMPRESSOR",
    "locationLabel": "11.31-K-2801",
    "site": "11",
    "unitCode": "A-OK-1131",
    "parent": "A-OK-1131",
    "workCenter": "",
    "hseces": "on HSE",
    "abcIndicator": "",
    "hazardousArea": "",
    "exEquipment": "H1",
    "manufacturerModelNo": "",
    "manufacturerSerialNo": "",
    "baseTag": "K-2801",
    "category": "Equipment"
  }
]

CRITICAL:
- Extract EVERY tag visible in the P&ID drawing
- Do NOT skip any equipment, instruments, or piping lines
- Return pure JSON only, no markdown code blocks
- Ensure all 17 fields are present for each tag
- Missing tags means incomplete asset data`;
  }

  /**
   * Extract text content from PDF file
   */
  async extractPDFText(pdfPath) {
    try {
      console.log('📄 Extracting text from PDF...');
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer);
      console.log(`  ✓ Extracted ${data.text.length} characters of text`);
      return data.text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error(`Failed to extract PDF content: ${error.message}`);
    }
  }

  /**
   * Analyze P&ID text with OpenAI GPT-4
   */
  async analyzeWithAI(pdfPath) {
    try {
      // Extract text from PDF
      const pdfText = await this.extractPDFText(pdfPath);

      if (!pdfText || pdfText.trim().length < 50) {
        throw new Error('PDF contains insufficient text content. Please ensure the PDF is text-based, not a scanned image.');
      }

      console.log('📤 Sending P&ID text to OpenAI GPT-4...');

      // Call OpenAI with GPT-4
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // GPT-4 Turbo
        messages: [
          {
            role: 'system',
            content: this.EXTRACTION_PROMPT
          },
          {
            role: 'user',
            content: `Analyze this P&ID engineering drawing text content and extract all equipment, instrument, and piping line tags into the specified JSON format. Be thorough and extract EVERY tag visible in the text.\n\nP&ID Text Content:\n${pdfText}`
          }
        ],
        max_tokens: 16000, // Increased for large P&IDs with many tags
        temperature: 0.1 // Low temperature for consistent extraction
      });

      const content = response.choices[0].message.content;
      console.log('✅ OpenAI response received');

      // Parse JSON response
      let jsonData;
      try {
        // Remove markdown code blocks if present
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        jsonData = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', content);
        throw new Error('OpenAI returned invalid JSON format');
      }

      return jsonData;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Validate extracted tag data
   */
  validateTagData(tags) {
    if (!Array.isArray(tags)) {
      throw new Error('Tag data must be an array');
    }

    const requiredFields = [
      'sn', 'functionalLocation', 'functionalLocationDescription',
      'locationLabel', 'site', 'unitCode', 'parent', 'baseTag', 'category'
    ];

    for (const tag of tags) {
      for (const field of requiredFields) {
        if (tag[field] === undefined) {
          throw new Error(`Missing required field "${field}" in tag data`);
        }
      }
    }

    console.log(`✅ Validated ${tags.length} tags`);
    return true;
  }

  /**
   * Main extraction method - Process P&ID PDF and extract tags
   */
  async extractTags(pdfFilePath, options = {}) {
    try {
      console.log('\n🔬 === P&ID Tag Extraction Started ===\n');
      console.log('📄 PDF File:', pdfFilePath);

      // Step 1: Analyze P&ID with OpenAI
      console.log('\n📊 Analyzing P&ID with AI...');
      const extractedTags = await this.analyzeWithAI(pdfFilePath);

      // Step 2: Validate extracted data
      console.log('\n✅ Validating extracted tags...');
      this.validateTagData(extractedTags);

      // Step 3: Sort tags by category and name
      const sortedTags = this.sortTags(extractedTags);

      console.log('\n📈 Extraction Summary:');
      const categoryCounts = this.getTagCategoryCounts(sortedTags);
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} tags`);
      });
      console.log(`  - Total: ${sortedTags.length} tags`);

      console.log('\n✅ === P&ID Tag Extraction Completed ===\n');

      return {
        success: true,
        tags: sortedTags,
        totalCount: sortedTags.length,
        categoryCounts
      };

    } catch (error) {
      console.error('\n❌ === P&ID Tag Extraction Failed ===');
      console.error('Error:', error.message);
      throw error;
    }
  }

  /**
   * Sort tags by category then alphabetically
   */
  sortTags(tags) {
    const categoryOrder = { 'Equipment': 1, 'Instrument': 2, 'Line': 3, 'Other': 4 };

    return tags.sort((a, b) => {
      // First sort by category
      const categoryCompare = (categoryOrder[a.category] || 5) - (categoryOrder[b.category] || 5);
      if (categoryCompare !== 0) return categoryCompare;

      // Then sort alphabetically by base tag
      return a.baseTag.localeCompare(b.baseTag);
    }).map((tag, index) => ({
      ...tag,
      sn: index + 1 // Re-number sequentially
    }));
  }

  /**
   * Get count of tags by category
   */
  getTagCategoryCounts(tags) {
    return tags.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Convert extracted tags to Excel-compatible format
   */
  convertToExcelFormat(tags) {
    return tags.map(tag => ({
      'S/N': tag.sn,
      'Functional Location': tag.functionalLocation,
      'Functional Location Description': tag.functionalLocationDescription,
      'Functional Location Long Description (Optional)': tag.functionalLocationLongDescription,
      'Location Label': tag.locationLabel,
      'Site': tag.site,
      'Unit Code': tag.unitCode,
      'Parent (Superior functional location)': tag.parent,
      'Work Center (CRAFT) (Only on TAG level)': tag.workCenter,
      'HSECES or Not (Only on TAG Level)': tag.hseces,
      'ABC Indicator (Criticality)': tag.abcIndicator,
      'Hazardous Area': tag.hazardousArea,
      'Ex-Equipment': tag.exEquipment,
      'Manufacturer Model No (Optional)': tag.manufacturerModelNo,
      'Manufacturer serial number (Optional)': tag.manufacturerSerialNo,
      'Base Tag': tag.baseTag,
      'Category': tag.category
    }));
  }
}

module.exports = PIDTagExtractor;
