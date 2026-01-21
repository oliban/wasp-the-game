# Phase 6: Difficulty Scaling & Scoring

## Objectives

- Track survival time as score
- Implement difficulty scaling over time
- Increase queen hunger drain rate
- Spawn additional hornets as time passes
- Reduce worm respawn rate
- Complete GameOverScene with score display and restart

## Implementation Details

### 6.1 Difficulty Manager

Create `js/systems/DifficultyManager.js` that:
- Tracks elapsed game time
- Triggers difficulty increases at intervals (every 45 seconds)
- Notifies queen to increase hunger drain
- Spawns additional hornets
- Adjusts worm respawn parameters

### 6.2 Scoring System

- **Score = survival time in seconds**
- Display score in UI (real-time)
- Pass final score to GameOverScene
- Format: "Time: MM:SS"

### 6.3 Difficulty Scaling Mechanics

**Every 45 seconds (DIFFICULTY_INTERVAL):**

| Mechanic | Change | Cap |
|----------|--------|-----|
| Queen hunger drain | +0.5%/sec | 10%/sec max |
| Hornets | +1 new hornet in random room | 20 max |
| Worm respawn | -10% spawn chance | 20% min chance |

### 6.4 Hornet Dynamic Spawning

When difficulty increases:
- Pick random non-queen room
- Spawn new Hornet at room center
- New hornet immediately begins patrol

### 6.5 Worm Respawning

Periodically respawn worms:
- Check every 10 seconds
- For each empty spawn point, chance to respawn worm
- Base chance: 50%, decreases with difficulty
- Ensures worms don't run out completely

### 6.6 Game Over Scene

Complete `GameOverScene.js` to:
- Display "GAME OVER" text
- Show final score (time survived)
- Show reason for death ("The Queen starved!")
- Restart button (SPACE key or click)
- Optional: High score persistence (localStorage)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `js/systems/DifficultyManager.js` | Create | Difficulty scaling logic |
| `js/scenes/PlayScene.js` | Modify | Integrate difficulty, track score |
| `js/scenes/GameOverScene.js` | Modify | Full implementation |

## Code Examples

### js/systems/DifficultyManager.js
```javascript
import { CONFIG } from '../config.js';

export class DifficultyManager {
    constructor(scene) {
        this.scene = scene;
        this.elapsedTime = 0;
        this.difficultyLevel = 0;
        this.lastDifficultyIncrease = 0;

        // Scaling values
        this.hungerDrainBonus = 0;
        this.hornetSpawnCount = 0;
        this.wormRespawnChance = 0.5; // 50% base

        // Caps
        this.maxHungerDrain = 10;
        this.maxHornets = 20;
        this.minWormRespawnChance = 0.2;
    }

    update(delta) {
        this.elapsedTime += delta;

        // Check for difficulty increase
        if (this.elapsedTime - this.lastDifficultyIncrease >= CONFIG.DIFFICULTY_INTERVAL) {
            this.increaseDifficulty();
            this.lastDifficultyIncrease = this.elapsedTime;
        }
    }

    increaseDifficulty() {
        this.difficultyLevel++;
        console.log('Difficulty increased to level', this.difficultyLevel);

        // Increase queen hunger drain
        const queen = this.scene.queen;
        if (queen && queen.drainRate < this.maxHungerDrain) {
            queen.increaseDrainRate(CONFIG.HUNGER_DRAIN_INCREASE);
            console.log('Queen hunger drain now:', queen.drainRate);
        }

        // Spawn additional hornet
        if (this.scene.hornets.getLength() < this.maxHornets) {
            this.spawnNewHornet();
        }

        // Reduce worm respawn chance
        if (this.wormRespawnChance > this.minWormRespawnChance) {
            this.wormRespawnChance -= 0.1;
            this.wormRespawnChance = Math.max(this.wormRespawnChance, this.minWormRespawnChance);
            console.log('Worm respawn chance now:', this.wormRespawnChance);
        }

        // Visual feedback
        this.scene.showDifficultyIncrease();
    }

    spawnNewHornet() {
        const rooms = this.scene.nestData.rooms.filter(
            r => r.type !== 'queen' && r.type !== 'corridor'
        );

        if (rooms.length === 0) return;

        const room = Phaser.Utils.Array.GetRandom(rooms);
        const hornet = new (this.scene.Hornet || require('../entities/Hornet.js').Hornet)(
            this.scene,
            room.centerX,
            room.centerY,
            room
        );
        hornet.setTarget(this.scene.wasp);
        this.scene.hornets.add(hornet);

        console.log('Spawned new hornet in room', room.id);
    }

    getScore() {
        return Math.floor(this.elapsedTime / 1000); // Seconds
    }

    getFormattedScore() {
        const totalSeconds = this.getScore();
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getDifficultyLevel() {
        return this.difficultyLevel;
    }
}
```

