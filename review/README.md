# Rich TypeScript Code Review - Execution Guide

**Status:** Ready for parallel agent execution  
**Total Groups:** 7 review groups across 3 waves  
**Total Modules:** 32 TypeScript modules (~13,748 LOC)

---

## 🚀 Quick Start - Two-Pass Review Strategy

**Each agent does TWO passes on their assigned modules:**
- **Pass 1:** Foundation Quality (Correctness, Code Quality, Types, API)
- **Pass 2:** Production Hardening (Performance, Edge Cases, Reliability)

**Context stays open between passes!**

---

## 📋 Execution Flow

### Step 1: Review General Materials (You - 5 minutes)
Read these files in `review/` root:
- `PROJECT_OVERVIEW.md` - Context about the port
- `REVIEW_CHECKLIST.md` - What agents should check

### Step 2: Launch Wave 1 - PASS 1 (3 agents in parallel)
These groups have minimal dependencies - can run simultaneously:

| Agent | Group | Modules | Pass 1 Prompt |
|-------|-------|---------|---------------|
| **Agent A** | Text & Unicode | 4 modules (~2,300 LOC) | `wave1/group2_text_unicode_PROMPT.md` |
| **Agent B** | Rendering Engine | 3 modules (~1,600 LOC) | `wave1/group3_rendering_PROMPT.md` |
| **Agent C** | Utilities | 7 modules (~500 LOC) | `wave1/group7_utilities_PROMPT.md` |

**Focus:** Correctness, Code Quality, TypeScript Quality, API Usability  
**Time:** 2-4 hours per agent  
**Output:** Each agent writes to their `*_OUTPUT.md` file

### Step 3: Launch Wave 1 - PASS 2 (same 3 agents)
**Keep context open! After Pass 1 completes, give Pass 2 prompt to same agent**

| Agent | Pass 2 Prompt |
|-------|---------------|
| **Agent A** | `wave1/group2_text_unicode_PASS2.md` |
| **Agent B** | `wave1/group3_rendering_PASS2.md` |
| **Agent C** | `wave1/group7_utilities_PASS2.md` |

**Focus:** Performance, Hardening, Edge Cases, Reliability  
**Time:** 2-3 hours per agent  
**Output:** APPEND to same `*_OUTPUT.md` file

### Step 4: Wait for Wave 1 Both Passes Complete
All 3 agents must finish BOTH passes before Wave 2

### Step 5: Launch Wave 2 - PASS 1 (3 agents in parallel)
After Wave 1 complete (both passes):

| Agent | Group | Modules | Pass 1 Prompt |
|-------|-------|---------|---------------|
| **Agent D** | Colors & Styles | 5 modules (~2,000 LOC) | `wave2/group1_colors_PROMPT.md` |
| **Agent E** | Layout Components | 6 modules (~1,150 LOC) | `wave2/group4_layouts_PROMPT.md` |
| **Agent F** | Box & Visual | 3 modules (~650 LOC) | `wave2/group5_boxes_PROMPT.md` |

### Step 6: Launch Wave 2 - PASS 2 (same 3 agents)
| Agent | Pass 2 Prompt |
|-------|---------------|
| **Agent D** | `wave2/group1_colors_PASS2.md` |
| **Agent E** | `wave2/group4_layouts_PASS2.md` |
| **Agent F** | `wave2/group5_boxes_PASS2.md` |

### Step 7: Launch Wave 3 - PASS 1 & PASS 2 (1 agent)
After Wave 2 complete:

| Agent | Pass 1 Prompt | Pass 2 Prompt |
|-------|---------------|---------------|
| **Agent G** | `wave3/group6_markup_PROMPT.md` | `wave3/group6_markup_PASS2.md` |

### Step 8: Consolidate Results
After all waves complete:
1. Review all 7 `*_OUTPUT.md` files
2. Prioritize issues (Critical → High → Medium → Low)
3. Create action plan for fixes

---

## 📊 Wave Breakdown

### **Wave 1: Critical Path + Quick Wins** (Parallel - 3 agents)
**Run these simultaneously - no interdependencies**

- **Group 2:** Text & Unicode (~2,300 LOC, 3-4 hours)
  - Critical path for rendering
  - Complex Unicode algorithms
  
- **Group 3:** Rendering Engine (~1,600 LOC, 3-4 hours)
  - Most critical module (console)
  - Core rendering pipeline
  
- **Group 7:** Utilities (~500 LOC, 1-2 hours)
  - Quick validation
  - Foundation helpers

**Expected Duration:** 4-5 hours (longest agent)

---

### **Wave 2: Dependent Systems** (Parallel - 3 agents)
**Wait for Wave 1, then run these simultaneously**

- **Group 1:** Colors & Styles (~2,000 LOC, 2-3 hours)
  - Color algorithms need validation
  - Theme system review
  
- **Group 4:** Layout Components (~1,150 LOC, 3-4 hours)
  - Table is most complex
  - Uses rendering engine (Wave 1)
  
- **Group 5:** Box & Visual (~650 LOC, 2 hours)
  - Box drawing validation
  - Terminal control codes

**Expected Duration:** 4 hours (longest agent)

---

### **Wave 3: Final Group** (Single agent)
**Wait for Wave 2, then run**

- **Group 6:** Markup & Emoji (~4,000 LOC, 1-2 hours)
  - Mostly data validation (3,600 LOC emoji)
  - Markup parser review
  - Uses text/style from earlier waves

**Expected Duration:** 2 hours

---

## ⏱️ Total Timeline

**Sequential worst case:** 15-20 hours  
**With parallel execution:** 10-11 hours across ~2-3 days  

**Actual calendar time:**
- Day 1: Wave 1 (4-5 hours)
- Day 2: Wave 2 (4 hours)
- Day 3: Wave 3 (2 hours)
- **Total: 3 days with parallel execution**

---

## 🎯 Key Benefits of This Structure

1. **Parallelizable:** Up to 3 agents per wave
2. **Dependency-aware:** Later waves can reference earlier reviews
3. **Balanced:** No agent gets overwhelmed
4. **Structured:** Clear inputs/outputs per agent
5. **Trackable:** Easy to see progress

---

## 📝 Output File Format

Each `*_OUTPUT.md` file will contain:
- Summary of issues found
- Severity breakdown (Critical/High/Medium/Low)
- Detailed issue descriptions
- Code recommendations
- Overall quality grade

Consolidate all outputs at the end for prioritized action plan.

---

## 🔥 LET'S GO!

1. Read `PROJECT_OVERVIEW.md` and `REVIEW_CHECKLIST.md`
2. Start Wave 1 (3 parallel agents)
3. Wait for completion
4. Start Wave 2 (3 parallel agents)
5. Wait for completion
6. Start Wave 3 (1 agent)
7. Consolidate and prioritize findings

**Ready to launch comprehensive code review!** 🚀

