===== CODE REVIEW PASS 2: LAYOUT COMPONENTS =====

**Review Group:** 4 - Layout Components  
**Wave:** 2  
**Output File:** `review/wave2/group4_layouts_OUTPUT.md` (APPEND)  
**Pass:** 2 of 2 (Production Hardening)

---

## 🎯 PASS 2 MISSION

**Context:** You completed Pass 1 for table, columns, panel, padding, align, constrain (~1,150 LOC).

**This Pass Focuses On:**
1. ✅ **Performance** - Table rendering can be complex with many columns/rows
2. ✅ **Hardening** - Layout code must handle weird sizes gracefully
3. ✅ **Edge Cases** - Zero widths, empty tables, overflow scenarios
4. ✅ **Reliability** - Layout calculations must be stable

---

## 🔍 PASS 2 KEY AREAS

### 1. Performance (40%)

**table.ts (CRITICAL - 1,087 LOC):**
- [ ] `_calculateColumnWidths()` - Complexity for 100 columns?
- [ ] `_collapseWidths()` - Iterative reduction efficient?
- [ ] Ratio distribution - optimal algorithm?
- [ ] Rendering 100 rows - linear time?
- [ ] Cell generation - allocation heavy?
- [ ] Box character building - string concat?

**columns.ts:**
- [ ] Column width calculation - efficient?
- [ ] Uses Table.grid() - overhead acceptable?
- [ ] Many renderables - scales well?

**panel.ts:**
- [ ] Border rendering - optimized?
- [ ] Title placement calculation - fast?

**Performance Tests:**
```typescript
// Large table
const table = new Table();
for (let i = 0; i < 100; i++) table.addColumn(`Col${i}`);
for (let i = 0; i < 1000; i++) table.addRow(...Array(100).fill('x'));
console.print(table);  // Should not hang

// Many panels
for (let i = 0; i < 1000; i++) {
  console.print(new Panel('text'));
}
```

**Grade Impact:** 40%

---

### 2. Hardening (30%)

**Table Validation:**
- [ ] Negative widths handled?
- [ ] Zero columns - error or empty table?
- [ ] Mismatched row lengths - padded or error?
- [ ] Min width > max width - caught?
- [ ] Invalid ratio values?

**Layout Validation:**
- [ ] Panel with negative padding?
- [ ] Align with invalid alignment string?
- [ ] Constrain with negative width?
- [ ] Columns with zero width?

**Error Handling:**
- [ ] Box errors propagated?
- [ ] Rendering errors caught?
- [ ] Measurement errors handled?

**Grade Impact:** 30%

---

### 3. Edge Cases (20%)

**Table Edge Cases:**
- [ ] Empty table (0 rows, 0 columns)
- [ ] Table with only headers
- [ ] Single column table
- [ ] Very wide table (exceeds console width)
- [ ] Grid mode with sections
- [ ] Row with null/undefined cells

**Panel Edge Cases:**
- [ ] Panel with empty content
- [ ] Panel wider than console
- [ ] Panel with zero padding
- [ ] Title longer than panel width

**Columns Edge Cases:**
- [ ] Empty columns (no renderables)
- [ ] Single item
- [ ] All items same width vs varied

**Grade Impact:** 20%

---

### 4. Reliability (10%)

**Memory:**
- [ ] Table with 10,000 rows - memory stable?
- [ ] Column width caches bounded?
- [ ] No accumulation in ratios?

**Stability:**
- [ ] Layout calculations always terminate?
- [ ] No infinite loops in width distribution?

**Grade Impact:** 10%

---

## 📝 PASS 2 OUTPUT

**APPEND to:** `review/wave2/group4_layouts_OUTPUT.md`

Focus on:
- Table performance (most complex)
- Layout validation gaps
- Edge case scenarios
- Memory stability

---

## ⏱️ Timeline: 3 hours

**GO!** 🔥

