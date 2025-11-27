# AI PROMPT: P&ID to ADNOC Tag Creation Excel Converter

## CONTEXT
You are an expert in Process & Instrumentation Diagrams (P&ID) and asset tag extraction for oil & gas facilities. Your task is to analyze P&ID engineering drawings and extract all equipment, instruments, and piping specifications into a standardized ADNOC Tag Creation Excel format.

## OBJECTIVE
Extract ALL tags from the P&ID drawing and generate a structured Excel spreadsheet with 17 columns following ADNOC Onshore standards.

---

## EXCEL OUTPUT STRUCTURE

Create an Excel file with exactly these 17 columns:

| Column # | Column Name | Description | Format/Rules |
|----------|-------------|-------------|--------------|
| 1 | S/N | Serial Number | Sequential: 1, 2, 3, ... |
| 2 | Functional Location | Full tag with area prefix | Format: `11.31.{TAG}` |
| 3 | Functional Location Description | Short description | Equipment name or instrument function |
| 4 | Functional Location Long Description (Optional) | Extended description | Can be same as short description |
| 5 | Location Label | Tag with hyphen format | Format: `11.31-{TAG}` |
| 6 | Site | Site code | Always: `11` |
| 7 | Unit Code | Unit identifier | Always: `A-OK-1131` |
| 8 | Parent (Superior functional location) | Parent hierarchy | Always: `A-OK-1131` |
| 9 | Work Center (CRAFT) (Only on TAG level) | Work center code | Usually empty |
| 10 | HSECES or Not (Only on TAG Level) | HSE classification | `on HSE` or empty |
| 11 | ABC Indicator (Criticality) | Criticality rating | `A`, `B`, `C`, or empty |
| 12 | Hazardous Area | Hazardous area classification | Area designation or empty |
| 13 | Ex-Equipment | Explosion-proof rating | `H1`, `H2`, etc. or empty |
| 14 | Manufacturer Model No (Optional) | Model number | From datasheet or empty |
| 15 | Manufacturer serial number (Optional) | Serial number | From datasheet or empty |
| 16 | Base Tag | Tag without area prefix | Just the tag: `K-2801`, `HV-7201`, etc. |
| 17 | Category | Asset category | `Equipment`, `Instrument`, `Line`, or `Other` |

---

## TAG IDENTIFICATION RULES

### 1. EQUIPMENT TAGS (Category: "Equipment")
Equipment tags are typically single-letter codes followed by numbers.

**Common Equipment Prefixes:**
- **C-** : Compressor
- **E-** : Heat Exchanger
- **F-** : Fired Heater/Furnace
- **H-** : Heater
- **K-** : Turbine/Compressor
- **P-** : Pump
- **R-** : Reactor
- **T-** : Tower/Column
- **TK-** : Tank/Storage Tank
- **V-** : Vessel/Drum

**Example from P&ID:**
```
Tag: K-2801
Functional Location: 11.31.K-2801
Description: HC GAS COMPRESSOR
Base Tag: K-2801
Category: Equipment
```

### 2. INSTRUMENT TAGS (Category: "Instrument")
Instruments follow ISA 5.1 standard with 2-4 letter codes.

**ISA 5.1 Instrument Identification:**

**First Letter (Measured/Initiating Variable):**
- **A** : Analysis (composition, pH, etc.)
- **B** : Burner/Combustion
- **C** : Conductivity
- **D** : Density/Specific Gravity
- **E** : Voltage (EMF)
- **F** : Flow Rate
- **G** : Gauging/Dimensional
- **H** : Hand (manual)
- **I** : Current (electric)
- **J** : Power
- **K** : Time/Schedule
- **L** : Level
- **M** : Moisture/Humidity
- **N** : User's Choice
- **O** : User's Choice
- **P** : Pressure/Vacuum
- **Q** : Quantity/Event
- **R** : Radioactivity
- **S** : Speed/Frequency
- **T** : Temperature
- **U** : Multivariable
- **V** : Vibration
- **W** : Weight/Force
- **X** : Unclassified
- **Y** : Event/State
- **Z** : Position/Dimension

