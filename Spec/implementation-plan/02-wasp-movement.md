# Phase 2: Wasp Movement

## Objectives

- Implement momentum-based movement with arrow key controls
- Create floaty, insect-like flying physics
- Set up camera to follow the wasp
- Extract wasp logic into dedicated entity class

## Implementation Details

### 2.1 Wasp Entity Class

Create `js/entities/Wasp.js` that:
- Extends Phaser.Physics.Arcade.Sprite
- Encapsulates all wasp movement logic
- Exposes `wormsCarried` property (used in Phase 4)
- Handles velocity capping based on carried worms

### 2.2 Movement Physics

Implement floaty momentum-based movement:
- **Acceleration:** When arrow key held, accelerate in that direction (300 px/sec²)
- **Drag:** Constant friction slows the wasp when no input (drag = 100)
- **Max Velocity:** Speed cap prevents infinite acceleration (200 px/sec base)
- **Diagonal Movement:** Both axes can accelerate simultaneously
- **Smooth Feel:** No instant stops or direction changes

### 2.3 Speed Penalty System

Prepare for worm carrying (implemented in Phase 4):
- Track `wormsCarried` count (starts at 0)
- Reduce max velocity by `WASP_WORM_SPEED_PENALTY` per worm
- Formula: `maxVelocity = 200 - (wormsCarried * 15)`

### 2.4 Camera Follow

Configure camera to:
- Follow the wasp sprite smoothly
- Use lerp for gradual camera movement (0.1 recommended)
- Set world bounds larger than viewport (will be set by NestGenerator in Phase 3)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `js/entities/Wasp.js` | Create | Wasp entity class with movement |
| `js/scenes/PlayScene.js` | Modify | Use Wasp class, setup camera follow |

## Code Examples

### js/entities/Wasp.js
```javascript
import { CONFIG } from '../config.js';

export class Wasp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'wasp');

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Movement properties
        this.wormsCarried = 0;
        this.baseMaxVelocity = CONFIG.WASP_MAX_VELOCITY;

        // Configure physics body
        this.body.setDrag(CONFIG.WASP_DRAG);
        this.body.setMaxVelocity(this.baseMaxVelocity);

        // Store reference to cursors (set by scene)
        this.cursors = null;
    }

    setCursors(cursors) {
        this.cursors = cursors;
    }

    getMaxVelocity() {
        // Reduce max velocity based on worms carried
        const penalty = this.wormsCarried * CONFIG.WASP_WORM_SPEED_PENALTY;
        return Math.max(50, this.baseMaxVelocity - penalty); // Minimum 50
    }

    update() {
        if (!this.cursors) return;

        // Update max velocity based on carried worms
        const maxVel = this.getMaxVelocity();
        this.body.setMaxVelocity(maxVel);

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.body.setAccelerationX(-CONFIG.WASP_ACCELERATION);
        } else if (this.cursors.right.isDown) {
            this.body.setAccelerationX(CONFIG.WASP_ACCELERATION);
        } else {
            this.body.setAccelerationX(0);
        }

        // Vertical movement
        if (this.cursors.up.isDown) {
            this.body.setAccelerationY(-CONFIG.WASP_ACCELERATION);
        } else if (this.cursors.down.isDown) {
            this.body.setAccelerationY(CONFIG.WASP_ACCELERATION);
        } else {
            this.body.setAccelerationY(0);
        }
    }

    // Called when wasp picks up a worm (Phase 4)
    addWorm() {
        this.wormsCarried++;
    }

    // Called when wasp feeds queen or drops worms (Phase 4/5)
    removeWorms(count = this.wormsCarried) {
        const removed = Math.min(count, this.wormsCarried);
        this.wormsCarried -= removed;
        return removed;
    }

    dropAllWorms() {
        const dropped = this.wormsCarried;
        this.wormsCarried = 0;
        return dropped;
    }
}
```

