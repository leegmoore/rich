===== CODE REVIEW PASS 2: TEXT & UNICODE PROCESSING =====

**Review Group:** 2 - Text Processing & Unicode  
**Wave:** 1  
**Output File:** `review/wave1/group2_text_unicode_OUTPUT.md` (APPEND to existing)  
**Pass:** 2 of 2 (Production Hardening)

---

## 🎯 PASS 2 MISSION

**Context:** You already completed Pass 1 (Correctness, Quality, Types, API) for this group.

**This Pass Focuses On:**
1. ✅ **Performance** - Are there bottlenecks or inefficiencies?
2. ✅ **Hardening** - Error handling, input validation, graceful degradation
3. ✅ **Edge Cases** - Unicode weirdness, boundary conditions, empty inputs
4. ✅ **Reliability** - Memory leaks, resource management, stability

**Your Task:** Deep dive into production readiness of the same 4 modules

---

## 🔍 PASS 2 REVIEW DIMENSIONS

### 1. Performance (Hot Path Analysis)
**Question:** Will this be fast enough in production?

**Check for Text/Unicode modules:**
- [ ] **cells.ts:**
  - Binary search in `setCellSize()` - O(log n) confirmed?
  - Caching in `cellLen()` - effective hit rate?
  - `isSingleCellWidths()` optimization - worth it?
  - Hot loop allocations minimized?

- [ ] **text.ts:** (This is THE hot path!)
  - String concatenation vs array joining
  - Span operations allocation-heavy?
  - Wrapping algorithm complexity (should be O(n))
  - Generator usage vs array allocation
  - Repeated cell width calculations?

- [ ] **_wrap.ts:**
  - Word extraction efficiency
  - Unnecessary string operations?

**Tools:**
```bash
# Run performance-focused tests
cd rich-ts
npm test cells -- --run
npm test text -- --run

# Look for:
# - Tests that take >10ms
# - Repeated operations in loops
# - Large allocations
```

**Grade Impact:** 40% of Pass 2 score

---

### 2. Hardening (Production Safety)
**Question:** What happens when users do unexpected things?

**Check:**
- [ ] **Input Validation:**
  - Null/undefined checks on public APIs
  - Invalid inputs throw clear errors
  - Negative numbers rejected where invalid
  - Type coercion handled safely

- [ ] **Error Handling:**
  - Try/catch where appropriate
  - Error messages are actionable
  - Errors don't leak implementation details
  - Graceful degradation when possible

- [ ] **Boundary Conditions:**
  - Empty strings handled
  - Zero widths handled
  - Maximum values (Int overflow?)
  - Minimum values

**For Each Module:**
- Trace through with invalid inputs mentally
- Check error paths are tested
- Verify no silent failures

**Grade Impact:** 30% of Pass 2 score

---

### 3. Edge Cases (Unicode Hell)
**Question:** Does this handle Unicode properly?

**Unicode Edge Cases to Check:**
- [ ] **Surrogate Pairs (UTF-16):**
  - Emoji (stored as 2 code units in JS)
  - String indexing with `text[i]` vs `Array.from(text)`
  - Slicing through middle of emoji

- [ ] **Zero-Width Characters:**
  - Zero-width joiner (ZWJ)
  - Zero-width space
  - Combining characters

- [ ] **Width Calculations:**
  - East Asian characters (width 2)
  - Emoji (width 2)
  - Emoji with modifiers (still width 2?)
  - Regional indicator symbols (flags)

- [ ] **Line Breaking:**
  - Breaking at emoji boundaries
  - Breaking at East Asian characters
  - Breaking at combining sequences

**Test Scenarios:**
```typescript
// Does this work correctly?
cellLen('😀')              // Should be 2
cellLen('👨‍👩‍👧‍👦')          // Family emoji with ZWJ
setCellSize('😀😀', 1)    // Should return ' ' (space)
chopCells('こんにちは', 3)  // Japanese splitting
```

**Grade Impact:** 20% of Pass 2 score

---

### 4. Reliability (Won't Break)
**Question:** Can this run for hours/days without issues?

