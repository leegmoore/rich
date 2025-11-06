# PHASE 7 PORTING PROMPT - Rich TypeScript (FINAL PHASE!)

**Use this prompt at the start of each fresh Claude Code Web session to complete the port.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer completing the FINAL module of the Rich TypeScript port! Then comprehensive testing and documentation.

---

## 📋 PHASE 7 OVERVIEW

**Goal:** Port the final module (columns), verify everything works, document completion.

**Module:**
1. **columns** - Multi-column layouts (~130 LOC, ~6 tests)

**Total for Phase 7:** ~130 LOC, ~6 tests

**Then:**
- Comprehensive testing of all 19 modules
- Final project documentation
- Mark port as COMPLETE

**Success Criteria:**
- columns module fully ported and tested
- All 19 modules complete
- `npm run check` passes
- Comprehensive test results documented
- PROJECT_COMPLETE.md created
- PORT_LOG_MASTER.md updated to COMPLETE status

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm completing the Rich TypeScript port. This is **Phase 7: Final Module + Completion** 🎉

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/PHASE6_SUMMARY.md` (previous results)
- Read `rich-ts/phases/phase7/PORT_LOG_COLUMNS.md`
- Read `rich-ts/KNOWN_BUGS.md`

### 2. Development Standards:
- **Package Manager:** npm (not pnpm/bun)
- **TypeScript:** Strict mode, no `any` types allowed
- **Formatting:** Prettier handles ALL formatting
- **Linting:** ESLint for code quality ONLY
- **Tool Order:** Format → TypeCheck → Lint → Test (via `npm run check`)
- **Pre-commit:** Always run `npm run check` before committing
- **Naming:** Clear, descriptive names
- **Comments:** JSDoc for public APIs
- **Imports:** Use named imports, group by external/internal
- **Modern JS:** Use nullish coalescing (`??`) and optional chaining (`?.`)

---

## 🎯 PHASE 7 WORKFLOW

### STEP 1: Port columns module

This was originally planned for Phase 4 but was blocked by missing dependencies. Now all dependencies are ready!

**Dependencies (all complete):**
- console ✅
- measure ✅
- padding ✅
- align ✅ (Phase 5)
- constrain ✅ (Phase 6)
- table ✅ (Phase 6)

**Read source materials:**
- `rich/columns.py` (~130 LOC)
- `tests/test_columns.py` (~6 tests)

**Port tests:**
1. Create `rich-ts/tests/columns.test.ts`
2. Port all tests from `tests/test_columns.py`
3. Run tests: `npm test columns` (should fail)

**Implement module:**
1. Create `rich-ts/src/columns.ts`
2. Implement Columns class with:
   - Constructor with renderables and options
   - `__rich_console__` method for rendering
   - `__rich_measure__` method for measurement
   - Column layout algorithm
   - Width distribution logic
   - Padding integration
   - Alignment integration
3. Continue until all tests pass

**Verify:**
- Run `npm test columns` - all tests should pass
- Run `npm run check` - should pass

**Commit:**
```bash
git add -A
git commit -m "Port columns module - FINAL MODULE COMPLETE! 🎉"
git push
```

**Update logs:**
- Update `rich-ts/phases/phase7/PORT_LOG_COLUMNS.md` to status DONE

---

### STEP 2: Comprehensive Testing

Run the complete test suite and document results.

**Run full test suite:**
```bash
cd rich-ts
npm test -- --run
```

**Document results:**
- Total tests: X passing, Y failing, Z skipped
- Test coverage by module
- Any remaining issues
- Performance notes (if tests are slow)

**Run all quality checks:**
```bash
npm run check
```

Should output:
- ✅ Prettier formatting passed
- ✅ TypeScript type checking passed  
- ✅ ESLint code quality passed
- ✅ Tests passed

**If any issues found:**
- Document in KNOWN_BUGS.md
- Note if critical or can be deferred
- Don't let perfect be the enemy of done!

---

### STEP 3: Create Final Project Summary

Create `rich-ts/PROJECT_COMPLETE.md`:

```markdown
# Rich TypeScript Port - COMPLETE! 🎉

