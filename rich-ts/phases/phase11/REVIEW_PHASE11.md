===== CODE REVIEW PROMPT: PHASE 11 STAGED WORK =====

**Review:** Phase 11 - Palette System + Pager (4 modules)  
**Output File:** `rich-ts/phases/phase11/REVIEW_OUTPUT.md`

---

## 🎯 YOUR MISSION

You are reviewing STAGED code from Phase 11 porting work.

**Your Task:** Review 4 ported modules that are staged (git add -A) but not yet committed.

**Focus:**
1. ✅ **Correctness** - Does it match Python behavior?
2. ✅ **Tests** - Do all tests pass?
3. ✅ **TypeScript** - Does it compile? Any type issues?
4. ✅ **Code Quality** - Is it maintainable?
5. ✅ **Completeness** - Are all 4 modules done?

---

## 📋 SETUP

**Repo:** `/Users/leemoore/code/rich-port/rich/`

**Check staged files:**
```bash
cd /Users/leemoore/code/rich-port/rich
git status  # Should show staged files
git diff --cached --stat  # See what's staged
```

**Expected staged files:**
- `rich-ts/src/pager.ts`
- `rich-ts/src/palette.ts`
- `rich-ts/src/_palettes.ts`
- `rich-ts/src/terminal_theme.ts`
- `rich-ts/tests/pager.test.ts`
- `rich-ts/tests/palette.test.ts`
- `rich-ts/tests/_palettes.test.ts` (maybe)
- `rich-ts/tests/terminal_theme.test.ts`
- Updated `rich-ts/phases/phase11/PORT_LOG_*.md` files

---

## 🔍 REVIEW CHECKLIST

### 1. Run All Quality Checks (15 min)

```bash
cd rich-ts

# Run tests for Phase 11 modules
npm test pager -- --run
npm test palette -- --run
npm test terminal_theme -- --run

# Run all tests
npm test -- --run

# Check TypeScript compilation
npm run typecheck

# Check linting
npm run lint

# Run full check
npm run check
```

**Verify:**
- [ ] All Phase 11 tests pass
- [ ] No new test failures in other modules
- [ ] TypeScript compiles with 0 errors
- [ ] ESLint shows 0 errors (warnings OK)
- [ ] `npm run check` completes successfully

---

### 2. Review Correctness vs Python (30 min)

**For each module, compare to Python source:**

**pager.ts vs rich/pager.py:**
- [ ] Abstract base class correct?
- [ ] show() method signature matches?
- [ ] Proper abstract class implementation?

**palette.ts vs rich/palette.py:**
- [ ] Palette class structure correct?
- [ ] match() algorithm accurate? (Euclidean distance)
- [ ] Color matching returns correct nearest color?
- [ ] Caching implemented properly?

**_palettes.ts vs rich/_palettes.py:**
- [ ] EIGHT_BIT_PALETTE has 256 colors?
- [ ] WINDOWS_PALETTE has 16 colors?
- [ ] Color values match Python exactly? (spot check key colors)

**terminal_theme.ts vs rich/terminal_theme.py:**
- [ ] TerminalTheme class structure correct?
- [ ] Foreground and background color arrays correct?
- [ ] Default themes defined?
- [ ] Integration with palette correct?

---

### 3. Review Code Quality (20 min)

**Check for:**
- [ ] Clear variable names (no abbreviations)
- [ ] JSDoc comments on public APIs
- [ ] Complex logic has explanatory comments
- [ ] No `any` types without eslint-disable
- [ ] Proper error handling
- [ ] TypeScript strict mode compliant

**Spot check:**
- palette.ts match() method - is algorithm clear?
- _palettes.ts - data accuracy (spot check 5-10 colors)
- terminal_theme.ts - theme construction logic

---

### 4. Review Test Coverage (15 min)

**For each module:**
- [ ] Tests match Python test coverage?
- [ ] Key functionality tested?
- [ ] Edge cases covered?
- [ ] Test names descriptive?

**Run and verify:**
```bash
cd rich-ts
npm test pager -- --run --reporter=verbose
npm test palette -- --run --reporter=verbose
npm test terminal_theme -- --run --reporter=verbose
```

---

### 5. Check Integration (10 min)

**Verify:**
- [ ] All modules properly exported in index.ts (if applicable)
- [ ] Imports use correct paths (.js extensions)
- [ ] No circular dependencies
- [ ] palette used correctly by _palettes and terminal_theme

---

## 📝 OUTPUT FORMAT

Write your review to: **`rich-ts/phases/phase11/REVIEW_OUTPUT.md`**

```markdown
# Phase 11 Code Review - Palette System + Pager

**Reviewer:** [Your ID]
**Date:** [Date]
**Modules Reviewed:** pager, palette, _palettes, terminal_theme

---

## Executive Summary

**Overall Assessment:** [APPROVE / APPROVE WITH CHANGES / NEEDS WORK]
**Grade:** [A-F]

**Quick Stats:**
- Modules complete: X/4
- Tests passing: X/Y
- TypeScript errors: X
- ESLint errors: X
- Critical issues: X
- High priority issues: Y
- Medium/Low issues: Z

**Recommendation:**
[Approve for merge / Fix issues then merge / Needs significant rework]

---

## Test Results

```
[Paste output of npm test -- --run showing Phase 11 module results]
```

**Analysis:**
- [Comment on test pass rate]
- [Any failing tests?]
- [Test coverage adequate?]

---

## TypeScript Compilation

```
[Paste output of npm run typecheck]
```

**Analysis:**
- [Any compilation errors?]
- [Type safety assessment]

---

## Code Quality (ESLint)

```
[Paste relevant output of npm run lint]
```

**Analysis:**
- [Any errors?]
- [Warning count acceptable?]

---

## Correctness Review

### pager.ts
**Grade:** [A-F]
- Matches Python? [Yes/No/Issues]
- Issues found: [list]

### palette.ts
**Grade:** [A-F]
- match() algorithm correct? [Yes/No]
- Distance calculation accurate? [Yes/No]
- Issues found: [list]

### _palettes.ts
**Grade:** [A-F]
- Data accuracy: [spot check results]
- Issues found: [list]

### terminal_theme.ts
**Grade:** [A-F]
- Theme structure correct? [Yes/No]
- Color mappings accurate? [Yes/No]
- Issues found: [list]

---

## Issues Found

### Critical Issues (Must Fix Before Merge)
[List with file:line and description]

### High Priority Issues (Should Fix)
[List with file:line and description]

### Medium/Low Priority Issues (Nice to Fix)
[List with file:line and description]

---

## Positive Findings

[What was done well]

---

## Recommendations

### Before Merge
[Required fixes]

### Future Improvements
[Optional enhancements]

---

## Approval

**Ready to merge?** [YES / NO / WITH FIXES]

**If NO, what's blocking?**
[Specific items that must be addressed]
```

---

## ⏱️ Timeline

- Quality checks: 15 min
- Correctness review: 30 min
- Code quality: 20 min
- Test coverage: 15 min
- Integration: 10 min
- Documentation: 20 min

**Total: ~2 hours**

---

## 🚀 START REVIEW

1. Check git status (verify staged files)
2. Run all quality checks
3. Compare each module to Python source
4. Review code quality
5. Document findings in REVIEW_OUTPUT.md
6. Give approval recommendation

**GO!** 🔍

