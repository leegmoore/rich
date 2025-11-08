# Phase Execution Workflow - Port → Review → Merge

**For Phases 11-15**

---

## 🔄 Two-Step Workflow Per Phase

### **Step 1: PORTING (Coding Agent)**
Agent ports modules using TDD, stages changes (no commit)

**Input:** `phases/phaseN/QUICK_START_PHASEN.txt`  
**Output:** Staged changes (`git add -A`, NOT committed)  
**Duration:** Varies by phase

### **Step 2: REVIEW (Review Agent)**  
Agent reviews staged code, gives approval

**Input:** `phases/phaseN/REVIEW_PHASEN.md`  
**Output:** `phases/phaseN/REVIEW_OUTPUT.md` with approval decision  
**Duration:** 1-4 hours depending on phase size

### **Step 3: MERGE (You)**
If approved, commit and push:
```bash
git commit -m "Phase N complete: [modules]"
git push
```

If not approved: Fix issues, re-review

---

## 📋 Phase 11 Example Workflow

### **Agent A - Porting:**
```
Launch with: phases/phase11/QUICK_START_PHASE11.txt
Ports: pager, palette, _palettes, terminal_theme
Result: git add -A (staged, not committed)
Updates: PORT_LOG files show DONE
```

### **Agent B - Review:**
```
Launch with: phases/phase11/REVIEW_PHASE11.md
Checks: Tests, typecheck, lint, correctness vs Python
Result: REVIEW_OUTPUT.md with APPROVE/REJECT
```

### **You - Merge:**
```
Read: phases/phase11/REVIEW_OUTPUT.md
If approved: git commit && git push
If not: Address issues, re-review
```

---

## 🎯 Current Status

**Phase 10:** ✅ 4/4 modules done (pager moved to Phase 11)  
**Phase 11:** 📋 Ready to launch (4 modules: pager + palette system)  
**Phases 12-15:** 📋 Materials ready, awaiting Phase 11 completion

---

## 📝 File Locations

**For Each Phase:**

**Porting:**
- `phases/phaseN/QUICK_START_PHASEN.txt` (concise)
- `phases/phaseN/PROMPT_PHASEN.md` (detailed)
- `phases/phaseN/PORT_LOG_*.md` (per-module tracking)

**Review:**
- `phases/phaseN/REVIEW_PHASEN.md` (review instructions)
- `phases/phaseN/REVIEW_OUTPUT.md` (agent creates this)

---

## ✅ Ready to Execute

**Next:** Launch Phase 11 porting with:
```
/Users/leemoore/code/rich-port/rich/rich-ts/phases/phase11/QUICK_START_PHASE11.txt
```

**After porting done:** Launch Phase 11 review with:
```
/Users/leemoore/code/rich-port/rich/rich-ts/phases/phase11/REVIEW_PHASE11.md
```

**Repeat for Phases 12-15!**

---

**This ensures quality at every step - port, review, merge!** 🎯