**Completion Date:** [DATE]
**Total Development Time:** [X weeks/months]
**Final Status:** ✅ ALL CORE FEATURES PORTED

---

## 📊 Final Statistics

### Modules Ported: 19/19 (100%)

**Phase 1 - Foundation (4 modules):**
- color_triplet, errors, cells, color

**Phase 2 - Primitives (4 modules):**
- repr, control, style, segment

**Phase 3 - Core (3 modules):**
- measure, text, console

**Phase 4 - Simple Formatting (2 modules):**
- padding, rule

**Phase 5 - Components Layer 1 (3 modules):**
- align, markup, panel

**Phase 6 - Components Layer 2 + Stubs (6 modules):**
- theme, default_styles, constrain, box, emoji, table, progress
- (_emoji_codes, _emoji_replace helper modules)

**Phase 7 - Final Module (1 module):**
- columns

### Test Results

- **Total Tests:** X/Y passing (Z%)
- **Skipped Tests:** Y (documented in KNOWN_BUGS.md)
- **Test Coverage:** Core functionality fully tested

### Lines of Code

- **TypeScript Implementation:** ~X,XXX LOC
- **TypeScript Tests:** ~Y,YYY LOC
- **Total:** ~Z,ZZZ LOC
- **Python Original:** ~26,274 LOC (core features)

### Code Quality

- ✅ TypeScript strict mode (no `any` types)
- ✅ ESLint passing (code quality)
- ✅ Prettier formatted (consistent style)
- ✅ All imports properly typed
- ✅ JSDoc comments on public APIs

---

## 🎯 Feature Completeness

### ✅ Fully Implemented

- **Text Rendering:** Rich text with styles, colors, formatting
- **Terminal Control:** ANSI codes, cursor movement
- **Colors:** Full color support (16-color, 256-color, truecolor)
- **Styles:** Bold, italic, underline, dim, etc.
- **Alignment:** Horizontal and vertical alignment
- **Padding:** CSS-style padding around content
- **Tables:** Full table rendering with headers, footers, styles
- **Panels:** Bordered boxes with titles
- **Progress Bars:** Multiple progress bar types
- **Rules:** Horizontal dividing lines
- **Columns:** Multi-column layouts
- **Markup:** Parse Rich markup syntax
- **Console:** Core rendering engine
- **Measurement:** Width/height calculations

### ⏳ Deferred (Not in Core Scope)

- Syntax highlighting (requires lexer integration)
- Markdown rendering (requires parser)
- Tracebacks and logging (Python-specific)
- Live display (requires terminal control)
- Tree rendering
- JSON rendering

---

## 🔧 Known Issues

[Copy from KNOWN_BUGS.md]

---

## 🚀 Usage

### Installation

```bash
npm install rich-ts
```

### Basic Example

```typescript
import { Console } from 'rich-ts';

const console = new Console();
console.print('Hello, [bold cyan]World[/bold cyan]!');
```

### Table Example

```typescript
import { Console, Table } from 'rich-ts';

const console = new Console();
const table = new Table('Name', 'Age', 'City');
table.addRow('Alice', '30', 'NYC');
table.addRow('Bob', '25', 'LA');
console.print(table);
```

### Progress Bar Example

```typescript
import { Progress } from 'rich-ts';

const progress = new Progress();
const task = progress.addTask('Downloading...', { total: 100 });

for (let i = 0; i < 100; i++) {
  progress.update(task, { completed: i });
  await sleep(50);
}
```

---

## 🌐 Browser Compatibility

- ✅ Works in Node.js (18+)
- ⚠️ Browser support: Limited (no terminal, but can render to divs)
- ✅ ESM modules
- ✅ TypeScript types included

