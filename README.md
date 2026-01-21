# Wasp the Game

An endless survival exploration game built with Phaser 3. Control a wasp navigating a procedurally generated hornets nest, collecting worms to feed a hungry queen while avoiding enemy hornets.

![Title Screen](wasp-the-game.png)

**Repository:** https://github.com/oliban/wasp-the-game

## Play Now

```bash
# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Gameplay

- **Arrow keys** - Move the wasp
- **Collect worms** - Find and pick up worms scattered in the nest
- **Feed the queen** - Return to the queen's chamber to deliver worms
- **Avoid hornets** - Enemy hornets patrol the nest and chase you
- **Survive** - Keep the queen fed as difficulty increases over time

## Features

- Procedurally generated nest with rooms and corridors
- Momentum-based wasp movement with worm-carrying slowdown
- Hornet AI with patrol/chase/return states
- Progressive difficulty system (hunger drain increases over time)
- Time-based scoring with high score persistence
- Pixel art sprites with animations
- Particle effects and screen shake
- Title screen with illustrated artwork

## Tech Stack

- **Phaser 3** - Game framework (CDN)
- **Vanilla JavaScript** - ES6 modules
- **HTML5 Canvas** - Rendering
- **Arcade Physics** - Collision and movement

No build tools required - just serve and play.

## Project Structure

```
wasp-the-game/
├── index.html                    # Entry point
├── js/
│   ├── game.js                   # Phaser config
│   ├── config.js                 # Game constants
│   ├── scenes/                   # TitleScene, PlayScene, GameOverScene
│   ├── entities/                 # Wasp, Queen, Worm, Hornet
│   └── systems/                  # NestGenerator, DifficultyManager
├── assets/sprites/               # Pixel art sprite sheets
├── .claude/skills/               # Project-specific Claude skills
├── Spec/implementation-plan/     # Phase documentation
└── docs/                         # Design documents
```

## Implementation Phases

All phases complete!

| Phase | Name | Status |
|-------|------|--------|
| 1 | Project Setup | ✅ |
| 2 | Wasp Movement | ✅ |
| 3 | Nest Generation | ✅ |
| 4 | Queen & Worms | ✅ |
| 5 | Hornets | ✅ |
| 6 | Difficulty & Scoring | ✅ |
| 7 | Pixel Art | ✅ |
| 8 | Polish | ✅ |

See `Spec/implementation-plan/` for detailed phase documentation.

---

## Testing Agent

This project uses an automated testing agent (`/test-game`) that tests game features via Chrome browser automation.

### Architecture

```
┌─────────────────┐                           ┌─────────────────┐
│   Main Agent    │  -- test instructions --> │  Testing Agent  │
│                 │                           │  (/test-game)   │
│ - Reads specs   │  <-- structured report -- │                 │
│ - Decides tests │                           │ - Executes      │
│ - Formats input │                           │ - Observes      │
└─────────────────┘                           │ - Reports       │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Chrome Browser  │
                                              │ localhost:8080  │
                                              └─────────────────┘
```

### How It Works

1. **Main agent** reads test specs from `Spec/implementation-plan/` files
2. **Main agent** formats complete test instructions
3. **Testing agent** receives instructions and executes via Chrome extension:
   - Navigates to `localhost:8080`
   - Performs keyboard/mouse input
   - Inspects game state via JavaScript
   - Captures screenshots
4. **Testing agent** returns structured pass/fail report

### Testing Agent Capabilities

- **Visual verification** - Screenshots, element detection
- **Keyboard input** - Arrow keys, space, etc.
- **Mouse clicks** - Coordinates or element-based
- **JS inspection** - Direct game state access (`scene.wasp.x`, `scene.queen.hunger`)

### Report Format

```markdown
## Test Report: [Test Name]

**Status:** PASS / FAIL

| # | Test | Status | Evidence |
|---|------|--------|----------|
| 1 | Wasp moves right | PASS | velocity.x = 156 |
| 2 | Max velocity cap | FAIL | velocity = 247, expected <= 200 |

### Failure Details
- Expected: velocity <= 200
- Actual: velocity = 247
- Screenshot: [attached]
```

### Prerequisites

- Game server running (`python3 -m http.server 8080`)
- Chrome with Claude extension installed
- Main agent provides complete test instructions

### Key Principle

The testing agent is a **dumb executor**. It does NOT:
- Read spec files (main agent does this)
- Decide what to test
- Start the game server

It only executes what it's told and reports results.

### Test Specs Location

Each phase in `Spec/implementation-plan/` contains:
- **Claude Browser Test Instructions** - Step-by-step procedures
- **Acceptance Criteria** - Pass/fail conditions table
- **Verification Commands** - JavaScript snippets for state checks

---

## Coordinator Agent

This project was built using multi-agent parallel development with the `/coordinate` skill.

### How It Works

1. **Read plan files** - Parses phase specs and dependency graph
2. **Create git worktrees** - Isolated branches for parallel work
3. **Spawn coding agents** - Background agents implement each phase
4. **Code review** - Reviewer agents verify implementation
5. **Test** - Testing agents verify acceptance criteria
6. **Merge** - All branches merged to main

### Usage

```bash
/coordinate Spec/implementation-plan
```

The coordinator handles the entire workflow: coding → review → test → fix → merge.

See `.claude/skills/coordinate/SKILL.md` for full documentation.
