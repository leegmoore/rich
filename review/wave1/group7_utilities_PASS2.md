===== CODE REVIEW PASS 2: UTILITIES & HELPERS =====

**Review Group:** 7 - Utilities & Helpers  
**Wave:** 1  
**Output File:** `review/wave1/group7_utilities_OUTPUT.md` (APPEND)  
**Pass:** 2 of 2 (Production Hardening)

---

## 🎯 PASS 2 MISSION

**Context:** You completed Pass 1 for 7 small utility modules (~500 LOC).

**This Pass Focuses On:**
1. ✅ **Performance** - Are these utilities efficient?
2. ✅ **Hardening** - Edge case handling
3. ✅ **Reliability** - No surprises in production

**Note:** These are small modules - Pass 2 should be quick!

---

## 🔍 PASS 2 REVIEW FOCUS

### 1. Performance (40%)

**_ratio.ts (CRITICAL - used by Table):**
- [ ] `ratioDistribute()` - O(n) or O(n²)?
- [ ] Repeated Math.floor() calls - could optimize?
- [ ] Array allocations - minimize?

**_loop.ts:**
- [ ] Generator overhead acceptable?
- [ ] Alternative: pre-compute vs iterate?

**repr.ts:**
- [ ] Object.prototype patching - performance impact?
- [ ] Dynamic attribute access slow?

**Quick Tests:**
```typescript
// Ratio with 100 columns
ratioDistribute(1000, Array(100).fill(1));

// Loop large array
for (const [isLast, val] of loopLast(Array(10000).fill(0))) {}
```

---

### 2. Hardening (30%)

**Input Validation:**
- [ ] _ratio: What if ratios are negative?
- [ ] _ratio: What if total is 0 or negative?
- [ ] _loop: What if iterable is empty?
- [ ] _pick: What if all values undefined?
- [ ] repr: What if object has circular refs?

**Error Handling:**
- [ ] errors.ts: All error classes have good messages?
- [ ] protocol.ts: isRenderable() never throws?

---

### 3. Edge Cases (20%)

**_ratio.ts Edge Cases:**
- [ ] Empty ratios array
- [ ] All ratios are 0
- [ ] Total < sum of minimums
- [ ] Rounding errors accumulate?

**_loop.ts Edge Cases:**
- [ ] Single item iterable
- [ ] Infinite iterator (could it be?)

**repr.ts Edge Cases:**
- [ ] Primitives (numbers, strings)
- [ ] null/undefined
- [ ] Objects without __richRepr__

---

### 4. Reliability (10%)

**Memory:**
- [ ] No caches that grow unbounded
- [ ] Prototype patching reversible?
- [ ] No leaked references

---

## 📝 PASS 2 OUTPUT

**APPEND to:** `review/wave1/group7_utilities_OUTPUT.md`

```markdown
---

## PASS 2: Production Hardening Review

**Quick Stats:**
- Performance: [Grade]
- Hardening: [Grade]
- Edge Cases: [Grade]
- Reliability: [Grade]

**Top Concerns:**
1. [Most critical]
2. [Second]
3. [Third]

---

## Performance Issues

[Focus on _ratio.ts - used by Table in hot path]

---

## Hardening Issues

[Input validation, error handling]

---

## Edge Case Issues

[Boundary conditions, empty inputs]

---

## Combined Final Assessment

**Pass 1 Grade:** [A-F]
**Pass 2 Grade:** [A-F]
**Combined Grade:** [A-F]

**Production Ready?** [Yes/No]

**Priority Fixes:**
1. [If any]
```

---

## ⏱️ Timeline: 1.5 hours for Pass 2

These are simple modules - quick validation!

**GO!** 🔥

