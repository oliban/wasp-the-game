# Phase 5: Hornets (Enemies)

## Objectives

- Create Hornet enemy entity with AI states
- Implement patrol, chase, and return behaviors
- Handle collision with wasp (drop worms, invincibility frames)
- Spawn hornets in rooms based on depth from queen

## Implementation Details

### 5.1 Hornet Entity

Create `js/entities/Hornet.js` that:
- Extends Phaser.Physics.Arcade.Sprite
- Has finite state machine: PATROL, CHASE, RETURN
- Tracks home position and patrol bounds
- Moves at configurable speed per state

### 5.2 AI States

**PATROL State:**
- Move back and forth within assigned room
- Random patrol direction (horizontal or vertical)
- Reverse direction at room boundaries
- Patrol speed: 80 px/sec

**CHASE State:**
- Triggered when wasp enters detection range (150 pixels)
- Move directly toward wasp position
- Chase speed: 120 px/sec (faster than patrol, slower than max wasp speed)
- Exit chase if wasp leaves room or chase timer expires (5 seconds)

**RETURN State:**
- Move back to home position after chase ends
- Return speed: 100 px/sec
- Transition to PATROL when near home position

### 5.3 Detection System

- Use distance check each frame
- Detection radius: 150 pixels
- Only detect if wasp is in same room (check room bounds)
- Line-of-sight not required for v1 (simplify)

### 5.4 Collision Handling

When wasp collides with hornet:
- Wasp drops ALL carried worms (scattered nearby)
- Wasp gets 1.5 seconds invincibility (flashing effect)
- Hornet returns to patrol state
- Dropped worms can be re-collected

### 5.5 Worm Scattering

When worms are dropped:
- Create new Worm entities at wasp position
- Apply random velocity to scatter them
- Worms settle after 0.5 seconds (stop moving)
- Worms remain collectible

### 5.6 Hornet Spawning

