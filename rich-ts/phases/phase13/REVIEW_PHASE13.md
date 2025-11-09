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

### 1. Quality Checks (CRITICAL - All Must Pass!)
```bash
cd rich-ts

# Run each check separately to see results clearly
npm test progress_bar bar live_render spinner _spinners -- --run
npm run typecheck
npm run lint

# Then run full check
npm run check
```

**Verify ALL THREE pass:**
- [ ] **Tests:** All Phase 13 tests pass (progress_bar, bar, live_render, spinner, _spinners)
- [ ] **TypeScript:** 0 compilation errors
- [ ] **ESLint:** 0 errors (warnings OK if only non-null assertions)

**Common Phase 13 lint errors to check for:**
- [ ] Unused variables in _spinners.test.ts (name, index)
- [ ] Unsafe `any` usage in progress_bar.test.ts (4 errors with _getPulseSegments)
- [ ] Unsafe any call in file_proxy.test.ts
- [ ] Unsafe return in screen.test.ts
- [ ] Object to string in spinner.test.ts

**If lint has errors:** Code not ready, request fixes!

**IMPORTANT:** All 3 must pass together. Fixing one can break another, so verify all 3 consecutively.

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