**Subsequent Letters (Function):**
- **A** : Alarm
- **C** : Control/Controller
- **E** : Element (sensor)
- **G** : Glass/Gauge/Viewing Device
- **H** : High
- **I** : Indicate/Indicator
- **K** : Control Station
- **L** : Low/Light
- **M** : Momentary/Middle
- **O** : Orifice
- **R** : Record/Recorder
- **S** : Switch/Safety
- **T** : Transmit/Transmitter
- **V** : Valve/Damper
- **X** : Unclassified
- **Y** : Relay/Compute
- **Z** : Drive/Actuate

**Modifier Prefixes:**
- **H** : High
- **L** : Low
- **M** : Middle
- **HS** : Hand Switch
- **HSR** : Hand Switch Reset
- **XV** : Solenoid Valve
- **XOV** : Solenoid Operated Valve
- **XSOV** : Solenoid Operated Valve (X-prefix)
- **PSV** : Pressure Safety Valve
- **PRV** : Pressure Relief Valve
- **TSO** : Temperature Switch Open

**Examples from P&ID:**
```
Tag: PA-3221
Functional Location: 11.31.PA-3221
Description: PA-3221 Pressure Alarm
Base Tag: PA-3221
Category: Instrument
Meaning: P=Pressure, A=Alarm

Tag: PT-3211
Description: PT-3211 Pressure Transmitter
Meaning: P=Pressure, T=Transmitter

Tag: HV-7201
Description: HV-7201 Hydraulic / Deluge Valve
Meaning: H=Hand, V=Valve

Tag: HS-7205
Description: HS-7205 Hand Switch
Meaning: H=Hand, S=Switch

Tag: PI-4231
Description: PI-4231 Pressure Indicator
Meaning: P=Pressure, I=Indicator

Tag: XOV-7201
Description: XOV-7201 Solenoid Operated Valve
Meaning: X=Unclassified, O=Orifice, V=Valve

Tag: PSV
Description: PSV Pressure Safety Valve
```

### 3. PIPING LINE TAGS (Category: "Line")
Piping specifications follow the format: **SIZE-SERVICE-NUMBER-LOCATION**

**Line Format Components:**
```
Example: 8"-FW-0491-018100-X
         │  │   │     │      │
         │  │   │     │      └─ Classification suffix
         │  │   │     └─ Location code (6 digits)
         │  │   └─ Line number (4 digits)
         │  └─ Service code (2-4 letters)
         └─ Nominal pipe size (with ")
```

**Common Service Codes:**
- **FW** : Firewater
- **IA** : Instrument Air
- **PA** : Plant Air
- **N2** : Nitrogen
- **SW** : Service Water
- **DW** : Demineralized Water
- **CW** : Cooling Water
- **ST** : Steam
- **CD** : Condensate
- **HO** : Hot Oil
- **FO** : Fuel Oil
- **FG** : Fuel Gas
- **HC** : Hydrocarbon
- **AG** : Above Ground
- **UG** : Underground

**Location Code Suffixes:**
- **-X** : Suffix indicating classification
- **-U** : Underground routing
- **-A** : Above ground routing

**Examples from P&ID:**
```
Tag: 8"-FW-0491-018100-X
Functional Location: 11.31.8"-FW-0491-018100-X
Description: 8" Firewater line 0491-018100-X
Base Tag: 8"-FW-0491-018100-X
Category: Line
Breakdown: 8 inch Firewater line, number 0491, location 018100, class X

Tag: 1 1/2"-IA-0874-018011-X
Description: 1 1/2" Instrument Air line 0874-018011-X
Category: Line
Breakdown: 1.5 inch Instrument Air, number 0874, location 018011, class X

Tag: 4"-FW-0492-018100-X
Description: 4" Firewater line 0492-018100-X
Category: Line
```

### 4. OTHER TAGS (Category: "Other")
Miscellaneous connections, nozzles, test points, etc.

