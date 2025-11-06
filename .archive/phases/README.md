# Phase Organization

This directory contains phase-specific logs, prompts, and status files.

## Structure

```
phases/
├── phase1/         # Foundation Layer (color, cells, errors)
│   ├── STATUS.md
│   ├── PROMPT_PHASE1.md
│   ├── QUICK_START_PROMPT.txt
│   └── PORT_LOG_*.md
├── phase2/         # Primitives (style, segment, repr, control)
│   ├── PROMPT_PHASE2.md
│   ├── QUICK_START_PHASE2.txt
│   └── PORT_LOG_*.md
├── phase3/         # Core (text, console, measure)
│   └── ...
└── phase4/         # Components (table, panel, progress...)
    └── ...
```

## Usage

1. Check `phaseN/STATUS.md` for phase status
2. Use `phaseN/QUICK_START_*.txt` for session prompts
3. Read `phaseN/PROMPT_*.md` for full instructions
4. Update `phaseN/PORT_LOG_*.md` during work

## Current Status

- **Phase 1:** IN PROGRESS (on branch, 97% complete)
- **Phase 2:** NOT STARTED
- **Phase 3:** NOT STARTED
- **Phase 4:** NOT STARTED

