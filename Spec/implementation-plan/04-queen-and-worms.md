# Phase 4: Queen & Worms

## Objectives

- Create Queen entity with hunger system
- Implement hunger meter UI
- Create Worm collectibles at spawn points
- Implement worm pickup and carrying
- Implement feeding mechanic (deliver worms to queen)
- Trigger game over when hunger reaches 0

## Implementation Details

### 4.1 Queen Entity

Create `js/entities/Queen.js` that:
- Extends Phaser.GameObjects.Sprite (no physics needed - stationary)
- Has `hunger` property (0-100, starts at 100)
- Drains hunger over time at `QUEEN_HUNGER_DRAIN` per second
- Accepts worms to restore hunger
- Emits event when hunger reaches 0

### 4.2 Hunger System

- **Initial hunger:** 100%
- **Drain rate:** 2% per second (configurable)
- **Worm restore:** 18% per worm
- **Display:** Bar above queen, always visible
- **Game over:** When hunger <= 0

### 4.3 Worm Entity

Create `js/entities/Worm.js` that:
- Small collectible sprite
- Placed at spawn points from NestGenerator
- Disappears when collected by wasp
- Simple wiggle animation (optional)

### 4.4 Collection Mechanic

When wasp overlaps worm:
- Worm is destroyed
- Wasp's `wormsCarried` increases
- Visual/audio feedback
- Wasp max velocity decreases (already implemented in Phase 2)

### 4.5 Feeding Mechanic

When wasp overlaps queen while carrying worms:
- All worms transferred to queen
- Each worm restores `WORM_HUNGER_RESTORE` hunger
- Hunger caps at 100
- Wasp's `wormsCarried` resets to 0
- Visual feedback (queen pulses, text shows amount fed)

### 4.6 Hunger UI