**Check:**
- [ ] **Memory Management:**
  - No memory leaks (caches have bounds?)
  - Generators used where appropriate
  - Large strings handled efficiently
  - No accumulation over time

- [ ] **Resource Cleanup:**
  - Captured output cleared
  - Caches have max size
  - No dangling references

- [ ] **State Management:**
  - Immutability where needed
  - No shared mutable state
  - Thread-safe (if relevant)

- [ ] **Infinite Loop Protection:**
  - All loops have termination conditions
  - Recursive calls have depth limits
  - Binary search has escape conditions

**Grade Impact:** 10% of Pass 2 score

---

## 📝 PASS 2 OUTPUT FORMAT

**APPEND to your existing OUTPUT file:** `review/wave1/group2_text_unicode_OUTPUT.md`

Add these sections:

```markdown
---

## PASS 2: Production Hardening Review

**Focus:** Performance, Hardening, Edge Cases, Reliability

**Quick Stats:**
- Performance: [Grade] - [1-2 sentence assessment]
- Hardening: [Grade] - [1-2 sentence assessment]  
- Edge Cases: [Grade] - [1-2 sentence assessment]
- Reliability: [Grade] - [1-2 sentence assessment]

**Top 3 Concerns:**
1. [Most critical production concern]
2. [Second concern]
3. [Third concern]

---

## Performance Issues (Pass 2)

### Critical Performance Issues
[Issues that will cause noticeable slowness]

### Optimization Opportunities
[Nice-to-have performance improvements]

---

## Hardening Issues (Pass 2)

### Missing Validation
[Inputs that should be validated]

### Error Handling Gaps
[Places where errors should be caught/thrown]

---

## Edge Case Issues (Pass 2)

### Unicode Edge Cases
[Specific Unicode scenarios that might break]

### Boundary Conditions
[Empty, zero, max value scenarios]

---

## Reliability Concerns (Pass 2)

### Memory/Resource Issues
[Potential leaks or unbounded growth]

### Stability Issues
[Things that could crash after running long-term]

---

## Pass 2 Module Assessments

### cells.ts (Production Readiness)
- Performance: [comment]
- Hardening: [comment]
- Edge Cases: [comment]
- Reliability: [comment]

[Repeat for each module]

---

## Combined Pass 1 + Pass 2 Final Grade

**Module Grades:**
- cells.ts: [A-F] (Pass 1: [A-F], Pass 2: [A-F])
- cell_widths.ts: [A-F]
- text.ts: [A-F]
- _wrap.ts: [A-F]

**Overall Group Grade:** [A-F]

**Final Recommendation:**
[Approve / Fix critical issues / Needs significant work]

**Priority Fix List:**
1. [Highest priority from both passes]
2. [Second priority]
3. [Third priority]
```

---

## ⏱️ PASS 2 TIMELINE

1. **Re-read code with new lens** (30 min) - Performance/reliability focus
2. **Performance analysis** (45 min) - Hot paths, allocations
3. **Hardening check** (30 min) - Validation, error handling
4. **Edge case hunting** (45 min) - Unicode weirdness
5. **Reliability check** (15 min) - Memory, loops, state
6. **Document findings** (30 min) - Append to output

**Total: 3 hours for Pass 2**

---

## 🎯 KEY PASS 2 QUESTIONS

### For cells.ts:
- Is `setCellSize()` binary search truly O(log n)?
- Does `cachedCellLen` have a size limit?
- What happens with a 10MB string?
- Emoji with skin tone modifiers - correct width?

### For text.ts:
- Span operations - unnecessary allocations?
- Wrapping a 10,000 line text - fast enough?
- Memory usage for large Text objects?
- Line ending edge cases (\r\n vs \n)?

### For _wrap.ts:
- Word extraction - handles all Unicode spaces?
- Division at emoji boundaries?

---

## 🚀 READY TO START PASS 2?

**Remember:** You already know the code from Pass 1!

Now focus on:
- **Will it be fast?**
- **Will it handle bad inputs?**
- **Will it handle weird Unicode?**
- **Will it run reliably?**

1. Review code with production lens
2. Test edge cases mentally
3. Look for performance issues
4. **APPEND** findings to OUTPUT file
5. Provide final combined grade

**GO!** 🔥

