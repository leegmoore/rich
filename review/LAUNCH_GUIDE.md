# 🚀 Quick Launch Guide - Code Review Execution

**Copy and paste prompts in order. Keep context open for Pass 2!**

---

## 📋 Wave 1 - Launch These 3 in Parallel

### **Agent A: Text & Unicode**
```
Files: cells.ts, cell_widths.ts, text.ts, _wrap.ts (~2,300 LOC)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave1/group2_text_unicode_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave1/group2_text_unicode_PASS2.md`  
**Output:** `review/wave1/group2_text_unicode_OUTPUT.md`

---

### **Agent B: Rendering Engine**
```
Files: segment.ts, console.ts, measure.ts (~1,600 LOC)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave1/group3_rendering_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave1/group3_rendering_PASS2.md`  
**Output:** `review/wave1/group3_rendering_OUTPUT.md`

---

### **Agent C: Utilities**
```
Files: _loop.ts, _pick.ts, _ratio.ts, repr.ts, protocol.ts, errors.ts, themes.ts (~500 LOC)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave1/group7_utilities_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave1/group7_utilities_PASS2.md`  
**Output:** `review/wave1/group7_utilities_OUTPUT.md`

---

**⏸️ WAIT for all 3 agents to complete BOTH passes before Wave 2**

---

## 📋 Wave 2 - Launch These 3 in Parallel

### **Agent D: Colors & Styles**
```
Files: color_triplet.ts, color.ts, style.ts, default_styles.ts, theme.ts (~2,000 LOC)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave2/group1_colors_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave2/group1_colors_PASS2.md`  
**Output:** `review/wave2/group1_colors_OUTPUT.md`

---

### **Agent E: Layout Components**
```
Files: table.ts, columns.ts, panel.ts, padding.ts, align.ts, constrain.ts (~1,150 LOC)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave2/group4_layouts_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave2/group4_layouts_PASS2.md`  
**Output:** `review/wave2/group4_layouts_OUTPUT.md`

---

### **Agent F: Box & Visual**
```
Files: box.ts, rule.ts, control.ts (~650 LOC)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave2/group5_boxes_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave2/group5_boxes_PASS2.md`  
**Output:** `review/wave2/group5_boxes_OUTPUT.md`

---

**⏸️ WAIT for all 3 agents to complete BOTH passes before Wave 3**

---

## 📋 Wave 3 - Launch This 1 Agent

### **Agent G: Markup & Emoji**
```
Files: markup.ts, emoji.ts, _emoji_replace.ts, _emoji_codes.ts (~4,000 LOC, mostly data)
```

**Pass 1 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave3/group6_markup_PROMPT.md`  
**Pass 2 Prompt:** `/Users/leemoore/code/rich-port/rich/review/wave3/group6_markup_PASS2.md`  
**Output:** `review/wave3/group6_markup_OUTPUT.md`

---

## ✅ After All Reviews Complete

**Collect these 7 OUTPUT files:**
1. `review/wave1/group2_text_unicode_OUTPUT.md`
2. `review/wave1/group3_rendering_OUTPUT.md`
3. `review/wave1/group7_utilities_OUTPUT.md`
4. `review/wave2/group1_colors_OUTPUT.md`
5. `review/wave2/group4_layouts_OUTPUT.md`
6. `review/wave2/group5_boxes_OUTPUT.md`
7. `review/wave3/group6_markup_OUTPUT.md`

**Then:**
- Consolidate all issues by severity
- Create prioritized fix list
- Celebrate thorough code review! 🎉

---

## 📊 Expected Timeline

| Wave | Agents | Time per Agent | Calendar Time |
|------|--------|----------------|---------------|
| Wave 1 | 3 parallel | 4-7 hours | Day 1 |
| Wave 2 | 3 parallel | 4-7 hours | Day 2 |
| Wave 3 | 1 agent | 3-5 hours | Day 3 |

**Total: 3 days with parallelization** 🚀

---

## 🎯 Remember

**For Each Agent:**
1. Copy Pass 1 prompt file path
2. Give to Codex CLI agent
3. Wait for Pass 1 complete
4. **Keep same context open**
5. Copy Pass 2 prompt file path
6. Give to same agent
7. Agent appends to OUTPUT file
8. Review complete for that group!

**Context must stay open between Pass 1 and Pass 2!**

---

## 📁 File Paths Summary

All paths relative to repo root: `/Users/leemoore/code/rich-port/rich/`

**Context files (read these first):**
- `review/PROJECT_OVERVIEW.md`
- `review/REVIEW_CHECKLIST.md`
- `review/TWO_PASS_STRATEGY.md`

**Wave 1 Prompts:**
- `review/wave1/group2_text_unicode_PROMPT.md` → `*_PASS2.md`
- `review/wave1/group3_rendering_PROMPT.md` → `*_PASS2.md`
- `review/wave1/group7_utilities_PROMPT.md` → `*_PASS2.md`

**Wave 2 Prompts:**
- `review/wave2/group1_colors_PROMPT.md` → `*_PASS2.md`
- `review/wave2/group4_layouts_PROMPT.md` → `*_PASS2.md`
- `review/wave2/group5_boxes_PROMPT.md` → `*_PASS2.md`

**Wave 3 Prompts:**
- `review/wave3/group6_markup_PROMPT.md` → `*_PASS2.md`

---

**Ready to launch comprehensive code reviews!** 🎯

