# Rich TypeScript Code Review Plan

**Total Code:** 32 modules, ~13,748 LOC (excluding data files)  
**Review Goal:** Comprehensive quality review with parallel agents  
**Strategy:** Group by functionality and dependency clusters

---

## 📋 Review Group Breakdown

### **Group 1: Color System & Styling** (~2,000 LOC)
**Focus:** Color handling, style parsing, theme management

**Modules (5):**
1. `color_triplet.ts` (53 LOC) - RGB color representation
2. `color.ts` (993 LOC) - Color parsing, ANSI, conversion, downgrade algorithms
3. `style.ts` (942 LOC) - Style class, parsing, ANSI rendering, combination
4. `default_styles.ts` (171 LOC) - 152 style definitions
5. `theme.ts` (151 LOC) - Theme class, ThemeStack, INI config

**Review Focus:**
- Color quantization algorithms (RGB → 8-bit, 16-color)
- Style parsing and ANSI code generation
- Theme inheritance and style lookup
- Color space conversions (RGB, HLS)
- Edge cases: invalid colors, style conflicts

**Dependencies:** Standalone (minimal external deps)

**Estimated Review Time:** 2-3 hours per agent

---

### **Group 2: Text Processing & Unicode** (~2,300 LOC)
**Focus:** Text manipulation, Unicode handling, wrapping

**Modules (4):**
1. `cells.ts` (234 LOC) - Cell width calculations, Unicode awareness
2. `cell_widths.ts` (454 LOC) - Unicode width lookup tables
3. `text.ts` (1,616 LOC) - Text class, spans, wrapping, justify, overflow
4. `_wrap.ts` (82 LOC) - Word wrapping utilities

**Review Focus:**
- Unicode character width calculations (East Asian, emoji)
- Text wrapping algorithms (words, whitespace, overflow)
- Span management (style ranges)
- Edge cases: emoji, surrogate pairs, zero-width chars
- Performance: Binary search in setCellSize, caching

**Dependencies:** Standalone utilities

**Estimated Review Time:** 3-4 hours per agent

---

### **Group 3: Rendering Engine** (~1,600 LOC)
**Focus:** Core rendering pipeline, segment handling, measurement

**Modules (3):**
1. `segment.ts` (756 LOC) - Segment class, line operations, control codes
2. `console.ts` (620 LOC) - Console class, rendering pipeline, capture
3. `measure.ts` (196 LOC) - Measurement protocol, width/height calculations

**Review Focus:**
- Segment operations: split, crop, pad, apply styles
- Console rendering pipeline: string → Text → Segments → ANSI
- Measurement protocol: how renderables report width/height
- Control code handling (cursor movement, etc.)
- Capture mode implementation
- Edge cases: empty segments, zero-width, line endings

**Dependencies:** Uses color, style, text (Group 1 & 2)

**Estimated Review Time:** 3-4 hours per agent

---

### **Group 4: Layout Components** (~1,150 LOC)
**Focus:** Tables, columns, panels, padding, alignment

**Modules (6):**
1. `table.ts` (1,087 LOC) - Table class, column/row management, rendering
2. `columns.ts` (219 LOC) - Multi-column layouts
3. `panel.ts` (320 LOC) - Bordered panels
4. `padding.ts` (181 LOC) - Padding wrapper
5. `align.ts` (259 LOC) - Alignment wrapper
6. `constrain.ts` (44 LOC) - Width constraint wrapper

**Review Focus:**
- Table: Column width calculations, ratio distribution, box integration
- Layout algorithms: column auto-sizing, wrapping, distribution
- Box drawing: proper Unicode rendering, corner cases
- Measurement integration: accurate width/height calculations
- Edge cases: empty tables, overflow, min/max widths

**Dependencies:** Uses segments, console, box, measure (Group 3)

**Estimated Review Time:** 3-4 hours per agent

---

### **Group 5: Box Drawing & Visual Elements** (~650 LOC)
**Focus:** Box characters, rules, visual separators

**Modules (3):**
1. `box.ts` (332 LOC) - Box class, 20+ box styles, platform substitution
2. `rule.ts` (159 LOC) - Horizontal rules with titles
3. `control.ts` (228 LOC) - Terminal control codes, cursor movement

**Review Focus:**
- Box: Parsing 8-line box format, all 20+ box styles correct
- Box substitution: Windows legacy, ASCII fallback
- Rule: Alignment, character repetition, title placement
- Control codes: Proper ANSI escape sequences
- Edge cases: box parsing errors, invalid control codes

**Dependencies:** Uses console, text (Group 3)

**Estimated Review Time:** 2 hours per agent

---

### **Group 6: Markup & Emoji** (~4,000 LOC)
**Focus:** Markup parsing, emoji replacement

**Modules (4):**
1. `markup.ts` (252 LOC) - Markup parser, tag handling, escape sequences
2. `emoji.ts` (79 LOC) - Emoji class, variant support
3. `_emoji_replace.ts` (40 LOC) - Emoji :code: replacement
4. `_emoji_codes.ts` (3,610 LOC) - **DATA FILE** - 3,600+ emoji dictionary