**Examples:**
```
Tag: U-5701-01
Description: Connection / nozzle U-5701-01
Category: Other
```

---

## EXTRACTION PROCESS

### STEP 1: IDENTIFY ALL EQUIPMENT
- Look for equipment symbols: pumps, vessels, compressors, tanks
- Extract equipment tag (e.g., K-2801, V-3701, P-3709, P-3710)
- Get equipment name from text labels or legends
- Extract equipment dimensions from "SIZE:" notations if present

### STEP 2: IDENTIFY ALL INSTRUMENTS
- Look for instrument symbols: circles, diamonds, squares
- Extract instrument tags following ISA 5.1 format (e.g., PA-3221, PT-3211, HV-7201)
- Decode instrument function from tag letters
- Generate description: "{TAG} {Function Description}"
- Examples:
  - PA-3221 → "PA-3221 Pressure Alarm"
  - PT-3211 → "PT-3211 Pressure Transmitter"
  - HS-7205 → "HS-7205 Hand Switch"
  - PI-4231 → "PI-4231 Pressure Indicator"

### STEP 3: IDENTIFY ALL PIPING LINES
- Look for line specifications on piping (e.g., 8"-FW-0491-018100-X)
- Extract complete line specification including:
  - Pipe size (e.g., 1", 2", 4", 8", 1 1/2")
  - Service code (FW, IA, PA, etc.)
  - Line number (4 digits)
  - Location code (6 digits)
  - Suffix (-X, -U, etc.)
- Generate description: "{SIZE} {SERVICE_NAME} line {NUMBER}-{LOCATION}"
  - FW → Firewater
  - IA → Instrument Air

### STEP 4: CHECK FOR TABLES/SCHEDULES
- Look for "WATER SPRAY NOZZLE SCHEDULE" or similar tables
- Look for "FUSIBLE PLUG SCHEDULE" or similar tables
- Extract any additional equipment/instrument data from tables

### STEP 5: EXTRACT AREA/LOCATION CODES
- Look for drawing title block and notes
- Extract Area Code (typically 11)
- Extract Plant Area Code (typically 31)
- Note: Drawing notes may state: "ALL EQUIPMENT AND INSTRUMENT TAG NUMBERS ON THIS DRAWING IS PREFIX BY AREA CODE (11) AND PLANT AREA CODE (31)"

---

## EXCEL ROW GENERATION RULES

For each extracted tag, create a row with these values:

### Equipment Row Example (K-2801):
```
S/N: 1
Functional Location: 11.31.K-2801
Functional Location Description: HC GAS COMPRESSOR
Functional Location Long Description: HC GAS COMPRESSOR
Location Label: 11.31-K-2801
Site: 11
Unit Code: A-OK-1131
Parent: A-OK-1131
Work Center: [empty]
HSECES: on HSE
ABC Indicator: [empty]
Hazardous Area: [empty]
Ex-Equipment: H1
Manufacturer Model No: [empty]
Manufacturer Serial No: [empty]
Base Tag: K-2801
Category: Equipment
```

### Instrument Row Example (PA-3221):
```
S/N: 10
Functional Location: 11.31.PA-3221
Functional Location Description: PA-3221 Pressure Alarm
Functional Location Long Description: PA-3221 Pressure Alarm
Location Label: 11.31-PA-3221
Site: 11
Unit Code: A-OK-1131
Parent: A-OK-1131
Work Center: [empty]
HSECES: [empty]
ABC Indicator: [empty]
Hazardous Area: [empty]
Ex-Equipment: [empty]
Manufacturer Model No: [empty]
Manufacturer Serial No: [empty]
Base Tag: PA-3221
Category: Instrument
```

### Line Row Example (8"-FW-0491-018100-X):
```
S/N: 20
Functional Location: 11.31.8"-FW-0491-018100-X
Functional Location Description: 8" Firewater line 0491-018100-X
Functional Location Long Description: 8" Firewater line 0491-018100-X
Location Label: 11.31-8"-FW-0491-018100-X
Site: 11
Unit Code: A-OK-1131
Parent: A-OK-1131
Work Center: [empty]
HSECES: [empty]
ABC Indicator: [empty]
Hazardous Area: [empty]
Ex-Equipment: [empty]
Manufacturer Model No: [empty]
Manufacturer Serial No: [empty]
Base Tag: 8"-FW-0491-018100-X
Category: Line
```

---

## SORTING ORDER

Sort the final Excel rows in this order:
1. **Equipment** (alphabetically by Base Tag)
2. **Instruments** (alphabetically by Base Tag)
3. **Lines** (by size, then service code, then number)
4. **Other** (alphabetically)

---

## OUTPUT FORMAT

Generate the output as a table with all 17 columns. Use pipe (|) delimiters for easy conversion to Excel.

Example output format:
```
S/N | Functional Location | Functional Location Description | ... | Category
1 | 11.31.K-2801 | HC GAS COMPRESSOR | ... | Equipment
2 | 11.31.V-3701 | COMPRESSOR SCRUBBER | ... | Equipment
3 | 11.31.P-3709 | COMPRESSOR SCRUBBER PUMP | ... | Equipment
...
```

---

## QUALITY CHECKS

Before finalizing the output, verify:
1. ✅ All equipment tags from the P&ID are included
2. ✅ All instrument tags are included with proper ISA 5.1 descriptions
3. ✅ All piping line specifications are included
4. ✅ Area code prefix (11.31) is applied to all tags
5. ✅ Sequential S/N numbering is correct
6. ✅ Categories are correctly assigned (Equipment/Instrument/Line/Other)
7. ✅ Base Tag column matches the tag without area prefix
8. ✅ Site is always "11" and Unit Code is always "A-OK-1131"
9. ✅ No duplicate tags in the output
10. ✅ All 17 columns are present for every row

---

## SAMPLE P&ID REFERENCE

**Drawing:** 158961-11-31-08-0139-1
**Title:** FIRE WATER SPRAY SYSTEM-1
**Location:** GAS COMPRESSOR STATION-1 : BAB

**Expected Output Summary:**
- 4 Equipment tags (K-2801, V-3701, P-3709, P-3710)
- 15 Instrument tags (HS-7205, HS-7215, HSR-7201, HV-7201, PA-3211, PA-3221, PI-4211, PI-4221, PI-4231, PI-4241, PT-3211, PT-3221, XOV-7201, XSOV-7201, PSV)
- 18+ Line tags (various FW and IA lines)
- 1+ Other tags (U-5701-01)

**Total Expected Rows:** ~37-40 rows

---

## INSTRUCTIONS FOR USE

When you receive a P&ID drawing PDF:

1. Carefully analyze the entire drawing
2. Extract ALL visible tags (equipment, instruments, lines)
3. Decode instrument functions using ISA 5.1 standard
4. Generate descriptions for each tag
5. Create Excel rows with all 17 columns
6. Sort by category then alphabetically
7. Number rows sequentially starting from 1
8. Output as a formatted table ready for Excel import

**Remember:** Be thorough. Missing even one tag means incomplete asset data for the facility.

---

## EXAMPLE PROMPT TO USE

Copy and paste this when providing a P&ID to AI:

```
Analyze this P&ID drawing and extract all equipment, instruments, and piping line tags into an ADNOC Tag Creation Excel format.

Follow these requirements:
- Extract ALL equipment tags (K-, P-, V-, C-, E-, T-, etc.)
- Extract ALL instrument tags per ISA 5.1 standard (PA, PT, PI, HS, HV, etc.)
- Extract ALL piping line specifications (SIZE-SERVICE-NUMBER-LOCATION format)
- Generate 17-column Excel output with proper descriptions
- Apply area code prefix 11.31 to all tags
- Use Site: 11, Unit Code: A-OK-1131, Parent: A-OK-1131
- Categorize as Equipment, Instrument, Line, or Other
- Sort by category then alphabetically

Output as a table with all 17 columns that I can copy into Excel.
```
