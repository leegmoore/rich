===== CODE REVIEW PROMPT: COLOR SYSTEM & STYLING =====

**Review Group:** 1 - Color System & Styling  
**Wave:** 2 (run after Wave 1 completes)  
**Output File:** `review/wave2/group1_colors_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review the color handling, style parsing, and theme management system (~2,000 LOC).

**Focus:** Color algorithms, ANSI generation, style combination, theme lookups

---

## 📋 SETUP

Read context files, then:
```bash
cd rich-ts
npm test color
npm test color_triplet
npm test style
npm test theme
npm test default_styles
```

---

## 📦 MODULES TO REVIEW

### 1. color_triplet.ts (53 LOC)
**Python:** `rich/color_triplet.py`  
**Tests:** 3 tests  
**Purpose:** RGB color representation

**Review:** Basic RGB class, hex conversion, normalization

---

### 2. color.ts (993 LOC) 🔥 COMPLEX
**Python:** `rich/color.py`  
**Tests:** 16 tests  
**Purpose:** Color parsing, ANSI codes, conversion, downgrade

**Key Areas:**
- Color parsing (named colors, hex, rgb())
- ANSI code generation (16/256/truecolor)
- Color downgrade algorithms (truecolor → 8-bit → 16)
- RGB ↔ HLS conversion
- Color system detection

**Critical:** Lines 600-800 (downgrade algorithm with color cube)

---

### 3. style.ts (942 LOC) 🔥 COMPLEX
**Python:** `rich/style.py`  
**Tests:** 27 tests  
**Purpose:** Style class, parsing, ANSI rendering, combination

**Key Areas:**
- Style parsing from strings
- ANSI SGR code generation
- Style combination (+= operator)
- Color/bgcolor handling
- Bold, italic, underline, etc.
- Lines 300-600: ANSI rendering
- Lines 700-900: Style combination

**Critical:** ANSI code generation must match Python exactly

---

### 4. default_styles.ts (171 LOC)
**Python:** `rich/default_styles.py`  
**Tests:** Via theme tests  
**Purpose:** 152 default style definitions

**Review:** Verify all styles match Python, no typos in colors/attributes

---

### 5. theme.ts (151 LOC)
**Python:** `rich/theme.py`  
**Tests:** 5 tests  
**Purpose:** Theme class, style lookup, ThemeStack

**Key Areas:**
- Style inheritance
- Theme lookup
- INI config parsing
- ThemeStack push/pop

**Review Focus:** Theme lookup performance, style resolution

---

## ⏱️ Timeline: 3 hours

Output to: `review/wave2/group1_colors_OUTPUT.md`

