# Wasp the Game

An endless survival exploration game built with Phaser 3. Control a wasp navigating a procedurally generated hornets nest, collecting worms to feed a hungry queen.

**Repository:** https://github.com/oliban/wasp-the-game

## Quick Start

```bash
# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Project Structure

```
wasp-the-game/
├── index.html                    # Entry point
├── js/
│   ├── game.js                   # Phaser config
│   ├── config.js                 # Game constants
│   ├── scenes/                   # Game scenes
│   ├── entities/                 # Wasp, Queen, Worm, Hornet
│   └── systems/                  # NestGenerator, DifficultyManager
├── assets/sprites/               # Sprite files
├── Spec/implementation-plan/     # Phase documentation
└── docs/plans/                   # Design documents
```

## Implementation Phases

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Project Setup | HTML, Phaser config, basic scene |
| 2 | Wasp Movement | Momentum physics, camera follow |
| 3 | Nest Generation | Procedural rooms, corridors, collision |
| 4 | Queen & Worms | Hunger system, worm collection, feeding |
| 5 | Hornets | Patrol/chase AI, collision |
| 6 | Difficulty & Scoring | Time-based scaling, game over |
| 7 | Pixel Art | Sprite creation |
| 8 | Polish | Sound, effects (optional) |

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
