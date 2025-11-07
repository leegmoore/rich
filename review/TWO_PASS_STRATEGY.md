# Two-Pass Code Review Strategy

**Why Two Passes?** Different mindsets for different concerns

---

## 🎯 The Philosophy

**Pass 1: "Is this good code?"**
- Can I understand it?
- Does it do what it claims?
- Are the types helping me?
- Would I want to use this API?

**Pass 2: "Will this survive production?"**
- Will it handle 10,000 emoji in a row?
- What if someone passes null?
- Is this fast enough for real use?
- Will it leak memory after 1000 renders?

---

## ⚖️ Criteria Balance

### Pass 1: Foundation Quality (40% Correctness focus)

| Dimension | Weight | Key Question |
|-----------|--------|--------------|
| **Correctness** | 40% | Does it implement Python behavior correctly? |
| **Code Quality** | 25% | Can another dev understand this? |
| **TypeScript Quality** | 25% | Do types help catch bugs? |
| **API Usability** | 10% | Is the public API intuitive? |

**Goal:** Verify the code is fundamentally sound

**Fixes:** Must fix correctness issues; should improve quality/types

---

### Pass 2: Production Hardening (40% Performance focus)

| Dimension | Weight | Key Question |
|-----------|--------|--------------|
| **Performance** | 40% | Fast enough for real use? Hot paths optimized? |
| **Hardening** | 30% | Handles bad inputs? Error handling complete? |
| **Edge Cases** | 20% | Unicode weirdness? Boundary conditions? |
| **Reliability** | 10% | Memory leaks? Resource cleanup? Long-running stability? |

**Goal:** Verify the code can handle production abuse

**Fixes:** Must fix critical performance issues; should harden API surface

---

## 🔄 Why Keep Context Open?

**Benefits:**
1. **Deep Understanding:** Agent already knows the code from Pass 1
2. **Cross-Reference:** Can reference Pass 1 findings in Pass 2
3. **Efficiency:** No re-reading, jump straight to production concerns
4. **Pattern Recognition:** See patterns across both passes

**How It Works:**
1. Agent finishes Pass 1, writes to OUTPUT
2. You give agent the Pass 2 prompt (same context)
3. Agent appends Pass 2 findings to same OUTPUT
4. Final OUTPUT has complete picture

---

## 📊 What Gets Found Where?

### Typically Found in Pass 1:
- ❌ Algorithm doesn't match Python
- ❌ Missing JSDoc on public methods
- ❌ Using `any` without justification
- ❌ Confusing variable names
- ❌ Inconsistent error handling
- ❌ Weak type definitions
- ❌ Unclear public API

### Typically Found in Pass 2:
- ❌ O(n²) loop in hot path
- ❌ Missing input validation (null checks)
- ❌ Emoji with modifiers handled wrong
- ❌ Cache grows unbounded
- ❌ Binary search missing termination check
- ❌ Memory allocated repeatedly in loop
- ❌ Edge case: empty string breaks function

---

## 🎯 Grading System

### Module Grade Calculation

**Pass 1 Grade (A-F):**
- Based on: Correctness (40%) + Code Quality (25%) + TS Quality (25%) + API (10%)

**Pass 2 Grade (A-F):**
- Based on: Performance (40%) + Hardening (30%) + Edge Cases (20%) + Reliability (10%)

**Combined Final Grade:**
- Average of Pass 1 and Pass 2
- OR: Minimum of the two (conservative)
- OR: Weighted (Pass 1: 60%, Pass 2: 40%)

---

## ⏱️ Time Allocation

**Per Agent Per Group:**
- Pass 1: 2-4 hours (depends on complexity)
- Pass 2: 2-3 hours (narrower focus)
- **Total: 4-7 hours per agent**

**For All 7 Groups:**
- Wave 1 (3 agents): 4-7 hours each
- Wave 2 (3 agents): 4-7 hours each
- Wave 3 (1 agent): 3-5 hours

**Calendar Time with Parallel:**
- Day 1: Wave 1 Pass 1 + Pass 2
- Day 2: Wave 2 Pass 1 + Pass 2
- Day 3: Wave 3 Pass 1 + Pass 2
- **Total: 3 days**

---

## 💡 Key Insights

### Why Not Single Pass?

**Single pass problems:**
- Too many things to think about at once
- Performance mindset conflicts with correctness mindset
- Agents get overwhelmed
- Miss subtle issues

**Two-pass benefits:**
- Clear mental model per pass
- Deeper in each dimension
- Second pass catches what first missed
- Better coverage overall

### Why This Specific Balance?

**Pass 1 (Correctness-heavy):**
- Most important: Does it work right?
- Tests pass, but are tests complete?
- Foundation must be solid

**Pass 2 (Performance-heavy):**
- Terminal rendering is performance-sensitive
- Users will notice slow renders
- Unicode edge cases are real
- Production environments are unforgiving

---

## 🎓 Agent Instructions

### For Pass 1:
"Review as if you're onboarding to this codebase. Does it make sense? Is it correct? Would you trust these types? Would you want to use this API?"

### For Pass 2:
"Review as if you're deploying to production. Will this handle real user behavior? Is it fast enough? What breaks it? Will it run for days?"

---

## 📋 Quick Reference

**Pass 1 Outputs:** Foundation assessment, correctness issues, type problems, API concerns  
**Pass 2 Outputs:** Performance issues, hardening needs, edge case failures, reliability concerns  
**Combined:** Complete production-readiness assessment

**Critical → High → Medium → Low severity for both passes**

---

**This strategy ensures comprehensive, actionable code reviews!** 🎯

