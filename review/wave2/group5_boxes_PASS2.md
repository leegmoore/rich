===== CODE REVIEW PASS 2: BOX DRAWING & VISUAL =====

**Review Group:** 5 - Box Drawing & Visual Elements  
**Wave:** 2  
**Output File:** `review/wave2/group5_boxes_OUTPUT.md` (APPEND)  
**Pass:** 2 of 2 (Production Hardening)

---

## 🎯 PASS 2 MISSION

**Context:** You completed Pass 1 for box, rule, control modules (~650 LOC).

**This Pass Focuses On:**
1. ✅ **Performance** - Box drawing in tables happens frequently
2. ✅ **Hardening** - Must handle platform differences
3. ✅ **Edge Cases** - Box parsing, Unicode rendering
4. ✅ **Reliability** - Platform compatibility

---

## 🔍 PASS 2 KEY AREAS

### 1. Performance (40%)

**box.ts:**
- [ ] Box parsing - called once or repeated?
- [ ] `getTop()`, `getRow()`, `getBottom()` - string building efficient?
- [ ] Character repetition optimized?
- [ ] Substitution lookups - Map vs if/else?

**rule.ts:**
- [ ] Character repetition for wide consoles?
- [ ] Title placement calculation?

**control.ts:**
- [ ] ANSI escape code generation cached?
- [ ] Strip operations efficient?

**Performance Tests:**
```typescript
// Wide rule
const console = new Console({ width: 1000 });
console.rule('Title');  // Should be instant

// Large table (many box operations)
const table = new Table();
for (let i = 0; i < 100; i++) table.addRow('x', 'y', 'z');
console.print(table);
```

**Grade Impact:** 40%

---

### 2. Hardening (30%)

**Box Validation:**
- [ ] Invalid box string (not 8 lines)?
- [ ] Box line too short (< 4 chars)?
- [ ] Box with invalid Unicode?
- [ ] Null box handled?

**Rule Validation:**
- [ ] Invalid alignment value?
- [ ] Negative width?
- [ ] Empty title handling?

**Control Code Validation:**
- [ ] Invalid control type?
- [ ] Negative positions?
- [ ] Out of range values?

**Platform Compatibility:**
- [ ] Windows legacy mode tested?
- [ ] ASCII fallback works?
- [ ] Safe box substitution correct?

**Grade Impact:** 30%

---

### 3. Edge Cases (20%)

**Box Edge Cases:**
- [ ] Substitution map keys correct?
- [ ] All 20 box styles parse correctly?
- [ ] getPlainHeadedBox() mappings correct?
- [ ] Edge widths (0, 1, very large)?

**Rule Edge Cases:**
- [ ] Zero width console
- [ ] Title longer than width
- [ ] Empty character string

**Control Edge Cases:**
- [ ] Control codes in segment arrays
- [ ] Strip vs escape differences

**Grade Impact:** 20%

---

### 4. Reliability (10%)

**Box Stability:**
- [ ] Parsing 1000 boxes - memory stable?
- [ ] Substitution maps static (no leaks)?

**Grade Impact:** 10%

---

## 📝 PASS 2 OUTPUT

**APPEND to:** `review/wave2/group5_boxes_OUTPUT.md`

---

## ⏱️ Timeline: 2 hours

**GO!** 🔥

