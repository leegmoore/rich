# Code Review Checklist - Rich TypeScript Port

**Use this checklist for all code reviews**

---

## 🎯 Review Dimensions

### 1. Correctness (Weight: 40%)

**Algorithm Accuracy:**
- [ ] Algorithms match Python source behavior
- [ ] Math operations correct (color conversion, width distribution, etc.)
- [ ] Edge cases handled (empty inputs, nulls, extremes)
- [ ] Unicode handling correct (surrogate pairs, width calculations)

**Logic Validation:**
- [ ] Control flow correct (loops, conditionals, early returns)
- [ ] State management correct (no mutation bugs)
- [ ] Generator functions yield correctly
- [ ] Recursive calls terminate properly

**Error Handling:**
- [ ] Exceptions thrown for invalid inputs
- [ ] Error messages clear and helpful
- [ ] No silent failures
- [ ] Errors caught at boundaries

---

### 2. Type Safety (Weight: 25%)

**TypeScript Usage:**
- [ ] No `any` types (except explicitly needed with eslint-disable)
- [ ] Proper type annotations on functions
- [ ] Return types specified
- [ ] Generics used appropriately

**Type Correctness:**
- [ ] No type assertion abuse (`as` operator)
- [ ] Union types handled properly
- [ ] Optional chaining used where appropriate
- [ ] Nullish coalescing preferred over `||`

**Interface Design:**
- [ ] Public APIs well-typed
- [ ] Internal types documented
- [ ] Type exports organized
- [ ] No circular type dependencies

---

### 3. Performance (Weight: 15%)

**Efficiency:**
- [ ] No obvious O(n²) where O(n) possible
- [ ] Caching used for expensive operations
- [ ] Generators used for streaming
- [ ] Array allocations minimized

**Common Issues:**
- [ ] No repeated string concatenation (use array + join)
- [ ] No unnecessary object creation in loops
- [ ] Regex patterns compiled once
- [ ] Map/Set used over array search

**Optimization Opportunities:**
- [ ] Note any hot paths that could be optimized
- [ ] Suggest caching opportunities
- [ ] Flag expensive operations

---

### 4. Code Quality (Weight: 10%)

**Readability:**
- [ ] Clear variable names (no abbreviations like `clr`, `txt`)
- [ ] Functions focused (one responsibility)
- [ ] Complex logic has comments
- [ ] Magic numbers extracted as constants

**Consistency:**
- [ ] Patterns consistent across modules
- [ ] Naming conventions followed
- [ ] Error handling consistent
- [ ] Return style consistent (early returns vs if/else)

**Documentation:**
- [ ] JSDoc on all public APIs
- [ ] Complex algorithms explained
- [ ] TODOs are reasonable
- [ ] Examples for non-obvious usage

---

### 5. Testing (Weight: 10%)

**Coverage:**
- [ ] Main code paths tested
- [ ] Edge cases tested
- [ ] Error conditions tested
- [ ] Tests match Python test coverage

**Test Quality:**
- [ ] Tests are clear and focused
- [ ] Test names descriptive
- [ ] Assertions specific (not just "truthy")
- [ ] No commented-out tests without explanation

---

## 🐛 Common Issues to Look For

### Critical (Must Fix)

**1. Algorithm Errors**
- Incorrect color quantization
- Wrong Unicode width calculations
- Off-by-one errors in slicing
- Incorrect wrap/overflow logic

**2. Type Safety Violations**
- Unsafe type assertions without validation
- Using `any` without eslint-disable
- Non-null assertions without bounds checking
- Incorrect type narrowing

**3. Memory/Performance Issues**
- Infinite loops
- Memory leaks (unclosed resources)
- Quadratic complexity in hot paths
- Large allocations per render

**4. Integration Bugs**
- Protocol methods not called correctly
- Incorrect argument passing
- Missing error propagation
- Type incompatibilities

### High Priority (Should Fix)