### js/scenes/PlayScene.js (Difficulty Integration)
```javascript
import { DifficultyManager } from '../systems/DifficultyManager.js';
import { Hornet } from '../entities/Hornet.js';

// Store Hornet reference for DifficultyManager
this.Hornet = Hornet;

// In create():
this.difficultyManager = new DifficultyManager(this);

// Worm respawn timer
this.wormRespawnTimer = this.time.addEvent({
    delay: 10000, // Every 10 seconds
    callback: this.attemptWormRespawn,
    callbackScope: this,
    loop: true
});

// Add method:
attemptWormRespawn() {
    const occupiedPoints = new Set();
    this.worms.getChildren().forEach(worm => {
        // Track which spawn points have worms
        const key = `${Math.round(worm.x)},${Math.round(worm.y)}`;
        occupiedPoints.add(key);
    });

    for (const point of this.nestData.wormSpawnPoints) {
        const key = `${Math.round(point.x)},${Math.round(point.y)}`;
        if (occupiedPoints.has(key)) continue;

        // Chance to respawn
        if (Math.random() < this.difficultyManager.wormRespawnChance) {
            const worm = new Worm(this, point.x, point.y);
            this.worms.add(worm);
        }
    }
}

showDifficultyIncrease() {
    const text = this.add.text(
        this.cameras.main.width / 2,
        100,
        'DIFFICULTY INCREASED!',
        { fontSize: '24px', fill: '#ff0000', fontStyle: 'bold' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.tweens.add({
        targets: text,
        alpha: 0,
        y: text.y - 30,
        duration: 2000,
        onComplete: () => text.destroy()
    });
}

// In update():
this.difficultyManager.update(delta);

// Update UI to show score
this.uiText.setText([
    `Time: ${this.difficultyManager.getFormattedScore()}`,
    `Worms Carried: ${this.wasp.wormsCarried}`,
    `Queen Hunger: ${this.queen.hunger.toFixed(1)}%`,
    `Difficulty: ${this.difficultyManager.getDifficultyLevel()}`
]);

// In gameOver():
gameOver() {
    const finalScore = this.difficultyManager.getScore();
    this.scene.start('GameOverScene', {
        score: finalScore,
        formattedScore: this.difficultyManager.getFormattedScore(),
        reason: 'starved'
    });
}
```

