# Testing Agent Design

## Overview

A Claude Code skill (`/test-game`) that tests Wasp the Game features using the Chrome extension. The main agent invokes it with complete test instructions, and the testing agent executes them and returns a structured pass/fail report with evidence.

## Invocation

```
/test-game <test instructions from main agent>
```

Example:
```
/test-game Verify the wasp moves right when pressing the right arrow key.
Check that velocity.x > 0 after holding ArrowRight for 1 second.
```

## Architecture

```
┌─────────────────┐     test instructions      ┌─────────────────┐
│   Main Agent    │ ─────────────────────────► │  Testing Agent  │
│                 │                            │  (/test-game)   │
│ - Reads specs   │     structured report      │                 │
│ - Decides tests │ ◄───────────────────────── │ - Executes      │
│ - Formats input │                            │ - Observes      │
└─────────────────┘                            │ - Reports       │
                                               └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │ Chrome Browser  │
                                               │ localhost:8080  │
                                               └─────────────────┘
```

## Capabilities

The testing agent can:

1. **Visual verification** - Take screenshots, detect elements on screen
2. **Keyboard input** - Send arrow keys, space, etc.
3. **Mouse clicks** - Click at coordinates or elements
4. **JavaScript inspection** - Execute JS to read game state (e.g., `scene.wasp.x`)

## Assumptions

- Game server already running at `localhost:8080`
- Chrome extension available and configured
- Main agent provides complete test instructions

## Test Execution Flow

1. **Parse test instruction** - Understand what needs to be tested
2. **Get browser context** - Call `tabs_context_mcp` to check available tabs
3. **Navigate to game** - Create new tab and go to `localhost:8080`
4. **Wait for game load** - Verify Phaser has initialized
5. **Execute test actions** - Perform keyboard/mouse/JS interactions
6. **Capture evidence** - Take screenshots at key moments
7. **Verify expected outcome** - Check visual state or JS game state
8. **Generate report** - Return structured pass/fail result

## Timeout Handling

- Max 30 seconds per test
- If test cannot complete, return FAIL with timeout explanation

## Report Format

```markdown
## Test Report: [Test Name]

**Status:** PASS / FAIL

**Tests Run:** N
**Passed:** X
**Failed:** Y

### Results

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| 1 | Description | PASS/FAIL | Details |

### Failure Details (if any)

**Test N - Name**
- Expected: [what should happen]
- Actual: [what happened]
- Screenshot: [attached]
- Suggestion: [if applicable]

### Screenshots
- [screenshot descriptions and IDs]
```

## Responsibilities

### Main Agent
- Reads spec files from `Spec/implementation-plan/`
- Decides which tests to run and when
- Formats complete test instructions
- Interprets test results and takes action

### Testing Agent
- Executes exactly what it's told
- Does NOT read spec files
- Does NOT start game server
- Does NOT decide what to test
- Returns structured report with evidence

## Integration with Existing Specs

The implementation plan files contain "Claude Browser Test Instructions" sections with:
- Step-by-step test procedures
- JavaScript verification commands
- Acceptance criteria tables (ID, criterion, pass/fail conditions)

The main agent extracts these and formats them as instructions for the testing agent.

## Error Handling

On failure, the testing agent:
1. Captures a screenshot showing the failure state
2. Includes text description of what went wrong
3. Reports expected vs actual values
4. Suggests potential causes when obvious
