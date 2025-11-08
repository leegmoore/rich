===== CODE REVIEW PROMPT: PHASE 13 STAGED WORK =====

**Review:** Phase 13 - Progress Bar Components (5 modules)  
**Output File:** `rich-ts/phases/phase13/REVIEW_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review STAGED code from Phase 13 - Progress bar foundation!

**Modules:** progress_bar, bar, live_render, _spinners, spinner (~754 LOC)

---

## 📋 SETUP

```bash
cd /Users/leemoore/code/rich-port/rich
git status
git diff --cached --stat
```

**Expected:** src/*.ts and tests/*.test.ts for all 5 modules

---

## 🔍 REVIEW CHECKLIST

### 1. Quality Checks
```bash
cd rich-ts
npm test progress_bar bar live_render spinner -- --run
npm run check
```

**Verify:**
- [ ] All Phase 13 tests pass
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors

---

### 2. Correctness (30 min)

**Key checks:**
- [ ] progress_bar: Percentage calc, colors, gradients
- [ ] bar: Character rendering, width handling
- [ ] live_render: Overflow modes (crop/ellipsis/visible)
- [ ] _spinners: Data accuracy (spot check)
- [ ] spinner: Frame cycling logic

---

### 3. Output

Write to: `rich-ts/phases/phase13/REVIEW_OUTPUT.md`

Include: summary, test results, issues, approval

---

## ⏱️ Timeline: 1.5 hours

**START!** 🔍