- Horizontal bar above queen sprite
- Green when > 50%, yellow when 25-50%, red when < 25%
- Fixed to queen position (doesn't scroll)
- Shows percentage text

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `js/entities/Queen.js` | Create | Queen entity with hunger |
| `js/entities/Worm.js` | Create | Collectible worm entity |
| `js/scenes/PlayScene.js` | Modify | Spawn queen/worms, handle collection/feeding |

## Code Examples

### js/entities/Queen.js
```javascript
import { CONFIG } from '../config.js';

export class Queen extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'queen');

        scene.add.existing(this);

        this.hunger = CONFIG.QUEEN_INITIAL_HUNGER;
        this.drainRate = CONFIG.QUEEN_HUNGER_DRAIN;
        this.isAlive = true;

        // Create hunger bar
        this.createHungerBar();

        // Create overlap zone (larger than sprite for easier feeding)
        this.feedZone = scene.add.zone(x, y, CONFIG.QUEEN_SIZE * 1.5, CONFIG.QUEEN_SIZE * 1.5);
        scene.physics.add.existing(this.feedZone, true); // Static body
    }

    createHungerBar() {
        const barWidth = CONFIG.QUEEN_SIZE * 1.5;
        const barHeight = 10;
        const barY = -CONFIG.QUEEN_SIZE / 2 - 20;

        // Background (dark)
        this.hungerBarBg = this.scene.add.rectangle(
            0, barY, barWidth, barHeight, 0x333333
        );
        this.hungerBarBg.setOrigin(0.5, 0.5);

        // Foreground (colored)
        this.hungerBarFg = this.scene.add.rectangle(
            0, barY, barWidth, barHeight, 0x00ff00
        );
        this.hungerBarFg.setOrigin(0.5, 0.5);

        // Container to group with queen
        this.hungerBarBg.setScrollFactor(1);
        this.hungerBarFg.setScrollFactor(1);
    }

    updateHungerBar() {
        const barWidth = CONFIG.QUEEN_SIZE * 1.5;
        const fillWidth = (this.hunger / 100) * barWidth;

        this.hungerBarFg.width = fillWidth;

        // Color based on hunger level
        if (this.hunger > 50) {
            this.hungerBarFg.setFillStyle(0x00ff00); // Green
        } else if (this.hunger > 25) {
            this.hungerBarFg.setFillStyle(0xffff00); // Yellow
        } else {
            this.hungerBarFg.setFillStyle(0xff0000); // Red
        }

        // Position relative to queen
        this.hungerBarBg.setPosition(this.x, this.y - CONFIG.QUEEN_SIZE / 2 - 20);
        this.hungerBarFg.setPosition(
            this.x - (barWidth - fillWidth) / 2,
            this.y - CONFIG.QUEEN_SIZE / 2 - 20
        );
    }

    update(delta) {
        if (!this.isAlive) return;

        // Drain hunger over time
        const drainAmount = (this.drainRate / 1000) * delta;
        this.hunger = Math.max(0, this.hunger - drainAmount);

        this.updateHungerBar();

        // Check for death
        if (this.hunger <= 0) {
            this.isAlive = false;
            this.scene.events.emit('queenDied');
        }
    }

    feed(wormCount) {
        if (wormCount <= 0) return 0;

        const restoreAmount = wormCount * CONFIG.WORM_HUNGER_RESTORE;
        const oldHunger = this.hunger;
        this.hunger = Math.min(100, this.hunger + restoreAmount);

        const actualRestore = this.hunger - oldHunger;
        this.updateHungerBar();

        // Visual feedback
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });

        return wormCount;
    }

    increaseDrainRate(amount) {
        this.drainRate += amount;
    }
}
```

### js/entities/Worm.js
```javascript
import { CONFIG } from '../config.js';

export class Worm extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'worm');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Make body slightly smaller than sprite for precise collision
        this.body.setSize(CONFIG.WORM_SIZE * 0.8, CONFIG.WORM_SIZE * 0.8);

        // Simple wiggle animation
        this.startWiggle();
    }

    startWiggle() {
        this.scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect() {
        // Stop animation
        this.scene.tweens.killTweensOf(this);

        // Quick scale down and destroy
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 150,
            onComplete: () => this.destroy()
        });
    }
}
```

### js/scenes/PlayScene.js (Modified)
```javascript
import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';
import { Queen } from '../entities/Queen.js';
import { Worm } from '../entities/Worm.js';
import { NestGenerator } from '../systems/NestGenerator.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Generate nest
        this.nestGenerator = new NestGenerator(this);
        this.nestData = this.nestGenerator.generate();

        const bounds = this.nestData.bounds;
        this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

        // Create queen in queen's chamber
        const queenRoom = this.nestData.queenRoom;
        this.queen = new Queen(this, queenRoom.centerX, queenRoom.centerY);

        // Create wasp near queen
        this.wasp = new Wasp(this, queenRoom.centerX, queenRoom.centerY - 50);

        // Create worms at spawn points
        this.worms = this.physics.add.group();
        this.spawnWorms();

        // Set up collisions
        this.physics.add.collider(this.wasp, this.nestData.wallLayer);

        // Worm collection
        this.physics.add.overlap(this.wasp, this.worms, this.collectWorm, null, this);

        // Queen feeding
        this.physics.add.overlap(this.wasp, this.queen.feedZone, this.feedQueen, null, this);

        // Queen death event
        this.events.on('queenDied', this.gameOver, this);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasp.setCursors(this.cursors);

        // Camera
        this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cameras.main.startFollow(this.wasp, true, 0.1, 0.1);

        // UI
        this.createUI();

        console.log('PlayScene created with Queen and', this.worms.getLength(), 'worms');
    }

    spawnWorms() {
        for (const spawnPoint of this.nestData.wormSpawnPoints) {
            const worm = new Worm(this, spawnPoint.x, spawnPoint.y);
            this.worms.add(worm);
        }
    }

    collectWorm(wasp, worm) {
        wasp.addWorm();
        worm.collect();

        // Update UI
        this.updateUI();

        console.log('Worm collected! Carrying:', wasp.wormsCarried);
    }

    feedQueen(wasp, feedZone) {
        if (wasp.wormsCarried === 0) return;

        const fed = this.queen.feed(wasp.wormsCarried);
        wasp.removeWorms(fed);

        // Show feed text
        const feedText = this.add.text(
            this.queen.x, this.queen.y - 80,
            `+${fed} worms!`,
            { fontSize: '20px', fill: '#00ff00' }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: feedText,
            y: feedText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => feedText.destroy()
        });

        this.updateUI();
        console.log('Fed queen! Hunger:', this.queen.hunger.toFixed(1));
    }

    createUI() {
        this.uiText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100);

        this.updateUI();
    }

    updateUI() {
        this.uiText.setText([
            `Worms Carried: ${this.wasp.wormsCarried}`,
            `Queen Hunger: ${this.queen.hunger.toFixed(1)}%`,
            `Worms Remaining: ${this.worms.getLength()}`
        ]);
    }

    gameOver() {
        console.log('Game Over - Queen starved!');
        this.scene.start('GameOverScene', { reason: 'starved' });
    }

    update(time, delta) {
        this.wasp.update();
        this.queen.update(delta);
        this.updateUI();
    }
}
```

## Manual Test Steps

1. **Verify queen spawns:**
   - Queen sprite visible in center chamber
   - Larger than wasp (64x64 vs 32x32)
   - Hunger bar visible above queen

2. **Test hunger drain:**
   - Watch hunger bar decrease over time
   - UI text should show decreasing percentage
   - Bar should change color: green → yellow → red

3. **Verify worms spawn:**
   - Navigate to other rooms
   - Pink worm sprites should be visible
   - Worms should wiggle slightly

4. **Test worm collection:**
   - Move wasp over a worm
   - Worm should disappear with animation
   - "Worms Carried" UI should increment
   - Wasp should move slightly slower

5. **Test feeding:**
   - Collect some worms (2-3)
   - Return to queen
   - Move over queen
   - Worms should transfer (Carried goes to 0)
   - Hunger should increase
   - Queen should pulse briefly
   - "+X worms!" text should appear

6. **Test game over:**
   - Don't feed queen, wait for hunger to reach 0
   - Game should transition to GameOverScene
   - (Alternatively: set QUEEN_HUNGER_DRAIN to 50 for faster testing)

## Automated Test Specs

### Unit Tests

```javascript
// tests/entities/Queen.test.js
import { Queen } from '../js/entities/Queen.js';
import { CONFIG } from '../js/config.js';

describe('Queen', () => {
    let queen;
    let mockScene;

    beforeEach(() => {
        mockScene = createMockScene();
        queen = new Queen(mockScene, 100, 100);
    });

    describe('hunger system', () => {
        test('starts at full hunger', () => {
            expect(queen.hunger).toBe(CONFIG.QUEEN_INITIAL_HUNGER);
        });

        test('drains hunger over time', () => {
            const initialHunger = queen.hunger;
            queen.update(1000); // 1 second
            expect(queen.hunger).toBeLessThan(initialHunger);
        });

        test('hunger cannot go below 0', () => {
            queen.hunger = 1;
            queen.update(10000); // 10 seconds
            expect(queen.hunger).toBe(0);
        });
    });

    describe('feeding', () => {
        test('increases hunger by worm restore amount', () => {
            queen.hunger = 50;
            queen.feed(1);
            expect(queen.hunger).toBe(50 + CONFIG.WORM_HUNGER_RESTORE);
        });

        test('caps hunger at 100', () => {
            queen.hunger = 95;
            queen.feed(5); // Would be 95 + 5*18 = 185
            expect(queen.hunger).toBe(100);
        });

        test('returns number of worms fed', () => {
            queen.hunger = 50;
            const fed = queen.feed(3);
            expect(fed).toBe(3);
        });
    });

    describe('death', () => {
        test('emits queenDied when hunger reaches 0', () => {
            const callback = jest.fn();
            mockScene.events.on('queenDied', callback);

            queen.hunger = 0.001;
            queen.update(1000);

            expect(callback).toHaveBeenCalled();
            expect(queen.isAlive).toBe(false);
        });
    });
});
```

```javascript
// tests/entities/Worm.test.js
import { Worm } from '../js/entities/Worm.js';

describe('Worm', () => {
    test('has physics body', () => {
        const mockScene = createMockScene();
        const worm = new Worm(mockScene, 100, 100);
        expect(worm.body).toBeDefined();
    });

    test('collect destroys worm', () => {
        const mockScene = createMockScene();
        const worm = new Worm(mockScene, 100, 100);
        worm.collect();
        // After tween completes, worm should be destroyed
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Navigate and take initial screenshot:**
   - Navigate to `http://localhost:8080`
   - Wait 3 seconds
   - Screenshot: verify queen sprite and hunger bar visible

2. **Verify hunger drain via JavaScript:**
   ```javascript
   const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
   const initialHunger = scene.queen.hunger;
   // Wait, then check again
   setTimeout(() => {
       console.log('HUNGER_DRAIN:', initialHunger - scene.queen.hunger);
   }, 2000);
   ```
   - Hunger should decrease by ~4% in 2 seconds

3. **Navigate to find worms:**
   - Use arrow keys to explore (move right or down)
   - Take screenshot when pink worm sprites visible
   - Execute: `scene.worms.getLength()` should be > 0

4. **Test worm collection:**
   - Navigate wasp to overlap a worm
   - Execute: `scene.wasp.wormsCarried` should be > 0 after collection
   - Worm count in group should decrease

5. **Test feeding:**
   - Navigate back to queen (center)
   - Move over queen sprite
   - Execute: `scene.wasp.wormsCarried` should be 0
   - Execute: check `scene.queen.hunger` increased

6. **Test game over (optional, destructive):**
   - Execute: `scene.queen.hunger = 0.1`
   - Wait 1 second
   - Verify scene changed to GameOverScene

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 4.1 | Queen spawns | Queen sprite visible in queen chamber | No queen or wrong position |
| 4.2 | Hunger bar exists | Bar visible above queen, shows correct % | No bar or incorrect display |
| 4.3 | Hunger drains | Hunger decreases ~2%/sec over 5 seconds | No drain or wrong rate |
| 4.4 | Hunger bar colors | Green >50%, yellow 25-50%, red <25% | Wrong colors |
| 4.5 | Worms spawn | At least 3 worm sprites in non-queen rooms | No worms or < 3 |
| 4.6 | Worm collection works | Overlap worm → wormsCarried++ and worm destroyed | Collection fails |
| 4.7 | Carrying slows wasp | Max velocity decreases with worms (check body.maxVelocity) | No speed change |
| 4.8 | Feeding works | Overlap queen with worms → hunger increases, worms = 0 | Feeding fails |
| 4.9 | Hunger caps at 100 | Feeding when hunger = 90% caps at 100, not higher | Exceeds 100 |
| 4.10 | Game over triggers | Hunger = 0 → scene changes to GameOverScene | No game over |
| 4.11 | UI updates | Worms Carried and Hunger % reflect actual values | UI doesn't update |

### Verification Commands

```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Check queen exists and has hunger
scene.queen && scene.queen.hunger === 100 // Initially

// Check worms exist
scene.worms.getLength() >= 3

// Check collection works (after collecting)
scene.wasp.wormsCarried > 0

// Check speed penalty
const expectedMax = 200 - (scene.wasp.wormsCarried * 15);
Math.abs(scene.wasp.body.maxVelocity.x - expectedMax) < 1

// Check feeding (after feeding)
scene.wasp.wormsCarried === 0 && scene.queen.hunger > 50

// Force game over test
scene.queen.hunger = 0; scene.queen.update(100);
game.scene.isActive('GameOverScene')
```