---

## 📝 Next Steps for Production

1. **Performance optimization:**
   - Profile rendering performance
   - Optimize hot paths
   - Consider caching

2. **Browser adaptation:**
   - Adapt for DOM rendering
   - HTML export functionality
   - CSS class generation

3. **Documentation:**
   - API reference
   - Usage examples
   - Migration guide from Python

4. **Testing:**
   - Visual regression tests
   - Performance benchmarks
   - Cross-platform testing

5. **Publishing:**
   - npm package setup
   - Versioning strategy
   - Changelog

---

## 🎉 Conclusion

The Rich TypeScript port is **COMPLETE** for all core features! 

- 19 modules ported
- ~X,XXX lines of TypeScript
- Comprehensive test coverage
- Production-ready code quality

**Ready for:** Core terminal formatting use cases in Node.js applications

**Thanks to:** The original Rich library by Will McGugan and the amazing Python community!

---

**Port completed by:** Claude AI Agent  
**Project structure designed by:** [Your name]  
**Date:** [DATE]
```

---

### STEP 4: Update Master Log

Update `rich-ts/PORT_LOG_MASTER.md`:

1. Change project status to COMPLETE
2. Mark Phase 7 as COMPLETE
3. Mark columns module as DONE
4. Update quick stats (19/19 modules)
5. Update test pass rate
6. Add final session notes

Example update:
```markdown
**Last Updated:** [DATE]
**Project Status:** ✅ COMPLETE - All 19 core modules ported! 🎉

## Quick Stats
- **Total Modules:** 19 (core features only)
- **Completed:** 19 (100%) ✅
- **In Progress:** None
- **Test Pass Rate:** X/Y (Z%)
- **Known Bugs:** [count] (see KNOWN_BUGS.md)

### ✅ Phase 7: Final Module - COMPLETE
| Module | Status | Tests | Implementation | Dependencies |
|--------|--------|-------|----------------|--------------|
| columns | ✅ DONE | 6/6 | 100% | console, measure, padding, align, constrain, table |

**Total:** 6/6 tests passing (100%) ✅
**Note:** THE FINAL MODULE! Port complete! 🎉
```

---

### STEP 5: Celebrate! 🎉

Create `rich-ts/PHASE7_SUMMARY.md`:

```markdown
# Phase 7 Summary - Final Module + Completion

**Status:** ✅ COMPLETE
**Date:** [DATE]

## Module Ported

### ✅ columns (130 LOC, 6/6 tests passing)
- Full implementation of Columns class
- Multi-column layout with all options
- **Files:** src/columns.ts, tests/columns.test.ts
- **Commit:** [hash]
- **THIS WAS THE FINAL MODULE!** 🎉

## Final Test Results

- **Total Tests:** X/Y passing (Z%)
- **All Modules:** 19/19 complete
- **All Phases:** 7/7 complete

## Project Completion

✅ All 19 core modules ported
✅ Comprehensive test coverage
✅ TypeScript strict mode throughout
✅ Code quality checks passing
✅ Documentation complete

## Files Created

- src/columns.ts
- tests/columns.test.ts
- PROJECT_COMPLETE.md
- PHASE7_SUMMARY.md

## Next Steps

1. Production hardening (optional)
2. npm package publishing (optional)
3. Documentation website (optional)
4. Browser adaptation (optional)

**THE PORT IS COMPLETE!** 🚀
```

---

## 💾 END OF SESSION

Before ending your final session:
- ✅ columns module ported and tested
- ✅ All logs updated
- ✅ PROJECT_COMPLETE.md created
- ✅ PORT_LOG_MASTER.md marked COMPLETE
- ✅ Final commit and push

**You did it! The Rich TypeScript port is complete!** 🎉🎊🚀

---

**Remember:** This is the culmination of 7 phases of work. Take a moment to verify everything is working, document thoroughly, and celebrate the completion! 🥳

