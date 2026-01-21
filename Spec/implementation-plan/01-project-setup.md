# Phase 1: Project Setup

## Objectives

- Create the HTML entry point with Phaser 3 loaded from CDN
- Set up the basic Phaser game configuration
- Create a minimal PlayScene that renders to confirm Phaser works
- Establish the file structure for subsequent phases

## Implementation Details

### 1.1 HTML Entry Point

Create `index.html` that:
- Loads Phaser 3 from CDN (version 3.70.0 or latest stable)
- Sets up a centered game canvas with black background
- Loads the game JavaScript as ES6 modules

### 1.2 Phaser Configuration

Create `js/game.js` that:
- Defines Phaser config with 800x600 canvas
- Uses Arcade physics with no gravity (top-down game)
- Registers scenes in correct order
- Creates the Phaser.Game instance

### 1.3 Configuration Constants

Create `js/config.js` that:
- Exports all game constants as a single CONFIG object
- Includes placeholder values for all phases (movement, hunger, generation, etc.)
- Uses ES6 export syntax

### 1.4 Boot Scene

Create `js/scenes/BootScene.js` that:
- Will eventually load all assets
- For now, generates a simple colored rectangle as placeholder sprite
- Transitions to PlayScene when ready

### 1.5 Play Scene

Create `js/scenes/PlayScene.js` that:
- Creates the game world
- Displays a placeholder sprite (colored square) in the center
- Sets up basic input handling (logs arrow key presses to console)
- Confirms physics system is active

### 1.6 Game Over Scene (Placeholder)

Create `js/scenes/GameOverScene.js` that:
- Displays "Game Over" text
- Will be expanded in Phase 6

## Files to Create

| File | Purpose |
|------|---------|
| `index.html` | Entry point, loads Phaser CDN and game modules |
| `js/game.js` | Phaser config and game initialization |
| `js/config.js` | Game constants and tuning values |
| `js/scenes/BootScene.js` | Asset loading (placeholder for now) |
| `js/scenes/PlayScene.js` | Main gameplay scene |
| `js/scenes/GameOverScene.js` | End game display (placeholder) |

## Code Examples

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wasp the Game</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #1a1a2e;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
    <script type="module" src="js/game.js"></script>
</body>
</html>
```

### js/config.js
```javascript
export const CONFIG = {
    // Canvas
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,

    // Wasp movement (Phase 2)
    WASP_ACCELERATION: 300,
    WASP_MAX_VELOCITY: 200,
    WASP_DRAG: 100,
    WASP_WORM_SPEED_PENALTY: 15,

    // Queen hunger (Phase 4)
    QUEEN_INITIAL_HUNGER: 100,
    QUEEN_HUNGER_DRAIN: 2,
    WORM_HUNGER_RESTORE: 18,

    // Difficulty scaling (Phase 6)
    DIFFICULTY_INTERVAL: 45000,
    HUNGER_DRAIN_INCREASE: 0.5,
    ENEMY_SPAWN_INCREASE: 1,

    // Nest generation (Phase 3)
    ROOM_MIN_SIZE: 200,
    ROOM_MAX_SIZE: 400,
    CORRIDOR_WIDTH: 64,
    BRANCH_PROBABILITY: 0.6,
    MAX_DEPTH: 5,

    // Sprites
    TILE_SIZE: 16,
    WASP_SIZE: 32,
    QUEEN_SIZE: 64,
    WORM_SIZE: 16,
    HORNET_SIZE: 32,

    // Colors (placeholders until pixel art)
    COLOR_WASP: 0xffff00,
    COLOR_QUEEN: 0xff00ff,
    COLOR_WORM: 0xff69b4,
    COLOR_HORNET: 0xff4500,
    COLOR_WALL: 0x8b4513,
    COLOR_FLOOR: 0x2d1f1f
};
```

### js/game.js
```javascript
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { PlayScene } from './scenes/PlayScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    width: CONFIG.GAME_WIDTH,
    height: CONFIG.GAME_HEIGHT,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true  // Enable during development
        }
    },
    scene: [BootScene, PlayScene, GameOverScene]
};

