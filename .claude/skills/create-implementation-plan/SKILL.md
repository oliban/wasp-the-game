---
name: create-implementation-plan
description: Use when creating implementation plans for multi-phase projects. Ensures plans have proper base plate (sequential) vs parallel phase structure for the coordinator.
---

# Implementation Plan Creator

Creates structured implementation plans with explicit phase dependencies for the coordinator agent.

## CRITICAL: Base Plate Structure

Every implementation plan MUST include:

1. **Base Plate Phases** - Foundational phases that must complete sequentially
2. **Parallel Phases** - Phases that can run simultaneously after base plate

## Plan Template

When creating an implementation plan, use this structure:

### Required Sections

#### 1. Phase Dependencies (MANDATORY)

```markdown
## Phase Dependencies

### Base Plate Phases (Sequential)

These phases MUST be completed in order. Each phase must be fully merged before the next begins.

| Order | Phase | Description | Why Sequential |
|-------|-------|-------------|----------------|
| 1 | Phase N | ... | Foundation - establishes core architecture |
| 2 | Phase M | ... | Builds directly on Phase N's code |

### Parallel Phases

These phases can run simultaneously AFTER all base plate phases are merged to main.

| Phase | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Phase A | Base plate complete | B, C, D |
| Phase B | Base plate complete | A, C, D |
```

#### 2. Individual Phase Specs

Each phase needs its own detailed spec file with:
- Implementation details
- Acceptance criteria
- Test instructions
- **Validation sections** (see below)

## CRITICAL: Every Task Must Be Validatable

**No task is complete without verification.** Every phase spec MUST include:

### Required Validation Sections

#### 1. Automated Test Specs (TDD)
```markdown
## Automated Test Specs

### Unit Tests
- Test file location: `tests/[feature].test.js`
- What to test: [list specific behaviors]
- Mock requirements: [what needs mocking]

### Integration Tests
- Test interactions between components
- Verify data flows correctly
```

#### 2. Browser Test Instructions (Chrome Extension)
```markdown
## Chrome Browser Test Instructions

### Prerequisites
- Game server running at `localhost:8080`
- Chrome with Claude extension installed

### Test Procedure
1. Navigate to game URL
2. [Specific actions to perform]
3. [JavaScript inspection commands]
4. [Screenshots to capture]

### JavaScript Verification Commands
```javascript
// Commands that return true/false for pass/fail
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
scene.someProperty === expectedValue
```
```

#### 3. Acceptance Criteria Table (MANDATORY)
```markdown
## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| X.1 | [Feature] | [What must be true] | [What indicates failure] |
| X.2 | [Feature] | [What must be true] | [What indicates failure] |
```

### Verification Command Block
Every acceptance criterion should have a corresponding JavaScript verification command:
```javascript
// Criterion X.1 - [name]
someCheck === expectedValue

// Criterion X.2 - [name]
anotherCheck === expectedValue
```

## Validation Checklist (Extended)

Before finalizing a plan, verify each phase has:

- [ ] Automated test specs with specific test cases
- [ ] Browser test instructions with step-by-step procedure
- [ ] JavaScript verification commands that return boolean pass/fail
- [ ] Acceptance criteria table with ID, criterion, pass/fail conditions
- [ ] No vague criteria like "works correctly" - all must be measurable

## Identifying Base Plate vs Parallel

### A phase is BASE PLATE if:
- It establishes core architecture (data models, base classes, config)
- Multiple other phases import/extend its code
- It must exist before other phases can compile/run
- Failure here breaks everything downstream

### A phase is PARALLEL if:
- It only depends on base plate (not other parallel phases)
- It adds independent features/functionality
- It can be developed without knowing details of other parallel phases
- Merge order doesn't matter (no cross-dependencies)

## Workflow

1. Analyze the project requirements
2. Identify foundational work → these become base plate
3. Identify independent features → these become parallel phases
4. Structure base plate phases in dependency order
5. Group parallel phases that can run together
6. Write dependency table explicitly
7. Create individual phase spec files

## Final Validation Checklist

Before finalizing a plan, verify:

**Structure:**
- [ ] Dependencies section exists with both base plate and parallel tables
- [ ] Base plate phases have clear "Why Sequential" reasoning
- [ ] Parallel phases explicitly list what they can parallel with
- [ ] No circular dependencies exist
- [ ] Each phase has a detailed spec file

**Testing (EVERY phase):**
- [ ] Automated test specs exist with specific test cases
- [ ] Browser test instructions with step-by-step procedure
- [ ] JavaScript verification commands (boolean pass/fail)
- [ ] Acceptance criteria table with measurable conditions
- [ ] No vague criteria - all must be programmatically verifiable

**Coordinator-Ready:**
- [ ] A coordinator can execute this plan without asking questions
- [ ] Test agent can verify completion using provided commands

## Example

For a game with player, enemies, and UI:

**Base Plate (Sequential):**
1. Phase 1: Core game loop & physics - everything depends on this
2. Phase 2: Player entity - enemies need player to chase

**Parallel (After Base Plate):**
- Phase 3: Enemy AI - uses player, independent of UI
- Phase 4: UI system - uses game state, independent of enemies
- Phase 5: Sound system - independent of both
