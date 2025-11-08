===== CODE REVIEW PROMPT: PHASE 14 STAGED WORK =====

**Review:** Phase 14 - Advanced Components (6 modules)  
**Output File:** `rich-ts/phases/phase14/REVIEW_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review STAGED code from Phase 14 - Syntax, markdown, tree, live displays!

**Modules:** tree, syntax, markdown, json, live, status (~2,691 LOC)

**Note:** syntax (985 LOC) and markdown (779 LOC) are LARGE!

---

## 📋 SETUP

```bash
cd /Users/leemoore/code/rich-port/rich
git status
git diff --cached --stat
```

---

## 🔍 REVIEW CHECKLIST

### 1. Quality Checks
```bash
cd rich-ts
npm test tree syntax markdown json live status -- --run
npm run check
```

**Verify:**
- [ ] All Phase 14 tests pass
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] External deps documented (markdown-it, lexer?)

---

### 2. Correctness (60 min - LARGE modules!)

**Focus on:**
- [ ] tree: Recursive rendering, guide lines
- [ ] syntax: Lexer integration, highlighting
- [ ] markdown: Parser integration, AST rendering
- [ ] json: JSONHighlighter usage
- [ ] live: Auto-refresh, screen buffer
- [ ] status: Live + Spinner integration

---

### 3. Output

Write to: `rich-ts/phases/phase14/REVIEW_OUTPUT.md`

---

## ⏱️ Timeline: 3 hours (large modules!)

**START!** 🔍