**5. Error Handling Gaps**
- Missing validation on public APIs
- Silent failures (errors caught and ignored)
- Unclear error messages
- Wrong exception types

**6. Edge Case Handling**
- Empty strings/arrays not handled
- Null/undefined not checked
- Negative numbers not validated
- Overflow conditions not handled

**7. Type Issues**
- Weak types (too permissive)
- Missing type exports
- Inconsistent type usage
- Optional parameters without defaults

### Medium Priority (Nice to Fix)

**8. Code Clarity**
- Complex logic without comments
- Unclear variable names
- Long functions (>100 lines)
- Deep nesting (>4 levels)

**9. Inconsistencies**
- Different patterns for same operation
- Inconsistent error handling
- Mixed naming conventions
- Inconsistent return styles

### Low Priority (Polish)

**10. Documentation**
- Missing JSDoc
- Outdated comments
- TODOs without context
- No usage examples

**11. Style**
- Unnecessary complexity
- Could be more concise
- Better variable names
- Extract magic numbers

---

## 📝 Issue Severity Guide

### Critical
- **Impact:** Breaks core functionality, incorrect results, crashes
- **Examples:** Algorithm errors, type unsafety causing runtime errors, infinite loops
- **Action:** MUST fix before production

### High
- **Impact:** Major functionality impaired, poor UX, likely bugs
- **Examples:** Missing error handling, edge cases break, performance issues
- **Action:** SHOULD fix before release

### Medium
- **Impact:** Minor functionality issues, code clarity problems
- **Examples:** Inconsistent patterns, weak types, unclear code
- **Action:** Nice to fix, improves quality

### Low
- **Impact:** Polish, style preferences, minor improvements
- **Examples:** Better variable names, extract constants, add comments
- **Action:** Optional, time permitting

---

## 🔍 Review Process

### For Each Module:

1. **Read Python Source**
   - Understand intended behavior
   - Note algorithms and edge cases
   - Check test coverage

2. **Read TypeScript Implementation**
   - Compare to Python line-by-line
   - Check type safety
   - Note deviations

3. **Run Tests**
   - Verify tests pass
   - Check test coverage
   - Run specific module tests

4. **Check Types & Lint**
   - Run typecheck on file
   - Check lint output
   - Verify no suppressions without reason

5. **Document Findings**
   - Record in OUTPUT.md
   - Include file, line, severity
   - Provide specific recommendations

---

## 🎯 Grading Rubric

### Module Grade (A-F)

**A (Excellent):**
- Correct algorithm implementation
- Strong type safety
- Good performance
- Well-documented
- Comprehensive tests
- No critical or high issues

**B (Good):**
- Mostly correct
- Adequate type safety
- Acceptable performance
- Basic documentation
- Good test coverage
- Only medium/low issues

**C (Acceptable):**
- Functionally correct
- Some type safety issues
- Performance concerns
- Limited documentation
- Adequate tests
- 1-2 high priority issues

**D (Needs Work):**
- Questionable correctness
- Type safety problems
- Performance issues
- Poor documentation
- Gaps in testing
- Multiple high priority issues

**F (Unacceptable):**
- Incorrect implementation
- Serious type safety violations
- Critical bugs
- No documentation
- Insufficient testing
- Critical issues present

---

## 📊 Output Format

For each issue found, document:

```markdown
### Issue #X: [Brief Title]

**Severity:** Critical | High | Medium | Low
**File:** src/[module].ts
**Lines:** [line numbers]
**Category:** Correctness | Type Safety | Performance | Code Quality | Testing

**Description:**
[Clear explanation of the issue]

**Current Code:**
```typescript
[Show relevant code snippet]
```

**Problem:**
[Explain what's wrong]

**Recommendation:**
[Specific fix or improvement]

**Example Fix:**
```typescript
[Show corrected code if applicable]
```
```

---

**Use this checklist systematically for comprehensive, high-quality reviews!** 🔍

