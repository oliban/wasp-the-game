# Phase 8: Polish (Optional)

## Objectives

- Add sound effects and music
- Implement screen shake and visual effects
- Create particle effects
- Add title screen
- General polish and juice

**Note:** This phase is optional and can be skipped for MVP. All items are enhancements to the core gameplay.

## Implementation Details

### 8.1 Sound Effects

**Required Sounds:**

| Sound | Trigger | Description |
|-------|---------|-------------|
| `buzz.wav` | Wasp movement | Continuous buzz while moving |
| `pickup.wav` | Worm collection | Quick chirp/pop |
| `feed.wav` | Queen feeding | Satisfied gulp/crunch |
| `hit.wav` | Hornet collision | Impact/pain sound |
| `alert.wav` | Hornet spots wasp | Warning buzz |
| `heartbeat.wav` | Low hunger | Tension building |
| `gameover.wav` | Queen dies | Sad/failure sound |

**Implementation:**
```javascript
// In BootScene.preload():
this.load.audio('buzz', 'assets/sounds/buzz.wav');
this.load.audio('pickup', 'assets/sounds/pickup.wav');
// ... etc

// In Wasp update():
if (this.body.velocity.length() > 10) {
    if (!this.buzzSound.isPlaying) {
        this.buzzSound.play({ loop: true, volume: 0.3 });
    }
} else {
    this.buzzSound.stop();
}
```

### 8.2 Background Music

- Ambient hive/nature loop
- Tension music when hunger < 30%
- Cross-fade between tracks
- Volume: 0.2-0.3 (subtle background)

### 8.3 Screen Shake

**Triggers:**
- Hornet collision: medium shake (intensity: 0.01, duration: 200ms)
- Difficulty increase: subtle shake (intensity: 0.005, duration: 100ms)

**Implementation:**
```javascript
// Add to PlayScene:
shakeCamera(intensity = 0.01, duration = 200) {
    this.cameras.main.shake(duration, intensity);
}

// In hornetHitWasp():
this.shakeCamera(0.01, 200);
```

### 8.4 Particle Effects

**Worm Collection:**
- Small sparkles burst from collection point
- 5-10 particles
- Yellow/gold color
- Fade out over 300ms

**Queen Feeding:**
- Hearts or satisfaction particles
- Float upward from queen
- Pink/red color
- 3-5 particles per worm fed

**Wasp Trail (optional):**
- Subtle wing dust particles
- Very small, transparent
- Appear when moving fast

**Implementation:**
```javascript
// Create particle emitter in PlayScene:
this.collectParticles = this.add.particles(0, 0, 'particle', {
    speed: { min: 50, max: 100 },
    scale: { start: 0.5, end: 0 },
    lifespan: 300,
    blendMode: 'ADD',
    emitting: false
});

// On worm collection:
this.collectParticles.setPosition(worm.x, worm.y);
this.collectParticles.explode(8);
```

### 8.5 Title Screen

**Title Image Asset:**
Use the existing title image at `wasp-the-game.png` in the project root. This illustrated image shows:
- The wasp hero (with goggles, carrying a worm)
- The queen (with crown, on pile of food/treasure)
- Enemy hornets (angry, approaching from left)
- Honeycomb nest environment
- "WASP The Game" title text already included

**Elements:**
- Title image: `wasp-the-game.png` (full screen background)
- "Press SPACE to start" (pulsing text overlay)
- High score display (bottom of screen)

**Scene: TitleScene.js**
```javascript
export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // Load title image
        this.load.image('title-bg', 'wasp-the-game.png');
    }

    create() {
        // Title image as background (scaled to fit 800x600 canvas)
        const titleImage = this.add.image(400, 300, 'title-bg');
        titleImage.setDisplaySize(800, 600);

        // Semi-transparent overlay at bottom for text readability
        this.add.rectangle(400, 550, 800, 100, 0x000000, 0.5);

        // Start prompt
        const startText = this.add.text(400, 520, 'Press SPACE to start', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // High score
        const highScore = localStorage.getItem('waspGameHighScore') || 0;
        if (highScore > 0) {
            const mins = Math.floor(highScore / 60);
            const secs = highScore % 60;
            this.add.text(400, 565, `High Score: ${mins}:${secs.toString().padStart(2, '0')}`, {
                fontSize: '18px',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
        }

        // Input
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('PlayScene');
        });

        // Also allow click to start
        this.input.once('pointerdown', () => {
            this.scene.start('PlayScene');
        });
    }
}
```

### 8.6 UI Improvements

**Hunger Bar Enhancements:**
- Pulsing effect when < 25%
- Crack/damage overlay when < 10%
- Smooth transition between colors

**Worm Counter:**
- Small worm icons instead of just number
- Pop animation when count changes

**Score Display:**
- Retro pixel font
- Slight glow effect

