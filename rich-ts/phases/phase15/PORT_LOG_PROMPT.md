# Module Port Log: prompt

**Status:** NOT_STARTED  
**Dependencies:** console ✅, text ✅  
**Python Source:** `rich/prompt.py` (~400 LOC)  
**Python Tests:** `tests/test_prompt.py` (~20 tests)

---

## Module Overview
Interactive prompt system with validation.

**Purpose:** Prompt classes for interactive user input with type validation, default values, and styling. Terminal UI for getting user input.

**Key Features:**
- Prompt base class
- Confirm prompt (yes/no)
- IntPrompt (integer input with validation)
- FloatPrompt (float input with validation)
- Prompt with choices (multiple choice)
- Default values
- Input validation
- Error messages with retry
- Password mode (masked input)
- Uses Console for styled prompts

---

## Test Port Progress

**Total Tests:** ~20

- [ ] test_prompt_create
- [ ] test_prompt_ask
- [ ] test_prompt_default
- [ ] test_confirm_prompt
- [ ] test_int_prompt
- [ ] test_float_prompt
- [ ] test_choice_prompt
- [ ] test_prompt_validation
- [ ] test_prompt_error_handling
- [ ] test_prompt_password
- [ ] test_prompt_styles
- [ ] Other prompt tests

---

## Implementation Progress

- [ ] PromptBase abstract class
- [ ] Prompt class (string prompts)
- [ ] Confirm class (yes/no)
- [ ] IntPrompt class (integer input)
- [ ] FloatPrompt class (float input)
- [ ] ask() method with validation
- [ ] Input reading (Node.js readline or equivalent)
- [ ] Default value handling
- [ ] Validation and retry logic
- [ ] Error message display
- [ ] Password masking
- [ ] Choice validation
- [ ] All tests passing

---

## Design Decisions

*No decisions yet - module not started*

**Key Design:**
- Node.js readline for input
- Validation loop with retry
- Type coercion (string → int/float/bool)
- Error display with Console
- Password mode using readline secret option

**Considerations:**
- Use Node.js `readline` module? (built-in)
- Or use npm package like `prompts` or `inquirer`?
- How to handle Ctrl+C interruption?
- Test approach for input (can't easily test interactive input)

---

## Blockers

**NONE** - All dependencies complete

Can be done in PARALLEL with all other Phase 15 modules

---

## Next Steps

1. **VERIFY** Phase 14 complete
2. Read Python source: `rich/prompt.py` (400 LOC)
3. Read Python tests: `tests/test_prompt.py`
4. Create `rich-ts/tests/prompt.test.ts`
5. Port tests to TypeScript/Vitest (may need to mock input)
6. Run tests: `npm test prompt -- --run` (should fail)
7. Create `rich-ts/src/prompt.ts`
8. Implement PromptBase and subclasses
9. Integrate Node.js readline
10. Implement validation logic
11. Implement retry loop
12. Implement type-specific prompts
13. Continue until tests pass
14. Run `npm run check`
15. Commit and push
16. Update this log to DONE

---

## Session Notes

*No sessions yet*

---

## Notes

**COMPLEXITY:** Medium (input handling, validation, Node.js readline)

**TIME:** 1.5 hours

**TESTING CHALLENGE:** Interactive input is hard to test - may need mocking

**NODE.JS INTEGRATION:** Uses Node.js built-in readline module

