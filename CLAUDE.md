# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wasp the Game is an endless survival exploration game built with Phaser 3. Player controls a wasp in a procedurally generated hornets nest, collecting worms to feed a hungry queen.

## Development Commands

```bash
# Start local server (required - Phaser needs HTTP server for module loading)
python3 -m http.server 8080

# Open game
open http://localhost:8080
```

No build tools or package manager - vanilla JavaScript with ES6 modules loaded via Phaser CDN.

## Architecture

**Tech Stack:** Phaser 3 (CDN), Vanilla JS, HTML5 Canvas, Arcade Physics

**Scene Flow:** BootScene → PlayScene → GameOverScene

**Key Systems:**
- `NestGenerator` - Procedural room/corridor generation with recursive branching
- `DifficultyManager` - Time-based scaling (hunger drain, enemy spawns, worm scarcity)

**Entity Pattern:** All game entities extend Phaser classes:
- `Wasp` extends `Phaser.Physics.Arcade.Sprite` - momentum-based movement, worm carrying
- `Queen` extends `Phaser.GameObjects.Sprite` - hunger system with drain/feed mechanics
- `Hornet` extends `Phaser.Physics.Arcade.Sprite` - FSM with PATROL/CHASE/RETURN states
- `Worm` extends `Phaser.Physics.Arcade.Sprite` - collectible with wiggle animation

**Game Constants:** All tunable values in `js/config.js` (speeds, rates, sizes)

**Existing Assets:** `wasp-the-game.png` in root - illustrated title screen image (wasp hero, queen, hornets, nest)

## Implementation Status

Project follows phased implementation in `Spec/implementation-plan/`. Each phase has:
- Detailed code examples
- Acceptance criteria with pass/fail conditions
- JavaScript verification commands for testing

## Testing

Uses Chrome browser automation via Claude extension (`/test-game` skill):
1. Main agent reads specs and formats test instructions
2. Testing agent executes via Chrome extension (keyboard input, JS inspection, screenshots)
3. Testing agent returns structured pass/fail report

**Prerequisites for testing:**
- Game server running at `localhost:8080`
- Chrome with Claude extension installed