### js/scenes/PlayScene.js (Modified)
```javascript
import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Set up world bounds (temporary - NestGenerator will set these in Phase 3)
        const worldWidth = 2000;
        const worldHeight = 2000;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Create wasp at center of world
        this.wasp = new Wasp(this, worldWidth / 2, worldHeight / 2);

        // Set up arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasp.setCursors(this.cursors);

        // Camera follows wasp
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.wasp, true, 0.1, 0.1);

        // Debug text (fixed to camera)
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0).setDepth(100);

        console.log('PlayScene created with Wasp entity');
    }

    update(time, delta) {
        // Update wasp movement
        this.wasp.update();

        // Update debug display
        const vel = this.wasp.body.velocity;
        const maxVel = this.wasp.getMaxVelocity();
        this.debugText.setText([
            `Velocity: (${vel.x.toFixed(0)}, ${vel.y.toFixed(0)})`,
            `Max Velocity: ${maxVel}`,
            `Worms Carried: ${this.wasp.wormsCarried}`,
            `Position: (${this.wasp.x.toFixed(0)}, ${this.wasp.y.toFixed(0)})`
        ]);
    }
}
```

## Physics Tuning Guide

| Parameter | Value | Effect |
|-----------|-------|--------|
| `WASP_ACCELERATION` | 300 | Higher = snappier response |
| `WASP_MAX_VELOCITY` | 200 | Higher = faster top speed |
| `WASP_DRAG` | 100 | Higher = stops faster when not pressing |
| Camera lerp | 0.1 | Lower = smoother camera, higher = tighter follow |

**Recommended feel:** Current values give ~0.67 seconds to reach max speed, ~2 seconds to fully stop.

## Manual Test Steps

1. **Start the game** and wait for PlayScene to load

2. **Test acceleration:**
   - Press and hold RIGHT arrow
   - Wasp should gradually speed up (not instant)
   - Watch debug text: velocity should increase over ~0.5-1 seconds

3. **Test max velocity:**
   - Continue holding RIGHT
   - Velocity X should cap at 200 (or current max)
   - Should not exceed this value

4. **Test drag/deceleration:**
   - Release all keys while moving
   - Wasp should gradually slow down (not instant stop)
   - Should take ~1-2 seconds to fully stop

5. **Test diagonal movement:**
   - Hold RIGHT + UP simultaneously
   - Wasp should move diagonally
   - Both X and Y velocity should be non-zero

6. **Test camera follow:**
   - Move wasp toward edge of screen
   - Camera should smoothly follow
   - Wasp should stay roughly centered

7. **Test world bounds:**
   - Move to edge of world (2000x2000)
   - Wasp should stop at boundary
   - Should not pass through

## Automated Test Specs

### Unit Tests (Wasp.js)

```javascript
// tests/entities/Wasp.test.js
import { Wasp } from '../js/entities/Wasp.js';
import { CONFIG } from '../js/config.js';

describe('Wasp', () => {
    let mockScene;
    let wasp;

    beforeEach(() => {
        // Create mock Phaser scene
        mockScene = createMockScene();
        wasp = new Wasp(mockScene, 100, 100);
    });

    describe('getMaxVelocity', () => {
        test('returns base velocity with no worms', () => {
            wasp.wormsCarried = 0;
            expect(wasp.getMaxVelocity()).toBe(CONFIG.WASP_MAX_VELOCITY);
        });

        test('reduces velocity per worm carried', () => {
            wasp.wormsCarried = 3;
            const expected = CONFIG.WASP_MAX_VELOCITY - (3 * CONFIG.WASP_WORM_SPEED_PENALTY);
            expect(wasp.getMaxVelocity()).toBe(expected);
        });

        test('has minimum velocity of 50', () => {
            wasp.wormsCarried = 100; // Extreme case
            expect(wasp.getMaxVelocity()).toBe(50);
        });
    });

    describe('worm management', () => {
        test('addWorm increments count', () => {
            wasp.addWorm();
            wasp.addWorm();
            expect(wasp.wormsCarried).toBe(2);
        });

        test('dropAllWorms returns count and resets', () => {
            wasp.wormsCarried = 5;
            const dropped = wasp.dropAllWorms();
            expect(dropped).toBe(5);
            expect(wasp.wormsCarried).toBe(0);
        });

        test('removeWorms removes specified amount', () => {
            wasp.wormsCarried = 5;
            wasp.removeWorms(3);
            expect(wasp.wormsCarried).toBe(2);
        });
    });
});
```

