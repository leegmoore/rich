===== CODE REVIEW PROMPT: PHASE 15 STAGED WORK =====

**Review:** Phase 15 - Final Complex Systems (5 modules) - **FINAL PHASE!**  
**Output File:** `rich-ts/phases/phase15/REVIEW_OUTPUT.md`

---

## 🎯 YOUR MISSION

Review STAGED code from Phase 15 - INCLUDING THE MAIN PROGRESS MODULE!

**Modules:** progress, pretty, scope, layout, prompt (~3,659 LOC)

**CRITICAL:** **progress module (1,715 LOC) - ORIGINAL SCOPE GOAL!** 🎯

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
npm test progress pretty scope layout prompt -- --run
npm run check
```

**Verify:**
- [ ] All Phase 15 tests pass
- [ ] **Progress module works!**
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors

---

### 2. Correctness (90 min - progress is HUGE!)

**CRITICAL - progress module:**
- [ ] Task management system works?
- [ ] All column types implemented?
- [ ] Live updates working?
- [ ] Speed/ETA calculations accurate?
- [ ] Test with example progress bar!

**Other modules:**
- [ ] pretty: Object traversal, circular refs
- [ ] scope: Integration with pretty
- [ ] layout: Region splits, recursive tree
- [ ] prompt: Input validation, Node.js readline

---

### 3. Integration Testing

**Test progress module with real example:**
```typescript
import { Progress } from './src/progress.js';

const progress = new Progress();
const task = progress.addTask('Test', { total: 100 });
for (let i = 0; i <= 100; i++) {
  progress.update(task, { completed: i });
}
```

**Should display:** Working progress bar with updates!

---

### 4. Output

Write to: `rich-ts/phases/phase15/REVIEW_OUTPUT.md`

Include: Detailed review of progress module (most important!)

---

## 🎉 FINAL PHASE REVIEW!

**If approved:** Rich TypeScript port is COMPLETE! All 63 modules done! 🎊

## ⏱️ Timeline: 4 hours (progress is huge!)

**START!** 🔍