const game = new Phaser.Game(config);
```

### js/scenes/BootScene.js
```javascript
import { CONFIG } from '../config.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Generate placeholder graphics
        this.createPlaceholderSprites();
    }

    createPlaceholderSprites() {
        // Wasp placeholder (yellow square)
        const waspGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        waspGraphics.fillStyle(CONFIG.COLOR_WASP);
        waspGraphics.fillRect(0, 0, CONFIG.WASP_SIZE, CONFIG.WASP_SIZE);
        waspGraphics.generateTexture('wasp', CONFIG.WASP_SIZE, CONFIG.WASP_SIZE);
        waspGraphics.destroy();

        // Queen placeholder (magenta square)
        const queenGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        queenGraphics.fillStyle(CONFIG.COLOR_QUEEN);
        queenGraphics.fillRect(0, 0, CONFIG.QUEEN_SIZE, CONFIG.QUEEN_SIZE);
        queenGraphics.generateTexture('queen', CONFIG.QUEEN_SIZE, CONFIG.QUEEN_SIZE);
        queenGraphics.destroy();

        // Worm placeholder (pink square)
        const wormGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        wormGraphics.fillStyle(CONFIG.COLOR_WORM);
        wormGraphics.fillRect(0, 0, CONFIG.WORM_SIZE, CONFIG.WORM_SIZE);
        wormGraphics.generateTexture('worm', CONFIG.WORM_SIZE, CONFIG.WORM_SIZE);
        wormGraphics.destroy();

        // Hornet placeholder (orange square)
        const hornetGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        hornetGraphics.fillStyle(CONFIG.COLOR_HORNET);
        hornetGraphics.fillRect(0, 0, CONFIG.HORNET_SIZE, CONFIG.HORNET_SIZE);
        hornetGraphics.generateTexture('hornet', CONFIG.HORNET_SIZE, CONFIG.HORNET_SIZE);
        hornetGraphics.destroy();

        // Wall tile placeholder
        const wallGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        wallGraphics.fillStyle(CONFIG.COLOR_WALL);
        wallGraphics.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wallGraphics.generateTexture('wall', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wallGraphics.destroy();

        // Floor tile placeholder
        const floorGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        floorGraphics.fillStyle(CONFIG.COLOR_FLOOR);
        floorGraphics.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        floorGraphics.generateTexture('floor', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        floorGraphics.destroy();
    }

    create() {
        this.scene.start('PlayScene');
    }
}
```

### js/scenes/PlayScene.js
```javascript
import { CONFIG } from '../config.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Create placeholder wasp sprite in center
        this.wasp = this.physics.add.sprite(
            CONFIG.GAME_WIDTH / 2,
            CONFIG.GAME_HEIGHT / 2,
            'wasp'
        );

        // Set up arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Debug text
        this.debugText = this.add.text(10, 10, 'Phase 1: Setup Complete', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        console.log('PlayScene created successfully');
        console.log('Wasp sprite:', this.wasp);
        console.log('Cursors:', this.cursors);
    }

    update() {
        // Log arrow key presses (movement implemented in Phase 2)
        if (this.cursors.left.isDown) console.log('Left pressed');
        if (this.cursors.right.isDown) console.log('Right pressed');
        if (this.cursors.up.isDown) console.log('Up pressed');
        if (this.cursors.down.isDown) console.log('Down pressed');
    }
}
```

### js/scenes/GameOverScene.js
```javascript
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.add.text(400, 300, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        this.add.text(400, 360, 'Press SPACE to restart', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('PlayScene');
        });
    }
}
```

## Manual Test Steps

1. **Start local server:**
   ```bash
   cd /Users/fredriksafsten/Workprojects/wasp-the-game
   python3 -m http.server 8080
   ```

2. **Open browser to http://localhost:8080**

3. **Verify canvas appears:**
   - 800x600 canvas centered on page
   - Dark background (#1a1a2e)

4. **Verify wasp placeholder:**
   - Yellow square visible in center of canvas
   - Approximately 32x32 pixels

5. **Verify debug text:**
   - "Phase 1: Setup Complete" visible in top-left

6. **Test input logging:**
   - Open browser console (F12 → Console)
   - Press arrow keys
   - Should see "Left pressed", "Right pressed", etc. logged

7. **Verify no errors:**
   - Console should have no red errors
   - Should see "PlayScene created successfully"

## Automated Test Specs

### Unit Tests (Jest)

```javascript
// tests/config.test.js
import { CONFIG } from '../js/config.js';

