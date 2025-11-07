===== CODE REVIEW PROMPT: BOX DRAWING & VISUAL =====

**Review Group:** 5 - Box Drawing & Visual Elements  
**Wave:** 2 (run after Wave 1 completes)  
**Output File:** `review/wave2/group5_boxes_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review box drawing, rules, and terminal control codes (~650 LOC).

**Focus:** Unicode box characters, ANSI escape codes, platform compatibility

---

## 📋 SETUP

```bash
cd rich-ts
npm test box
npm test rule
npm test control
```

---

## 📦 MODULES TO REVIEW

### 1. box.ts (332 LOC)
**Python:** `rich/box.py`  
**Tests:** 7 tests  
**Purpose:** 20+ box styles for tables/panels

**Review Focus:**
- Box parsing from 8-line format
- All 20 box styles correct (ROUNDED, HEAVY, DOUBLE, etc.)
- Platform substitution (Windows, ASCII fallback)
- getTop(), getRow(), getBottom() methods
- Lines 75-111: Box parsing with destructuring
- Lines 150-250: Row generation

**Critical:** Box characters must be correct - tables/panels depend on this!

---

### 2. rule.ts (159 LOC)
**Python:** `rich/rule.py`  
**Tests:** 16 tests  
**Purpose:** Horizontal rules with optional titles

**Review Focus:**
- Title alignment (left/center/right)
- Character repetition
- Width calculations
- Style integration

---

### 3. control.ts (228 LOC)
**Python:** `rich/control.py`  
**Tests:** 7 tests  
**Purpose:** Terminal control codes (cursor movement, etc.)

**Review Focus:**
- Control code types (11 types)
- ANSI escape sequence generation
- Strip vs escape operations
- Control segment creation

---

## ⏱️ Timeline: 2 hours

Output to: `review/wave2/group5_boxes_OUTPUT.md`