**Review Focus:**
- Markup: Tag parsing regex, nested tags, escape handling
- Emoji replacement: :emoji: → character conversion
- Variant support: text (\uFE0E) vs emoji (\uFE0F)
- Edge cases: invalid tags, unmatched brackets, unknown emoji
- **Note:** _emoji_codes is pure data, quick spot check only

**Dependencies:** Uses text, style (Group 1 & 2)

**Estimated Review Time:** 1-2 hours per agent (mostly data validation)

---

### **Group 7: Utilities & Helpers** (~500 LOC)
**Focus:** Small utility functions, helpers, protocols

**Modules (7):**
1. `_loop.ts` (77 LOC) - loopFirst, loopLast iterators
2. `_pick.ts` (24 LOC) - pickBool utility
3. `_ratio.ts` (94 LOC) - Ratio distribution, reduction
4. `repr.ts` (312 LOC) - Rich repr protocol
5. `protocol.ts` (19 LOC) - isRenderable check
6. `errors.ts` (98 LOC) - Exception classes
7. `themes.ts` (8 LOC) - DEFAULT theme export

**Review Focus:**
- Utilities: Correctness of algorithms (ratio math, loop logic)
- Repr: Protocol implementation, rich_repr handling
- Protocol: Type checking for renderables
- Error classes: Proper inheritance, messages
- Edge cases: empty iterables, division by zero, null handling

**Dependencies:** Minimal (mostly standalone)

**Estimated Review Time:** 1-2 hours per agent

---

## 🎯 Recommended Review Strategy

### **Option A: Parallel by Layer** (Fast - 2-3 days)
Review groups in parallel, 7 agents simultaneously:
- Agent 1: Group 1 (Colors/Styles)
- Agent 2: Group 2 (Text/Unicode)
- Agent 3: Group 3 (Rendering)
- Agent 4: Group 4 (Layout)
- Agent 5: Group 5 (Box/Rules)
- Agent 6: Group 6 (Markup/Emoji)
- Agent 7: Group 7 (Utilities)

**Pros:** Fastest completion
**Cons:** Need to coordinate 7 agents

### **Option B: Sequential by Dependency** (Thorough - 5-7 days)
Review in dependency order with 2-3 agents:
1. Groups 1, 7 (foundation - no dependencies)
2. Group 2 (uses Group 1)
3. Group 3 (uses Groups 1, 2)
4. Groups 5, 6 (uses Groups 1, 2, 3)
5. Group 4 (uses all above)

**Pros:** Thorough, catches integration issues
**Cons:** Slower, sequential bottlenecks

### **Option C: Hybrid - Critical Path First** (Balanced - 3-4 days)
Prioritize by complexity and importance:

**Wave 1 (parallel):**
- Group 3: Rendering Engine (critical path)
- Group 2: Text/Unicode (critical path)
- Group 7: Utilities (quick wins)

**Wave 2 (parallel):**
- Group 1: Colors/Styles
- Group 4: Layout Components
- Group 5: Box/Rules

**Wave 3 (parallel):**
- Group 6: Markup/Emoji

**Pros:** Balances speed with thoroughness
**Cons:** Requires coordination

---

## 📝 Code Review Checklist (Per Group)

### Correctness
- [ ] Algorithm accuracy vs Python source
- [ ] Edge case handling
- [ ] Error handling and exceptions
- [ ] Type safety (no `any` escapes)

### Performance
- [ ] No obvious bottlenecks
- [ ] Efficient algorithms (binary search, caching)
- [ ] Unnecessary allocations
- [ ] Generator vs array usage

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Clear variable names
- [ ] JSDoc on public APIs
- [ ] Consistent style (Prettier)
- [ ] No dead code

### Testing
- [ ] Tests cover main paths
- [ ] Edge cases tested
- [ ] Error conditions tested
- [ ] Match Python test coverage

### Integration
- [ ] Proper imports/exports
- [ ] Protocol adherence (__richConsole__, __richMeasure__)
- [ ] Type compatibility
- [ ] No circular dependencies

---

## 🎨 Review Output Format

Each agent should produce:

```markdown
# Code Review: [Group Name]

## Summary
- Modules reviewed: [list]
- Total LOC: [number]
- Issues found: [count] (Critical: X, High: Y, Medium: Z, Low: W)
- Overall grade: [A-F]

## Issues Found

### Critical Issues (Must Fix)
[List with file, line, description, recommendation]

### High Priority Issues (Should Fix)
[List with file, line, description, recommendation]

### Medium/Low Priority Issues (Nice to Have)
[List with file, line, description, recommendation]

## Positive Findings
[List excellent patterns, clever solutions, good practices]

## Recommendations
[Overall suggestions for improvement]

## Module-by-Module Details
[Detailed review of each module]
```

---

## 🚀 My Recommendation

**Go with Option C (Hybrid)** - Get critical path reviewed first, then comprehensive coverage.

**Reasoning:**
- Console, Text, Segment are most complex (need thorough review)
- Utilities are simple (quick validation)
- Layout components can be reviewed together (shared patterns)
- Emoji is mostly data (quick validation)

**Next Step:** Choose your strategy, I'll create detailed review prompts for each group!