describe('CONFIG', () => {
    test('has required game dimensions', () => {
        expect(CONFIG.GAME_WIDTH).toBe(800);
        expect(CONFIG.GAME_HEIGHT).toBe(600);
    });

    test('has wasp movement constants', () => {
        expect(CONFIG.WASP_ACCELERATION).toBeGreaterThan(0);
        expect(CONFIG.WASP_MAX_VELOCITY).toBeGreaterThan(0);
        expect(CONFIG.WASP_DRAG).toBeGreaterThan(0);
    });

    test('has sprite sizes defined', () => {
        expect(CONFIG.WASP_SIZE).toBe(32);
        expect(CONFIG.QUEEN_SIZE).toBe(64);
        expect(CONFIG.WORM_SIZE).toBe(16);
        expect(CONFIG.TILE_SIZE).toBe(16);
    });
});
```

### Integration Test Spec

```javascript
// tests/setup.integration.test.js
describe('Game Setup', () => {
    test('Phaser game initializes without errors', async () => {
        // Load index.html in test environment
        // Verify Phaser.Game instance created
        // Verify BootScene → PlayScene transition
    });

    test('PlayScene creates wasp sprite', async () => {
        // Access PlayScene
        // Verify this.wasp exists
        // Verify sprite has physics body
    });

    test('Input system initialized', async () => {
        // Verify cursors object exists
        // Verify all four arrow keys are tracked
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Navigate to game:**
   - Use `mcp__claude-in-chrome__navigate` to go to `http://localhost:8080`
   - Wait 2 seconds for Phaser to initialize

2. **Take initial screenshot:**
   - Use `mcp__claude-in-chrome__computer` with action `screenshot`
   - Verify canvas is visible

3. **Check for wasp sprite:**
   - Look for yellow square in center of canvas
   - Sprite should be approximately 32x32 pixels

4. **Check debug text:**
   - Verify "Phase 1: Setup Complete" text visible in top-left

5. **Test input detection:**
   - Use `mcp__claude-in-chrome__computer` with action `key` and text `ArrowLeft`
   - Use `mcp__claude-in-chrome__read_console_messages` to check for "Left pressed" log

6. **Check for errors:**
   - Use `mcp__claude-in-chrome__read_console_messages` with `onlyErrors: true`
   - Should return no error messages

## Acceptance Criteria (Strict Pass/Fail)

All criteria must pass. Any failure = phase not complete.

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 1.1 | Canvas renders | 800x600 canvas visible on page | No canvas or wrong dimensions |
| 1.2 | Phaser initializes | No JavaScript errors in console | Any JS error present |
| 1.3 | Wasp sprite visible | Yellow 32x32 square in canvas center | No sprite or wrong position |
| 1.4 | Debug text visible | "Phase 1: Setup Complete" text in top-left | Text missing or wrong content |
| 1.5 | Input detected | Arrow key press logs to console | No console output on key press |
| 1.6 | Physics enabled | Wasp sprite has physics body (check via JS: `scene.wasp.body !== null`) | No physics body |
| 1.7 | Scene transition | BootScene → PlayScene happens automatically | Stuck on BootScene or error |

### Verification Commands (for testing agent)

```javascript
// Check canvas dimensions
document.querySelector('canvas').width === 800 && document.querySelector('canvas').height === 600

// Check Phaser game exists
typeof Phaser !== 'undefined' && document.querySelector('canvas') !== null

// Check current scene (run in browser console)
game.scene.scenes.find(s => s.scene.isActive('PlayScene')) !== undefined
```
