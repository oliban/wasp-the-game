# Wasp the Game - Priority & Phase Overview

## Priority Definitions

| Priority | Meaning | Description |
|----------|---------|-------------|
| P0 | Critical | Project setup - must complete first |
| P1 | High | Core gameplay mechanics |
| P2 | Medium | Main game entities and interactions |
| P3 | Standard | Progression and polish systems |
| P4 | Lower | Visual assets |
| P5 | Optional | Sound and effects |
| P6 | Nice-to-have | Extra polish |

## Phase Descriptions

### SETUP (P0) - Project Foundation
**Features:** SETUP-001 through SETUP-006

Basic project infrastructure:
- HTML entry point with Phaser 3 CDN
- Game configuration (800x600, Arcade physics)
- Constants file with all tunable values
- BootScene for asset loading
- PlayScene shell with input handling
- GameOverScene placeholder

**Depends on:** Nothing
**Blocks:** All other phases

### MOVE (P1) - Wasp Movement
**Features:** MOVE-001 through MOVE-004

Player movement mechanics:
- Wasp entity class extending Phaser sprite
- Momentum-based physics (acceleration, drag, max velocity)
- Speed penalty when carrying worms
- Camera follow system with lerp

**Depends on:** SETUP
**Blocks:** NEST, QUEEN, HORNET

### NEST (P1) - Procedural Generation
**Features:** NEST-001 through NEST-007

World generation system:
- NestGenerator class with room data structures
- Queen's chamber at center (depth 0)
- Recursive corridor/room expansion
- Worm spawn point placement
- Tilemap generation with collision

**Depends on:** MOVE
**Blocks:** QUEEN, HORNET

### QUEEN (P2) - Queen & Worms
**Features:** QUEEN-001 through QUEEN-007

Core gameplay loop:
- Queen entity with hunger system
- Hunger bar UI (color-coded)
- Worm collectible entities
- Collection mechanic (overlap detection)
- Feeding mechanic (transfer worms to queen)
- Game over on starvation

**Depends on:** NEST
**Blocks:** HORNET

### HORNET (P2) - Enemy AI
**Features:** HORNET-001 through HORNET-008

Enemy system:
- Hornet entity with state machine
- Patrol behavior (room boundaries)
- Chase behavior (detection, pursuit, timeout)
- Return behavior (back to home)
- Collision handling (worm drop, invincibility)
- Hornet spawning based on room depth

**Depends on:** QUEEN
**Blocks:** DIFF

### DIFF (P3) - Difficulty & Scoring
**Features:** DIFF-001 through DIFF-006

Progression system:
- DifficultyManager tracking time/level
- Score display (survival time)
- Difficulty scaling every 45 seconds
- Dynamic hornet spawning
- Worm respawning system
- Complete GameOverScene with high scores

**Depends on:** HORNET
**Blocks:** ART (soft)

### ART (P4) - Pixel Art Sprites
**Features:** ART-001 through ART-007

Visual assets:
- Wasp sprite sheet (32x32, 4 frames)
- Queen sprite sheet (64x64, 4 frames)
- Hornet sprite sheet (32x32, 4 frames)
- Worm sprite sheet (16x16, 4 frames)
- Wall and floor tiles (16x16)
- Animation definitions and integration

**Depends on:** DIFF (soft - can use placeholders)
**Blocks:** POLISH (soft)

### POLISH (P5-P6) - Final Polish
**Features:** POLISH-001 through POLISH-006

Optional enhancements:
- Title screen using existing wasp-the-game.png
- Sound effects (buzz, pickup, hit, etc.)
- Screen shake on impacts
- Particle effects (sparkles, hearts)
- Background music
- UI polish and juice

**Depends on:** ART
**Blocks:** Nothing

## Recommended Worker Assignment

For parallel development, assign workers by phase prefix:

| Worker | Phase | Features |
|--------|-------|----------|
| 1 | SETUP | 6 features |
| 2 | MOVE + NEST | 11 features |
| 3 | QUEEN | 7 features |
| 4 | HORNET | 8 features |
| 5 | DIFF + ART | 13 features |
| 6 | POLISH | 6 features |

**Note:** Some parallelization possible within constraints. SETUP must complete first. Workers 2-4 have dependencies but can prepare files. Worker 5-6 can start after core gameplay complete.

## Feature Count by Phase

| Phase | Count | Priority |
|-------|-------|----------|
| SETUP | 6 | P0 |
| MOVE | 4 | P1 |
| NEST | 7 | P1 |
| QUEEN | 7 | P2 |
| HORNET | 8 | P2 |
| DIFF | 6 | P3 |
| ART | 7 | P4 |
| POLISH | 6 | P5-P6 |
| **Total** | **51** | - |
