===== CODE REVIEW PROMPT: PHASE 12 STAGED WORK =====

**Review:** Phase 12 - ANSI + Helpers (6 modules)  
**Output File:** `rich-ts/phases/phase12/REVIEW_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review STAGED code from Phase 12 - CRITICAL phase with ansi module!

**Modules:** ansi, containers, highlighter, styled, screen, file_proxy (~793 LOC)

**Critical Check:** **ansi module should unblock 34 text tests!**

---

## 📋 SETUP

```bash
cd /Users/leemoore/code/rich-port/rich
git status  # Verify staged files
git diff --cached --stat
```

**Expected:**
- src/ansi.ts, src/containers.ts, src/highlighter.ts, src/styled.ts, src/screen.ts, src/file_proxy.ts
- tests/*.test.ts for each
- Updated PORT_LOG files

---

## 🔍 REVIEW CHECKLIST

### 1. Quality Checks (15 min)

```bash
cd rich-ts
npm test ansi containers highlighter styled screen file_proxy -- --run
npm test text -- --run  # CRITICAL: Should have 34 FEWER skipped tests!
npm run check
```

**Verify:**
- [ ] All Phase 12 tests pass
- [ ] **34 text tests now UN-SKIPPED** (were 36 skipped, now should be ~2)
- [ ] TypeScript compiles (0 errors)
- [ ] ESLint: 0 errors

**CRITICAL:** ansi module success = text tests un-skipped!

---

### 2. Correctness Review (45 min)

**ansi.ts vs rich/ansi.py (MOST IMPORTANT!):**
- [ ] AnsiDecoder parses SGR codes correctly?
- [ ] Color codes decoded properly (16/256/truecolor)?
- [ ] Style attributes mapped correctly?
- [ ] Text.fromAnsi() now works?
- [ ] State machine for parsing correct?

**containers.ts vs rich/containers.py:**
- [ ] Lines and Renderables classes correct?
- [ ] Protocols implemented?

**highlighter.ts vs rich/highlighter.py:**
- [ ] Abstract base correct?
- [ ] Subclasses (Repr, JSON, Regex, Null) work?

**styled.ts, screen.ts, file_proxy.ts:**
- [ ] Match Python behavior?

---

### 3. Output Format

Write to: **`rich-ts/phases/phase12/REVIEW_OUTPUT.md`**

Include:
- Executive summary with approval recommendation
- Test results (especially ansi impact on text tests!)
- TypeScript/lint results
- Correctness assessment per module
- Issues found (Critical/High/Medium/Low)
- Approval decision

---

## 🎯 CRITICAL SUCCESS METRIC

**ansi module must enable 34 previously skipped text tests!**

Run: `npm test text -- --run`

**Before Phase 12:** 36 tests skipped  
**After Phase 12:** Should be ~2 tests skipped

**If still 36 skipped:** ansi module has issues - REJECT and request fixes!

---

## ⏱️ Timeline: 2 hours

**START REVIEW!** 🔍