### Integration Test Spec

```javascript
// tests/movement.integration.test.js
describe('Wasp Movement', () => {
    test('holding arrow key increases velocity over time', async () => {
        // Simulate holding right arrow for 500ms
        // Verify velocity.x increased from 0 to > 0
        // Verify velocity.x < max velocity (still accelerating)
    });

    test('releasing keys causes deceleration', async () => {
        // Set initial velocity
        // Release all keys
        // After 500ms, verify velocity decreased
        // After 2000ms, verify velocity near zero
    });

    test('camera follows wasp position', async () => {
        // Move wasp to (1500, 1500)
        // Verify camera.scrollX and scrollY updated
        // Verify wasp is near center of viewport
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Navigate to game:**
   - Use `mcp__claude-in-chrome__navigate` to `http://localhost:8080`
   - Wait 2 seconds for initialization

2. **Take baseline screenshot:**
   - Use `mcp__claude-in-chrome__computer` with action `screenshot`
   - Note initial position of wasp sprite (should be centered)

3. **Test rightward movement:**
   - Use `mcp__claude-in-chrome__computer` with action `key`, text `ArrowRight`, hold for ~1 second (use repeat: 10)
   - Take screenshot
   - Wasp should have moved right from initial position

4. **Verify velocity via JavaScript:**
   ```javascript
   // Execute this in page context
   const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
   const vel = scene.wasp.body.velocity;
   console.log('VELOCITY_CHECK:', vel.x, vel.y);
   ```
   - Use `mcp__claude-in-chrome__javascript_tool` to run above code
   - Verify velocity.x > 0 after pressing right

5. **Test momentum (release and check):**
   - Wait 500ms without pressing keys
   - Execute velocity check again
   - Velocity should be decreasing but > 0 (momentum)

6. **Test camera follow:**
   - Move wasp significantly (hold arrow for 2+ seconds)
   - Take screenshot
   - Wasp should still be roughly centered (camera followed)

7. **Verify debug text updates:**
   - Check that velocity values in debug text match actual velocity
   - Check that position updates as wasp moves

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 2.1 | Wasp accelerates | Velocity increases when holding arrow key | Instant max velocity or no movement |
| 2.2 | Wasp decelerates | Velocity decreases when no keys pressed | Instant stop or no deceleration |
| 2.3 | Max velocity cap | Velocity never exceeds CONFIG.WASP_MAX_VELOCITY | Velocity exceeds max |
| 2.4 | Diagonal movement | Both X and Y velocity non-zero when holding two keys | Only one axis moves |
| 2.5 | Camera follows | Camera position updates to keep wasp in view | Wasp leaves viewport |
| 2.6 | World bounds | Wasp cannot leave world bounds (0,0 to 2000,2000) | Wasp escapes bounds |
| 2.7 | Debug text accurate | Displayed velocity matches actual body.velocity | Values don't match |
| 2.8 | No errors | No JavaScript errors in console | Any JS error |

### Verification Commands

```javascript
// Check wasp has physics body with correct drag
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
scene.wasp.body.drag.x === 100 && scene.wasp.body.drag.y === 100

// Check max velocity is correct
scene.wasp.body.maxVelocity.x === 200 && scene.wasp.body.maxVelocity.y === 200

// Check camera is following wasp
Math.abs(scene.cameras.main.scrollX - (scene.wasp.x - 400)) < 50

// Verify Wasp is instance of correct class
scene.wasp.constructor.name === 'Wasp'
```

### Movement Feel Verification

To verify the "floaty" feel is correct:
1. Press right arrow briefly (tap)
2. Wasp should continue drifting right after release
3. Drift should last 1-2 seconds before stopping
4. If wasp stops instantly = FAIL (drag too high or acceleration too low)