### js/scenes/GameOverScene.js (Complete)
```javascript
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.formattedScore = data.formattedScore || '00:00';
        this.reason = data.reason || 'unknown';
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Dark overlay
        this.add.rectangle(centerX, centerY, 800, 600, 0x000000, 0.8);

        // Game Over title
        this.add.text(centerX, centerY - 120, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Death reason
        let reasonText = 'The Queen starved!';
        if (this.reason === 'starved') {
            reasonText = 'The Queen starved!';
        }
        this.add.text(centerX, centerY - 50, reasonText, {
            fontSize: '24px',
            fill: '#ffaaaa'
        }).setOrigin(0.5);

        // Score display
        this.add.text(centerX, centerY + 20, 'Time Survived:', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 60, this.formattedScore, {
            fontSize: '48px',
            fill: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // High score check
        this.checkHighScore();

        // Restart instruction
        const restartText = this.add.text(centerX, centerY + 140, 'Press SPACE to play again', {
            fontSize: '20px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Pulsing animation on restart text
        this.tweens.add({
            targets: restartText,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Input handling
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('PlayScene');
        });

        // Also allow click to restart
        this.input.once('pointerdown', () => {
            this.scene.start('PlayScene');
        });
    }

    checkHighScore() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Get stored high score
        const storedHighScore = localStorage.getItem('waspGameHighScore');
        const highScore = storedHighScore ? parseInt(storedHighScore) : 0;

        if (this.finalScore > highScore) {
            // New high score!
            localStorage.setItem('waspGameHighScore', this.finalScore.toString());

            this.add.text(centerX, centerY + 100, 'NEW HIGH SCORE!', {
                fontSize: '24px',
                fill: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        } else if (highScore > 0) {
            // Show existing high score
            const highScoreMinutes = Math.floor(highScore / 60);
            const highScoreSeconds = highScore % 60;
            const formatted = `${highScoreMinutes.toString().padStart(2, '0')}:${highScoreSeconds.toString().padStart(2, '0')}`;

            this.add.text(centerX, centerY + 100, `High Score: ${formatted}`, {
                fontSize: '18px',
                fill: '#888888'
            }).setOrigin(0.5);
        }
    }
}
```

## Manual Test Steps

1. **Verify score tracking:**
   - Start game, observe timer in UI
   - Should increment every second
   - Format should be "Time: MM:SS"

2. **Test difficulty increase (first at 45s):**
   - Survive until 0:45
   - "DIFFICULTY INCREASED!" text should appear
   - Check UI: Difficulty should show "1"

3. **Verify hunger drain increase:**
   - Before difficulty increase: hunger drops slowly
   - After: hunger drops noticeably faster
   - Multiple increases should be more dramatic

4. **Test hornet spawning:**
   - Count hornets at start (via console or observation)
   - After difficulty increase, new hornet should appear
   - Verify new hornet patrols normally

5. **Test worm respawning:**
   - Collect all worms in a room
   - Wait ~10-20 seconds
   - Some worms should respawn at empty spawn points

6. **Test game over screen:**
   - Let queen die
   - Should see: "GAME OVER", "The Queen starved!", time survived
   - Score should match time played

7. **Test high score:**
   - Play first game, note score
   - Die, should see "NEW HIGH SCORE!"
   - Play again, score less
   - Should see "High Score: XX:XX" (previous)

8. **Test restart:**
   - On game over screen, press SPACE
   - Should start new game
   - Score should reset to 00:00

## Automated Test Specs

### Unit Tests (DifficultyManager.js)

```javascript
// tests/systems/DifficultyManager.test.js
import { DifficultyManager } from '../js/systems/DifficultyManager.js';
import { CONFIG } from '../js/config.js';

describe('DifficultyManager', () => {
    let manager;
    let mockScene;

    beforeEach(() => {
        mockScene = createMockSceneWithQueen();
        manager = new DifficultyManager(mockScene);
    });

    describe('time tracking', () => {
        test('tracks elapsed time', () => {
            manager.update(1000);
            expect(manager.elapsedTime).toBe(1000);
        });

        test('getScore returns seconds', () => {
            manager.elapsedTime = 5500;
            expect(manager.getScore()).toBe(5);
        });

        test('getFormattedScore formats correctly', () => {
            manager.elapsedTime = 125000; // 2:05
            expect(manager.getFormattedScore()).toBe('02:05');
        });
    });

    describe('difficulty scaling', () => {
        test('increases at interval', () => {
            manager.update(CONFIG.DIFFICULTY_INTERVAL + 1);
            expect(manager.difficultyLevel).toBe(1);
        });

        test('increases multiple times', () => {
            manager.update(CONFIG.DIFFICULTY_INTERVAL * 3 + 1);
            expect(manager.difficultyLevel).toBe(3);
        });

        test('reduces worm respawn chance', () => {
            const initial = manager.wormRespawnChance;
            manager.increaseDifficulty();
            expect(manager.wormRespawnChance).toBeLessThan(initial);
        });

        test('respects minimum respawn chance', () => {
            for (let i = 0; i < 10; i++) {
                manager.increaseDifficulty();
            }
            expect(manager.wormRespawnChance).toBeGreaterThanOrEqual(0.2);
        });
    });
});
```