### 8.7 Juice Effects

**Entity Squash & Stretch:**
- Wasp slightly squashes on direction change
- Queen pulses bigger when fed
- Worms bounce slightly when idle

**UI Feedback:**
- Numbers pop when changing
- Flash effect on important events
- Subtle hover states

## Files to Create

| File | Purpose |
|------|---------|
| `js/scenes/TitleScene.js` | Title/menu screen |
| `assets/sounds/*.wav` | Sound effect files |
| `assets/music/*.mp3` | Background music |
| `assets/sprites/particle.png` | Small particle sprite (4x4 white) |

## Existing Assets

| File | Purpose |
|------|---------|
| `wasp-the-game.png` | Title screen background image (already in project root) |

## Sound Asset Specifications

All sounds should be:
- Format: WAV or MP3
- Sample rate: 44100 Hz
- Bit depth: 16-bit
- Duration: 0.1-2 seconds (effects), 30-60 seconds (music loops)

## Manual Test Steps

1. **Test title screen:**
   - Game should start on title screen (not PlayScene)
   - Press SPACE to start game
   - High score should display if exists

2. **Test sound effects:**
   - Move wasp: hear buzzing
   - Collect worm: hear pickup sound
   - Feed queen: hear feeding sound
   - Get hit: hear impact sound

3. **Test music:**
   - Background music plays during gameplay
   - Music changes/intensifies at low hunger

4. **Test screen shake:**
   - Get hit by hornet
   - Screen should briefly shake

5. **Test particles:**
   - Collect worm: sparkles appear
   - Feed queen: hearts/particles float up

6. **Test UI polish:**
   - Hunger bar pulses when low
   - Score numbers have visual appeal

## Automated Test Specs

### Sound Loading Tests

```javascript
describe('Sound Assets', () => {
    test('all sound files load', () => {
        const sounds = ['buzz', 'pickup', 'feed', 'hit', 'alert', 'gameover'];
        for (const sound of sounds) {
            expect(game.sound.get(sound)).toBeDefined();
        }
    });
});
```

### Scene Flow Tests

```javascript
describe('Scene Flow', () => {
    test('game starts on TitleScene', () => {
        expect(game.scene.isActive('TitleScene')).toBe(true);
    });

    test('SPACE transitions to PlayScene', async () => {
        // Simulate SPACE press
        expect(game.scene.isActive('PlayScene')).toBe(true);
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Test title screen:**
   - Navigate to `http://localhost:8080`
   - Take screenshot
   - Should show title, animated wasp, start prompt
   - Execute: `game.scene.isActive('TitleScene')` should be true

2. **Test game start:**
   - Press SPACE key
   - Execute: `game.scene.isActive('PlayScene')` should be true

3. **Test sounds (if audio enabled):**
   - Move wasp
   - Check console for any audio errors
   - Note: Browser autoplay policies may block sounds until user interaction

4. **Test particles (visual):**
   - Collect a worm
   - Take screenshot during/after collection
   - Look for particle effects

5. **Test screen shake:**
   - Get hit by hornet
   - Take rapid screenshots during collision
   - Look for slight position offset (shake effect)

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 8.1 | Title screen exists | TitleScene loads first | Game starts on PlayScene |
| 8.2 | Title image displays | `wasp-the-game.png` visible as background | Missing or broken image |
| 8.3 | Start prompt visible | "Press SPACE to start" text with pulsing animation | Missing or static text |
| 8.4 | Start from title works | SPACE key or click starts PlayScene | No response or error |
| 8.5 | Sound files load | No audio loading errors in console | Loading errors |
| 8.6 | Screen shake triggers | Camera shakes on hornet hit | No shake |
| 8.7 | Particles display | Sparkles on worm collection | No particles |
| 8.8 | Music plays | Background audio audible (if unmuted) | No music or error |
| 8.9 | UI enhancements | Hunger bar pulses when low | Static UI |

### Verification Commands

```javascript
// Check title scene
game.scene.isActive('TitleScene')

// Check sound loaded
game.sound.get('pickup') !== undefined

// Check particle emitter exists
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
scene.collectParticles !== undefined

// Trigger screen shake for testing
scene.shakeCamera(0.02, 300);
```

## Priority Order

If time is limited, implement in this order:

1. **High Priority:**
   - Title screen (improves first impression)
   - Basic sound effects (pickup, hit, feed)
   - Screen shake on hit

2. **Medium Priority:**
   - Particle effects
   - Hunger bar pulsing
   - Background music

3. **Low Priority:**
   - Wasp buzz sound (can be annoying)
   - Advanced UI polish
   - Squash & stretch animations

## Notes

- All polish features should fail gracefully (game works without them)
- Sound can be muted without affecting gameplay
- Particles should be lightweight (no performance impact)
- Keep consistent with pixel art aesthetic
