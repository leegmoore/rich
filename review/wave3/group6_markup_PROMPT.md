===== CODE REVIEW PROMPT: MARKUP & EMOJI =====

**Review Group:** 6 - Markup & Emoji  
**Wave:** 3 (run after Waves 1 & 2 complete)  
**Output File:** `review/wave3/group6_markup_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review markup parsing and emoji support (~4,000 LOC, mostly data).

**Focus:** Markup parser correctness, emoji replacement, variant handling

**Note:** 3,610 LOC is pure emoji data - validate structure, don't review every line!

---

## 📋 SETUP

```bash
cd rich-ts
npm test markup
npm test emoji
```

---

## 📦 MODULES TO REVIEW

### 1. markup.ts (252 LOC)
**Python:** `rich/markup.py`  
**Tests:** 21 tests  
**Purpose:** Parse Rich markup syntax `[bold]text[/]`

**Review Focus:**
- Tag parsing regex
- Nested tag handling
- Escape sequences
- Link tags `[link=url]`
- Event/meta tags `[@click]`
- Error handling for malformed markup

**Critical Areas:**
- Lines 20-100: Tag parsing
- Lines 100-200: Render function
- Lines 200-252: Escape handling

---

### 2. emoji.ts (79 LOC)
**Python:** `rich/emoji.py`  
**Tests:** 6 tests  
**Purpose:** Emoji renderables with variant support

**Review Focus:**
- Emoji lookup from EMOJI dict
- Variant support (text \uFE0E vs emoji \uFE0F)
- NoEmoji exception
- replace() static method

---

### 3. _emoji_replace.ts (40 LOC)
**Python:** `rich/_emoji_replace.py`  
**Purpose:** Replace :emoji: codes with characters

**Review Focus:**
- Regex pattern correctness
- Variant parsing (`:smiley:` vs `:smiley-emoji:`)
- Unknown emoji handling

---

### 4. _emoji_codes.ts (3,610 LOC) 📊 DATA FILE
**Python:** `rich/_emoji_codes.py`  
**Purpose:** Dictionary of 3,600+ emoji

**Review Focus:**
- **QUICK VALIDATION ONLY:**
  - File structure: `export const EMOJI: Record<string, string> = { ... }`
  - Spot check 10-20 random emoji (correct characters)
  - No syntax errors
  - No obvious typos in keys

**Do NOT review every emoji - just validate structure!**

---

## ⏱️ Timeline: 1-2 hours

Output to: `review/wave3/group6_markup_OUTPUT.md`

