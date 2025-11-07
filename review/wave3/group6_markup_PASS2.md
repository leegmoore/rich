===== CODE REVIEW PASS 2: MARKUP & EMOJI =====

**Review Group:** 6 - Markup & Emoji  
**Wave:** 3  
**Output File:** `review/wave3/group6_markup_OUTPUT.md` (APPEND)  
**Pass:** 2 of 2 (Production Hardening)

---

## 🎯 PASS 2 MISSION

**Context:** You completed Pass 1 for markup and emoji modules (~4,000 LOC, mostly data).

**This Pass Focuses On:**
1. ✅ **Performance** - Markup parsing and emoji replacement efficiency
2. ✅ **Hardening** - Malformed markup handling
3. ✅ **Edge Cases** - Nested tags, Unicode in markup, variant edge cases
4. ✅ **Reliability** - Regex safety, emoji dictionary completeness

---

## 🔍 PASS 2 KEY AREAS

### 1. Performance (40%)

**markup.ts:**
- [ ] Regex parsing - compiled once?
- [ ] Tag stack operations - efficient?
- [ ] Nested tag handling - O(n) or worse?
- [ ] Large markup strings (10KB+) - fast?

**emoji.ts:**
- [ ] Emoji lookup - O(1) Map access?
- [ ] Variant suffix - string concat or cached?
- [ ] replace() - regex performance on large strings?

**_emoji_replace.ts:**
- [ ] Regex compiled once (outside function)?
- [ ] Replacement function closures efficient?

**Performance Tests:**
```typescript
// Large markup
const markup = '[bold]' + 'text '.repeat(10000) + '[/bold]';
render(markup);  // Should be fast

// Many emoji replacements
const text = (':smiley: '.repeat(1000));
Emoji.replace(text);  // Should be fast
```

**Grade Impact:** 40%

---

### 2. Hardening (30%)

**Markup Validation:**
- [ ] Unmatched tags - good error?
- [ ] Malformed tag syntax - caught?
- [ ] Invalid style names - handled?
- [ ] Circular tag nesting - protected?
- [ ] Empty tag `[]` - handled?

**Emoji Validation:**
- [ ] Unknown emoji name - NoEmoji thrown?
- [ ] Emoji lookup - never returns undefined?
- [ ] Invalid variant - handled?

**Error Messages:**
- [ ] MarkupError messages helpful?
- [ ] NoEmoji messages clear?

**Grade Impact:** 30%

---

### 3. Edge Cases (20%)

**Markup Edge Cases:**
- [ ] Empty markup `''`
- [ ] Just closing tags `[/bold]`
- [ ] Nested same tag `[bold][bold]x[/bold][/bold]`
- [ ] Tag with special chars `[link=http://[test]]`
- [ ] Escaped brackets `\[not a tag]`
- [ ] Backslash at end `text\`

**Emoji Edge Cases:**
- [ ] Emoji with skin tone modifiers
- [ ] Emoji with ZWJ sequences (family emoji)
- [ ] Regional indicators (flag emoji)
- [ ] Variant on emoji that doesn't support it
- [ ] Mixed `:emoji:` and regular emoji in same string

**_emoji_codes.ts Validation:**
- [ ] All 3,600+ emoji are valid Unicode?
- [ ] No duplicate keys?
- [ ] No obvious typos in common emoji?

**Grade Impact:** 20%

---

### 4. Reliability (10%)

**Memory:**
- [ ] Emoji dictionary static (no leaks)?
- [ ] Markup parser doesn't accumulate state?
- [ ] Tag stack doesn't leak?

**Regex Safety:**
- [ ] No ReDoS (Regular Expression Denial of Service)?
- [ ] Backtracking bounded?

**Grade Impact:** 10%

---

## 📝 PASS 2 OUTPUT

**APPEND to:** `review/wave3/group6_markup_OUTPUT.md`

Focus on:
- Markup parser edge cases
- Emoji dictionary validation (spot check)
- Performance of parsing/replacement
- Error handling for malformed input

---

## ⏱️ Timeline: 1.5 hours

(Mostly data file - quick validation)

**GO!** 🔥

