# Wasp the Game - Implementation Plan Overview

## Project Summary

**Wasp the Game** is an endless survival exploration game built with Phaser 3. The player controls a wasp navigating a procedurally generated hornets nest, collecting worms to feed a hungry queen.

## Design Decisions (Finalized)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Phaser 3 | Built-in physics, sprites, input handling, camera system |
| **Visual Style** | Pixel Art (16-32px) | Classic game feel, achievable scope |
| **Environment** | Procedurally Generated | Replayability, exploration focus |
| **Camera** | Follows wasp, smooth scroll | Supports exploration without overview |
| **Navigation Aid** | None (pure memory) | Core challenge is spatial awareness |
| **Movement** | Floaty/momentum-based | Feels like flying insect |
| **Worm Carrying** | Multiple at once | Risk/reward decisions |
| **Enemy Types (v1)** | Hornets only | Patrol/chase AI, drop worms on hit |
| **Game Structure** | Endless survival | High score focus |
| **Difficulty Scaling** | Hunger rate, enemy count, worm scarcity | All increase over time |

## Project Structure

```
wasp-the-game/
├── index.html                    # Entry point, loads Phaser + game
├── js/
│   ├── game.js                   # Phaser config, scene registration
│   ├── config.js                 # Game constants (speeds, rates, etc.)
│   ├── scenes/
│   │   ├── BootScene.js          # Asset loading
│   │   ├── PlayScene.js          # Main gameplay
│   │   └── GameOverScene.js      # Score display, restart
│   ├── entities/
│   │   ├── Wasp.js               # Player entity
│   │   ├── Queen.js              # Queen with hunger system
│   │   ├── Worm.js               # Collectible
│   │   └── Hornet.js             # Enemy with AI states
│   └── systems/
│       ├── NestGenerator.js      # Procedural room generation
│       └── DifficultyManager.js  # Scaling over time
├── wasp-the-game.png             # Title screen image (existing asset)
├── assets/
│   └── sprites/                  # PNG sprite files
└── Spec/
    └── implementation-plan/      # This documentation
```

## Implementation Phases

| Phase | Name | Description | Depends On |
|-------|------|-------------|------------|
| 1 | Project Setup | HTML, Phaser config, basic scene | None |
| 2 | Wasp Movement | Momentum physics, arrow keys, camera | Phase 1 |
| 3 | Nest Generation | Procedural rooms, corridors, collision | Phase 2 |
| 4 | Queen & Worms | Hunger system, worm collection, feeding | Phase 3 |
| 5 | Hornets | Patrol/chase AI, collision, worm drop | Phase 4 |
| 6 | Difficulty & Scoring | Time-based scaling, score, game over | Phase 5 |
| 7 | Pixel Art | Sprite creation and integration | Phase 6 |
| 8 | Polish | Sound, effects, title screen (optional) | Phase 7 |

## Testing Strategy

Each phase includes three types of tests:

### 1. Manual Test Steps
Step-by-step instructions for a human tester to verify functionality.

### 2. Automated Test Specs
Specifications for unit/integration tests using a testing framework (e.g., Jest).

### 3. Claude Browser Tests (Acceptance Criteria)
Instructions for the Claude testing agent using the Chrome extension. Each phase has **strict pass/fail acceptance criteria** that must all pass before proceeding to the next phase.

## Technology Specifications

### Phaser 3 Configuration
```javascript
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // Top-down, no gravity
            debug: false
        }
    },
    scene: [BootScene, PlayScene, GameOverScene]
};
```

### Key Constants (config.js)
```javascript
export const CONFIG = {
    // Wasp movement
    WASP_ACCELERATION: 300,      // pixels/sec²
    WASP_MAX_VELOCITY: 200,      // pixels/sec
    WASP_DRAG: 100,              // friction
    WASP_WORM_SPEED_PENALTY: 15, // velocity reduction per worm

    // Queen hunger
    QUEEN_INITIAL_HUNGER: 100,
    QUEEN_HUNGER_DRAIN: 2,       // percent per second
    WORM_HUNGER_RESTORE: 18,     // percent per worm

    // Difficulty scaling
    DIFFICULTY_INTERVAL: 45000,  // ms between difficulty increases
    HUNGER_DRAIN_INCREASE: 0.5,  // added drain per interval

    // Generation
    ROOM_MIN_SIZE: 200,
    ROOM_MAX_SIZE: 400,
    CORRIDOR_WIDTH: 64,
    BRANCH_PROBABILITY: 0.6,

    // Sprites
    TILE_SIZE: 16,
    WASP_SIZE: 32,
    QUEEN_SIZE: 64,
    WORM_SIZE: 16,
    HORNET_SIZE: 32
};
```

## File Naming Conventions

- Scene files: `PascalCase` + `Scene.js` (e.g., `PlayScene.js`)
- Entity files: `PascalCase` + `.js` (e.g., `Wasp.js`)
- System files: `PascalCase` + `.js` (e.g., `NestGenerator.js`)
- Config files: `camelCase` + `.js` (e.g., `config.js`)

## Running the Game

```bash
# From project root
cd /Users/fredriksafsten/Workprojects/wasp-the-game
python3 -m http.server 8080

# Then open http://localhost:8080 in browser
```

## Phase Documentation

Each phase file (01-08) contains:
1. **Objectives** - What this phase accomplishes
2. **Implementation Details** - Code structure, algorithms, APIs
3. **Files to Create/Modify** - Exact file list with descriptions
4. **Code Examples** - Key code snippets
5. **Manual Test Steps** - Human verification steps
6. **Automated Test Specs** - Unit test specifications
7. **Claude Browser Test** - Agent testing instructions
8. **Acceptance Criteria** - Strict pass/fail conditions
