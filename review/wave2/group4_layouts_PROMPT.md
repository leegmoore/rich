===== CODE REVIEW PROMPT: LAYOUT COMPONENTS =====

**Review Group:** 4 - Layout Components  
**Wave:** 2 (run after Wave 1 completes)  
**Output File:** `review/wave2/group4_layouts_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review table, columns, panels, and layout wrapper components (~1,150 LOC).

**Focus:** Layout algorithms, box integration, width calculations, ratio distribution

---

## 📋 SETUP

```bash
cd rich-ts
npm test table
npm test columns
npm test panel
npm test padding
npm test align
npm test constrain
```

---

## 📦 MODULES TO REVIEW

### 1. table.ts (1,087 LOC) 🔥 LARGEST & MOST COMPLEX
**Python:** `rich/table.py`  
**Tests:** Via columns.test.ts  
**Purpose:** Tables and grids with headers, footers, box styles

**Critical Areas:**
- Column width calculations (ratios, min/max)
- Row rendering with box integration
- Grid mode (no borders)
- Cell padding and alignment
- Lines 400-600: Width calculation algorithms
- Lines 700-900: Rendering logic

**Review Focus:**
- Ratio distribution correctness
- Box drawing integration
- Vertical alignment
- Section dividers

---

### 2. columns.ts (219 LOC)
**Python:** `rich/columns.py`  
**Tests:** `tests/columns.test.ts` (1 test)  
**Purpose:** Multi-column layouts

**Review Focus:**
- Column count calculation
- Width distribution (equal vs auto)
- Uses Table.grid() correctly
- Ordering: column-first, right-to-left

---

### 3. panel.ts (320 LOC)
**Python:** `rich/panel.py`  
**Tests:** `tests/panel.test.ts` (13 tests)  
**Purpose:** Bordered panels with titles

**Review Focus:**
- Box integration
- Title/subtitle positioning
- Padding calculation
- Width/height constraints

---

### 4. padding.ts (181 LOC)
**Python:** `rich/padding.py`  
**Tests:** 5 tests  
**Purpose:** Add padding around renderables

**Review Focus:**
- CSS-style padding unpacking
- Padding segment generation
- Measurement accuracy

---

### 5. align.ts (259 LOC)
**Python:** `rich/align.py`  
**Tests:** 16 tests  
**Purpose:** Horizontal/vertical alignment

**Review Focus:**
- Alignment algorithms (left/center/right)
- Vertical alignment (top/middle/bottom)
- Shape manipulation with Segment.setShape()

---

### 6. constrain.ts (44 LOC)
**Python:** `rich/constrain.py`  
**Tests:** 1 test  
**Purpose:** Width constraints

**Review Focus:**
- Width limiting logic
- updateWidth() usage
- Measurement clamping

---

## ⏱️ Timeline: 3-4 hours

Output to: `review/wave2/group4_layouts_OUTPUT.md`

