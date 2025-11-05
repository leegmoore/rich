# Rich TypeScript

A TypeScript port of the [Rich](https://github.com/Textualize/rich) Python library for beautiful terminal formatting.

## Status: 🚧 In Development (Phase 1)

This is an active port-in-progress. See `PORT_LOG_MASTER.md` for current status.

## About

Rich is a Python library for rendering rich text, tables, progress bars, syntax highlighting, markdown and more to the terminal. This TypeScript port aims to bring core Rich functionality to JavaScript/TypeScript environments (both Node.js and browser).

## Porting Strategy

This port uses a **test-driven, module-by-module approach**:

1. **Port tests first** - Convert Python tests to TypeScript/Vitest
2. **Implement to pass tests** - Build modules incrementally
3. **Track progress** - Log files track each module's status
4. **Parallel work** - Independent modules can be ported simultaneously

See `PROMPT_PHASE1.md` for detailed porting instructions.

## Project Structure

```
rich-ts/
├── src/              # TypeScript source files
├── tests/            # Vitest test files
├── PORT_LOG_*.md     # Module-specific progress logs
├── PROMPT_PHASE1.md  # Reusable session prompt
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with UI
npm test:ui

# Type check
npm run typecheck

# Build
npm run build
```

## Phases

- **Phase 0:** ✅ Project setup
- **Phase 1:** 🚧 Foundation layer (color, cells, errors)
- **Phase 2:** ⏳ Primitives (style, segment, repr)
- **Phase 3:** ⏳ Core (text, console)
- **Phase 4:** ⏳ Components (table, panel, progress)

## Contributing

This is a structured port following the original Rich library's architecture. See the port logs for module status and contribution opportunities.

## License

MIT (same as original Rich library)

## Credits

Original Rich library by [Will McGugan](https://github.com/willmcgugan) and contributors.

