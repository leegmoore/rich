===== CODE REVIEW PROMPT: RENDERING ENGINE =====

**Review Group:** 3 - Rendering Engine  
**Wave:** 1 (can run in parallel with Groups 2 and 7)  
**Output File:** `review/wave1/group3_rendering_OUTPUT.md`

---

## 🎯 YOUR MISSION

You are a senior TypeScript engineer reviewing the CORE rendering engine of the Rich port.

**Your Task:** Review 3 critical modules that form the rendering pipeline (~1,600 LOC)

**Focus Areas:**
- Segment operations (split, crop, pad, apply styles)
- Console rendering pipeline (string → Text → Segments → ANSI)
- Measurement protocol accuracy
- Control code handling
- Performance in hot rendering path

---

## 📋 SETUP INSTRUCTIONS

### 1. Repository Context
- **Repo root:** `/Users/leemoore/code/rich-port/rich/`
- **Python source:** `rich/` directory
- **TypeScript port:** `rich-ts/src/` directory
- **Tests:** `rich-ts/tests/` directory

### 2. Read Context Files
- Read `review/PROJECT_OVERVIEW.md`
- Read `review/REVIEW_CHECKLIST.md`

### 3. Run Tests for Your Modules
```bash
cd rich-ts
npm test segment
npm test console  
npm test measure
```

---

## 📦 MODULES TO REVIEW

### Module 1: segment.ts (756 LOC) 🔥
**Python Source:** `rich/segment.py`  
**Tests:** `tests/segment.test.ts` (29 tests, 1 skipped)  
**Purpose:** Low-level rendering units with styles and control codes

**Key Classes/Types:**
- `ControlCode` type - Control code representation
- `ControlType` enum - Control code types
- `Segment` class - Text + style + control codes

**Key Methods:**
- `line()` - Create line from segments
- `applyStyle()` - Apply style to segments
- `splitLines()` - Split segments into lines
- `splitAndCropLines()` - Split and crop to width
- `adjustLineLength()` - Pad or crop line to exact width
- `getLineLength()` - Calculate line width
- `setShape()` - Resize segment grid
- `simplify()` - Merge adjacent segments
- `stripStyles()` / `stripControlCodes()` - Remove attributes

**Review Focus:**
1. **Segment Operations:**
   - Line splitting accuracy (handle newlines correctly)
   - Style application (preserve control codes)
   - Line cropping (respect cell widths, handle double-width chars)
   - Line padding (add padding segments with style)

2. **Control Codes:**
   - Proper control code types (11 types defined)
   - Control code rendering
   - Strip vs escape operations

3. **Performance:**
   - Generator usage vs array allocation
   - Simplify efficiency
   - Line operation complexity

4. **Edge Cases:**
   - Empty segments
   - Segments with only control codes
   - Zero-width segments
   - Double-width character splits

**Critical Areas:**
- Lines 200-400: Line splitting and cropping
- Lines 450-550: adjustLineLength (padding logic)
- Lines 600-700: Style and control code operations

---

### Module 2: console.ts (620 LOC) 🔥 CRITICAL
**Python Source:** `rich/console.py`  
**Tests:** Indirectly tested via multiple test files  
**Purpose:** Main rendering engine - THE HEART OF RICH

**Key Classes:**
- `ConsoleOptions` - Rendering configuration
- `ConsoleDimensions` - Width/height tracking
- `Console` - Main console class

**Key Methods:**
- `print()` - Print renderables
- `render()` - Render to segments
- `renderLines()` - Render to line grid
- `renderStr()` - Convert string to Text
- `getStyle()` - Theme style lookup
- `beginCapture()` / `endCapture()` - Output capture
- `rule()` - Draw horizontal rule
- `measure()` - Measure renderable

**Review Focus:**
1. **Rendering Pipeline:**
   - `print()` → `_renderToString()` → ANSI output
   - Protocol dispatch (`__richConsole__`)
   - Recursive rendering (renderables that yield renderables)
   - Lines 350-450: Print and render logic

2. **Style & Theme Integration:**
   - `getStyle()` theme lookups
   - Default style application
   - ANSI code generation
   - Lines 250-300: Style resolution

3. **Capture Mode:**
   - Buffer management
   - Output interception
   - Capture correctness
   - Lines 540-560: Capture methods

4. **Options & Configuration:**
   - ConsoleOptions immutability
   - updateWidth(), update() methods
   - Default values
   - Lines 50-150: Options

**Critical Areas:**
- Lines 350-450: Core print/render pipeline
- Lines 415-480: _renderToString and segment rendering
- Lines 250-300: Style lookup and resolution
- Lines 540-560: Capture implementation

**Known Complexity:**
- This module ties everything together
- Many protocols converge here
- Performance critical
- Many options to handle

---

### Module 3: measure.ts (196 LOC)
**Python Source:** `rich/measure.py`  
**Tests:** `tests/measure.test.ts` (4 tests)  
**Purpose:** Calculate width/height requirements for renderables

**Key Classes:**
- `Measurement` - Min/max width container

**Key Methods:**
- `Measurement.get()` - Get measurement for any renderable
- `measureRenderables()` - Measure multiple items
- `clamp()` - Constrain measurement to range
- `withMaximum()` / `withMinimum()` - Adjust bounds

**Review Focus:**
1. **Protocol Detection:**
   - `__richMeasure__` detection
   - Fallback for non-measurable objects
   - Type checking logic
   - Lines 50-120: get() method

2. **Measurement Accuracy:**
   - Min/max calculation
   - Width calculation from segments
   - Height considerations

3. **Edge Cases:**
   - Objects without `__richMeasure__`
   - Empty renderables
   - Infinite width scenarios

**Critical Areas:**
- Lines 50-120: Measurement.get() protocol dispatch
- Lines 150-180: measureRenderables()

---

## 🎯 SPECIAL CONSIDERATIONS

### Integration Points
These modules work together closely:
- Console uses Segment for rendering
- Console uses Measurement for layout decisions
- Segment uses cell width calculations
- Text generates Segments

**Check for:**
- Proper protocol usage between modules
- Consistent assumptions (cell widths, line endings)
- No circular dependencies

### Performance Critical
This is the **hot path** for all rendering:
- Every print() call goes through Console
- Every Text renders to Segments
- Segment operations happen frequently

**Look for:**
- Unnecessary allocations
- Repeated calculations
- Missing caching opportunities

---

## 🎯 REVIEW EXECUTION

### Timeline
1. Read Python source (30 min)
2. Review segment.ts (60 min)
3. Review console.ts (90 min) 
4. Review measure.ts (30 min)
5. Document findings (60 min)

**Total: 4-5 hours**

---

## 📝 OUTPUT

Write comprehensive review to: **`review/wave1/group3_rendering_OUTPUT.md`**

Follow the format from REVIEW_CHECKLIST.md.

---

## 🚀 START REVIEW!

This is the MOST CRITICAL review group - the rendering engine must be solid! 🔍