- Spawn 1-2 hornets per room (not queen's chamber)
- Hornet count based on room depth: `Math.min(depth, 2)`
- Spawn at room center with random patrol direction

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `js/entities/Hornet.js` | Create | Enemy AI with state machine |
| `js/entities/Wasp.js` | Modify | Add invincibility system |
| `js/scenes/PlayScene.js` | Modify | Spawn hornets, handle collision |

## Code Examples

### js/entities/Hornet.js
```javascript
import { CONFIG } from '../config.js';

const State = {
    PATROL: 'patrol',
    CHASE: 'chase',
    RETURN: 'return'
};

export class Hornet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, room) {
        super(scene, x, y, 'hornet');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Home and room reference
        this.homeX = x;
        this.homeY = y;
        this.room = room;

        // State machine
        this.state = State.PATROL;
        this.stateTimer = 0;

        // Patrol config
        this.patrolDirection = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        this.patrolVelocity = 80;
        this.patrolDir = 1; // 1 or -1

        // Chase config
        this.chaseSpeed = 120;
        this.detectionRange = 150;
        this.maxChaseTime = 5000; // 5 seconds
        this.chaseTimer = 0;

        // Return config
        this.returnSpeed = 100;

        // Target (wasp reference, set by scene)
        this.target = null;

        // Start patrol
        this.startPatrol();
    }

    setTarget(wasp) {
        this.target = wasp;
    }

    update(time, delta) {
        switch (this.state) {
            case State.PATROL:
                this.updatePatrol(delta);
                break;
            case State.CHASE:
                this.updateChase(delta);
                break;
            case State.RETURN:
                this.updateReturn(delta);
                break;
        }
    }

    startPatrol() {
        this.state = State.PATROL;
        if (this.patrolDirection === 'horizontal') {
            this.body.setVelocity(this.patrolVelocity * this.patrolDir, 0);
        } else {
            this.body.setVelocity(0, this.patrolVelocity * this.patrolDir);
        }
    }

    updatePatrol(delta) {
        // Check room boundaries
        const padding = 20;
        if (this.patrolDirection === 'horizontal') {
            if (this.x <= this.room.x + padding || this.x >= this.room.x + this.room.width - padding) {
                this.patrolDir *= -1;
                this.body.setVelocityX(this.patrolVelocity * this.patrolDir);
            }
        } else {
            if (this.y <= this.room.y + padding || this.y >= this.room.y + this.room.height - padding) {
                this.patrolDir *= -1;
                this.body.setVelocityY(this.patrolVelocity * this.patrolDir);
            }
        }

        // Check for target in range
        if (this.target && this.canDetectTarget()) {
            this.startChase();
        }
    }

    canDetectTarget() {
        if (!this.target) return false;

        // Distance check
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (dist > this.detectionRange) return false;

        // Check if target is in same room
        const inRoom = this.target.x >= this.room.x &&
                       this.target.x <= this.room.x + this.room.width &&
                       this.target.y >= this.room.y &&
                       this.target.y <= this.room.y + this.room.height;

        return inRoom;
    }

    startChase() {
        this.state = State.CHASE;
        this.chaseTimer = 0;
        console.log('Hornet starting chase!');
    }

    updateChase(delta) {
        this.chaseTimer += delta;

        // Chase timeout
        if (this.chaseTimer >= this.maxChaseTime) {
            this.startReturn();
            return;
        }

        // Target left room
        if (!this.canDetectTarget()) {
            this.startReturn();
            return;
        }

        // Move toward target
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.body.setVelocity(
            Math.cos(angle) * this.chaseSpeed,
            Math.sin(angle) * this.chaseSpeed
        );
    }

    startReturn() {
        this.state = State.RETURN;
        console.log('Hornet returning to patrol');
    }

    updateReturn(delta) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY);

        if (dist < 10) {
            this.x = this.homeX;
            this.y = this.homeY;
            this.startPatrol();
            return;
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        this.body.setVelocity(
            Math.cos(angle) * this.returnSpeed,
            Math.sin(angle) * this.returnSpeed
        );
    }

    // Called when hornet hits wasp
    onHitWasp() {
        this.startReturn();
    }
}
```

### js/entities/Wasp.js (Add Invincibility)
```javascript
// Add to Wasp class:

constructor(scene, x, y) {
    // ... existing code ...

    // Invincibility
    this.invincible = false;
    this.invincibilityDuration = 1500; // 1.5 seconds
}

makeInvincible() {
    if (this.invincible) return;

    this.invincible = true;

    // Flashing effect
    this.flashTween = this.scene.tweens.add({
        targets: this,
        alpha: { from: 1, to: 0.3 },
        duration: 100,
        yoyo: true,
        repeat: 7 // ~1.5 seconds
    });

    // End invincibility after duration
    this.scene.time.delayedCall(this.invincibilityDuration, () => {
        this.invincible = false;
        this.alpha = 1;
        if (this.flashTween) {
            this.flashTween.stop();
        }
    });
}

isInvincible() {
    return this.invincible;
}
```

### js/scenes/PlayScene.js (Hornet Integration)
```javascript
import { Hornet } from '../entities/Hornet.js';

// In create():
this.hornets = this.physics.add.group();
this.spawnHornets();

// Hornet-wasp collision
this.physics.add.overlap(this.wasp, this.hornets, this.hornetHitWasp, null, this);

// Hornet-wall collision
this.physics.add.collider(this.hornets, this.nestData.wallLayer);

// Add methods:
spawnHornets() {
    for (const room of this.nestData.rooms) {
        // Skip queen's chamber
        if (room.type === 'queen') continue;
        // Skip corridors
        if (room.type === 'corridor') continue;

        // Spawn based on depth (1-2 hornets)
        const hornetCount = Math.min(room.depth, 2);
        for (let i = 0; i < hornetCount; i++) {
            const offsetX = (Math.random() - 0.5) * room.width * 0.5;
            const offsetY = (Math.random() - 0.5) * room.height * 0.5;
            const hornet = new Hornet(
                this,
                room.centerX + offsetX,
                room.centerY + offsetY,
                room
            );
            hornet.setTarget(this.wasp);
            this.hornets.add(hornet);
        }
    }
    console.log('Spawned', this.hornets.getLength(), 'hornets');
}

hornetHitWasp(wasp, hornet) {
    // Skip if invincible
    if (wasp.isInvincible()) return;

    // Drop worms
    const droppedCount = wasp.dropAllWorms();
    if (droppedCount > 0) {
        this.scatterWorms(wasp.x, wasp.y, droppedCount);
    }

    // Make wasp invincible
    wasp.makeInvincible();

    // Hornet returns to patrol
    hornet.onHitWasp();

    console.log('Hit by hornet! Dropped', droppedCount, 'worms');
}

scatterWorms(x, y, count) {
    for (let i = 0; i < count; i++) {
        const worm = new Worm(this, x, y);
        this.worms.add(worm);

        // Random scatter velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        worm.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Stop after settling
        this.time.delayedCall(500, () => {
            if (worm.body) {
                worm.body.setVelocity(0, 0);
            }
        });
    }
}

// In update():
this.hornets.getChildren().forEach(hornet => {
    hornet.update(time, delta);
});
```

## Manual Test Steps

1. **Verify hornets spawn:**
   - Navigate away from queen's chamber
   - Orange hornet sprites should appear in rooms
   - No hornets in queen's chamber

2. **Test patrol behavior:**
   - Observe hornet from distance
   - Should move back and forth
   - Reverses at room boundaries

3. **Test detection and chase:**
   - Enter a room with a hornet
   - When close (~150px), hornet should turn and chase
   - Hornet moves toward wasp

4. **Test chase timeout:**
   - Let hornet chase for 5+ seconds
   - Hornet should give up and return

5. **Test room boundary chase:**
   - Lead hornet to room exit
   - Leave the room
   - Hornet should stop chasing and return

6. **Test collision and worm drop:**
   - Collect some worms (3+)
   - Intentionally get hit by hornet
   - Worms should scatter around
   - Wasp should flash (invincibility)
   - "Worms Carried" should go to 0

7. **Test invincibility:**
   - After getting hit, immediately touch hornet again
   - Should NOT drop worms while flashing
   - After ~1.5 seconds, become vulnerable again

8. **Test worm re-collection:**
   - After dropping worms, collect them again
   - Scattered worms should be collectible

## Automated Test Specs

### Unit Tests (Hornet.js)

```javascript
// tests/entities/Hornet.test.js
import { Hornet, State } from '../js/entities/Hornet.js';

describe('Hornet', () => {
    let hornet;
    let mockScene;
    let mockRoom;

    beforeEach(() => {
        mockScene = createMockScene();
        mockRoom = { x: 0, y: 0, width: 300, height: 300, centerX: 150, centerY: 150 };
        hornet = new Hornet(mockScene, 150, 150, mockRoom);
    });

    describe('patrol state', () => {
        test('starts in patrol state', () => {
            expect(hornet.state).toBe('patrol');
        });

        test('reverses at room boundary', () => {
            hornet.patrolDirection = 'horizontal';
            hornet.patrolDir = 1;
            hornet.x = mockRoom.x + mockRoom.width - 10; // Near right edge
            hornet.updatePatrol(16);
            expect(hornet.patrolDir).toBe(-1);
        });
    });

    describe('chase state', () => {
        test('transitions to chase when target in range', () => {
            const mockWasp = { x: 160, y: 160 }; // Very close
            hornet.setTarget(mockWasp);
            hornet.updatePatrol(16);
            expect(hornet.state).toBe('chase');
        });

        test('does not chase if target outside room', () => {
            const mockWasp = { x: 500, y: 500 }; // Outside room
            hornet.setTarget(mockWasp);
            hornet.updatePatrol(16);
            expect(hornet.state).toBe('patrol');
        });

        test('returns after chase timeout', () => {
            hornet.state = 'chase';
            hornet.chaseTimer = 6000; // Past max
            hornet.updateChase(16);
            expect(hornet.state).toBe('return');
        });
    });

    describe('return state', () => {
        test('transitions to patrol when reaching home', () => {
            hornet.state = 'return';
            hornet.x = hornet.homeX;
            hornet.y = hornet.homeY;
            hornet.updateReturn(16);
            expect(hornet.state).toBe('patrol');
        });
    });
});
```

```javascript
// tests/entities/Wasp.test.js (additions)
describe('Wasp invincibility', () => {
    test('makeInvincible sets invincible flag', () => {
        wasp.makeInvincible();
        expect(wasp.isInvincible()).toBe(true);
    });

    test('invincibility expires after duration', async () => {
        wasp.makeInvincible();
        await wait(1600); // > 1500ms duration
        expect(wasp.isInvincible()).toBe(false);
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Navigate and verify hornets spawn:**
   - Navigate to `http://localhost:8080`
   - Wait 3 seconds
   - Execute JS to check hornet count:
   ```javascript
   const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
   console.log('HORNET_COUNT:', scene.hornets.getLength());
   ```
   - Should be > 0

2. **Navigate to find hornet:**
   - Use arrow keys to explore
   - Take screenshots until orange hornet visible
   - Note hornet's patrol movement

3. **Test chase behavior:**
   - Move close to hornet
   - Take screenshot showing chase (hornet moving toward wasp)
   - Execute: `scene.hornets.getChildren()[0].state` should be 'chase'

4. **Test collision:**
   - First collect worms: navigate to room with worms
   - Execute: verify `scene.wasp.wormsCarried > 0`
   - Navigate to hornet and collide
   - Execute: `scene.wasp.wormsCarried` should be 0
   - Execute: `scene.wasp.isInvincible()` should be true

5. **Test invincibility:**
   - While still invincible, touch hornet again
   - Take screenshot (wasp should be flashing)
   - Execute: `scene.wasp.wormsCarried` still 0 (no double-drop)

6. **Test scattered worms:**
   - After collision, check `scene.worms.getLength()` increased
   - Worms should be visible near collision point

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 5.1 | Hornets spawn | At least 1 hornet in non-queen rooms | No hornets |
| 5.2 | No hornets in queen room | Zero hornets with room.type === 'queen' | Hornet in queen room |
| 5.3 | Patrol works | Hornet moves back/forth in room | Hornet stationary or leaves room |
| 5.4 | Chase triggers | State changes to 'chase' when wasp within 150px | No chase on proximity |
| 5.5 | Chase toward wasp | Hornet velocity points at wasp position | Wrong direction |
| 5.6 | Chase timeout | State changes to 'return' after 5s chase | Infinite chase |
| 5.7 | Room boundary chase end | Chase stops when wasp leaves room | Chase continues outside room |
| 5.8 | Collision drops worms | wormsCarried becomes 0 on hit | Worms not dropped |
| 5.9 | Worms scatter | New worm entities created at wasp position | No scattered worms |
| 5.10 | Invincibility activates | isInvincible() returns true after hit | No invincibility |
| 5.11 | Invincibility prevents damage | Second hit during invincibility does nothing | Double damage |
| 5.12 | Invincibility expires | isInvincible() false after ~1.5 seconds | Permanent invincibility |
| 5.13 | Scattered worms collectible | Can pick up dropped worms | Cannot collect dropped worms |

### Verification Commands

```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Check hornets spawned
scene.hornets.getLength() > 0

// Check no hornets in queen room
const queenRoom = scene.nestData.queenRoom;
scene.hornets.getChildren().every(h => h.room.id !== queenRoom.id)

// Check hornet state
scene.hornets.getChildren()[0].state // 'patrol', 'chase', or 'return'

// Check invincibility
scene.wasp.isInvincible()

// Force collision test
const hornet = scene.hornets.getChildren()[0];
scene.wasp.addWorm(); scene.wasp.addWorm(); // Add test worms
scene.wasp.x = hornet.x; scene.wasp.y = hornet.y; // Move to hornet
// Collision should trigger on next physics update

// Check worms dropped
scene.wasp.wormsCarried === 0
```