### Integration Test Spec

```javascript
describe('Difficulty Integration', () => {
    test('queen hunger drain increases with difficulty', async () => {
        // Start game
        // Record initial hunger drain rate
        // Advance time past DIFFICULTY_INTERVAL
        // Verify drain rate increased
    });

    test('new hornets spawn on difficulty increase', async () => {
        // Count initial hornets
        // Advance time past DIFFICULTY_INTERVAL
        // Verify hornet count increased
    });

    test('game over passes correct score', async () => {
        // Play for known duration
        // Trigger game over
        // Verify GameOverScene receives correct score
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Verify initial state:**
   - Navigate to `http://localhost:8080`
   - Wait 3 seconds
   - Execute: `scene.difficultyManager.getScore()` should be ~3
   - Execute: `scene.difficultyManager.getDifficultyLevel()` should be 0

2. **Test score display:**
   - Take screenshot
   - Verify "Time: 00:XX" visible in UI
   - Time should be incrementing

3. **Fast-forward to difficulty increase (testing only):**
   ```javascript
   const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
   scene.difficultyManager.elapsedTime = 44000; // Almost 45s
   ```
   - Wait 2 seconds
   - Execute: `scene.difficultyManager.getDifficultyLevel()` should be 1
   - Screenshot: should show "DIFFICULTY INCREASED!" text

4. **Verify hunger drain increased:**
   ```javascript
   scene.queen.drainRate // Should be > CONFIG.QUEEN_HUNGER_DRAIN
   ```

5. **Verify hornet count increased:**
   - Store initial: `const initial = scene.hornets.getLength()`
   - After difficulty: count should be `initial + 1`

6. **Test game over:**
   - Execute: `scene.queen.hunger = 0`
   - Wait for scene transition
   - Execute: `game.scene.isActive('GameOverScene')` should be true

7. **Verify game over screen:**
   - Take screenshot
   - Should show: "GAME OVER", score, restart prompt

8. **Test restart:**
   - Execute: `game.scene.getScene('GameOverScene').scene.start('PlayScene')`
   - Verify new game starts
   - Execute: `scene.difficultyManager.getScore()` should be 0

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 6.1 | Score tracks time | getScore() matches elapsed seconds | Score incorrect |
| 6.2 | Score displays | "Time: MM:SS" visible in UI | No score display |
| 6.3 | Difficulty increases | Level increments at 45s intervals | No increase or wrong timing |
| 6.4 | Hunger drain increases | queen.drainRate > initial after difficulty up | No drain increase |
| 6.5 | Hornets spawn | Hornet count increases on difficulty up | No new hornets |
| 6.6 | Hornet cap respected | Never more than 20 hornets | Exceeds 20 |
| 6.7 | Worm respawn works | Empty spawn points can respawn worms | No respawning |
| 6.8 | Respawn chance decreases | wormRespawnChance lower after difficulty | Chance doesn't decrease |
| 6.9 | Game over shows score | Final score displayed matches play time | Wrong score |
| 6.10 | High score saves | New high score persists in localStorage | Not saved |
| 6.11 | Restart works | SPACE key starts new game from GameOver | Restart fails |
| 6.12 | New game resets | Score, difficulty, hunger all reset | State carries over |

### Verification Commands

```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Check score
scene.difficultyManager.getScore()

// Check difficulty level
scene.difficultyManager.getDifficultyLevel()

// Check queen drain rate
scene.queen.drainRate

// Check hornet count
scene.hornets.getLength()

// Check worm respawn chance
scene.difficultyManager.wormRespawnChance

// Force difficulty increase
scene.difficultyManager.increaseDifficulty()

// Check high score in localStorage
localStorage.getItem('waspGameHighScore')

// Verify game over scene
game.scene.isActive('GameOverScene')
```
