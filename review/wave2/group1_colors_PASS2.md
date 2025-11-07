===== CODE REVIEW PASS 2: COLOR SYSTEM & STYLING =====

**Review Group:** 1 - Color System & Styling  
**Wave:** 2  
**Output File:** `review/wave2/group1_colors_OUTPUT.md` (APPEND)  
**Pass:** 2 of 2 (Production Hardening)

---

## 🎯 PASS 2 MISSION

**Context:** You completed Pass 1 for color, style, and theme modules (~2,000 LOC).

**This Pass Focuses On:**
1. ✅ **Performance** - Color conversion and ANSI generation are frequent operations
2. ✅ **Hardening** - Must handle invalid color strings gracefully
3. ✅ **Edge Cases** - Color edge cases, style combinations
4. ✅ **Reliability** - Caching behavior, memory stability

---

## 🔍 PASS 2 KEY AREAS

### 1. Performance (40%)

**color.ts Hot Paths:**
- [ ] Color parsing - called frequently, cached?
- [ ] `downgrade()` - Complex algorithm, optimized?
- [ ] ANSI code generation - string concat vs array join?
- [ ] RGB → HLS conversion - efficient?
- [ ] Color quantization (8-bit) - lookup table vs calculation?

**style.ts Hot Paths:**
- [ ] `parse()` - Cached or re-parsed each time?
- [ ] `render()` - ANSI code generation per segment
- [ ] Style combination (`+`) - creates new objects - pool them?
- [ ] SGR code generation - string building efficient?

**theme.ts:**
- [ ] Style lookup - Map or object access?
- [ ] Theme inheritance - copies all styles?

**Performance Tests:**
```typescript
// Parse 1000 colors
for (let i = 0; i < 1000; i++) {
  Color.parse('rgb(255,0,0)');
}

// Generate 1000 ANSI codes
const style = Style.parse('bold red');
for (let i = 0; i < 1000; i++) {
  style.render('text', ColorSystem.TRUECOLOR);
}
```

**Grade Impact:** 40% of Pass 2 score

---

### 2. Hardening (30%)

**Color Validation:**
- [ ] Invalid hex colors - graceful error or throw?
- [ ] RGB values out of range (300, -5)?
- [ ] Named colors - typos caught?
- [ ] Color strings with weird spacing?

**Style Validation:**
- [ ] Invalid style strings - good error messages?
- [ ] Conflicting attributes (bold + not bold)?
- [ ] Invalid color names in style?

**Theme Validation:**
- [ ] Missing style in theme - fallback?
- [ ] Malformed INI config - clear errors?
- [ ] Theme stack underflow - protected?

**Grade Impact:** 30% of Pass 2 score

---

### 3. Edge Cases (20%)

**Color Edge Cases:**
- [ ] Black (0,0,0) vs default color
- [ ] White (255,255,255) edge case
- [ ] Colors at terminal limits (16 vs 256 vs truecolor)
- [ ] Downgrade to 16-color - boundary colors correct?
- [ ] Ansi color 0-255 range validation

**Style Edge Cases:**
- [ ] Null style behavior
- [ ] Empty style string
- [ ] Style with only spaces
- [ ] Multiple of same attribute (bold bold)
- [ ] Style combination edge cases

**Theme Edge Cases:**
- [ ] Empty theme
- [ ] Theme with circular inheritance?
- [ ] Style name not found

**Grade Impact:** 20% of Pass 2 score

---

### 4. Reliability (10%)

**Memory:**
- [ ] Color parse cache - max size?
- [ ] Style cache - bounded?
- [ ] Theme style dictionary - memory leak?

**State Management:**
- [ ] Immutable where needed (colors, styles)?
- [ ] No shared mutable state?

**Grade Impact:** 10% of Pass 2 score

---

## 📝 PASS 2 OUTPUT

**APPEND to:** `review/wave2/group1_colors_OUTPUT.md`

Include:
- Pass 2 dimension grades
- Performance analysis (focus on color.ts and style.ts)
- Hardening gaps
- Edge case failures
- Reliability concerns
- Combined final assessment

---

## ⏱️ Timeline: 2.5 hours

**GO!** 🔥

