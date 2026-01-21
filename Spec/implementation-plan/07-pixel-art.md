# Phase 7: Pixel Art Sprites

## Objectives

- Replace placeholder colored squares with pixel art sprites
- Create sprite sheets for animated entities
- Design cohesive visual style (retro pixel art)
- Integrate sprites into existing game code

## Implementation Details

### 7.1 Sprite Specifications

All sprites use the 16-32-64px scale system. Colors should be warm amber/honey tones for the nest, with entities having distinct color profiles.

### 7.2 Wasp Sprite (32x32)

**Design:**
- Yellow body with black stripes (2-3 stripes)
- Translucent wings (lighter pixels on sides)
- Small black head with two antennae
- Visible stinger at rear
- Top-down view (looking straight down)

**Animation Frames:**
1. Wings up
2. Wings middle
3. Wings down
4. Wings middle (mirror)

**Frame rate:** 10 FPS for wing flutter

**Color Palette:**
- Body yellow: #FFD700
- Stripes black: #1A1A1A
- Wings: #FFFFFF (50% opacity or dithered)
- Head: #2D2D2D
- Stinger: #4A4A4A

### 7.3 Queen Sprite (64x64)

**Design:**
- Larger, rounder body than wasp
- Same yellow/black striping but more segments
- Crown marking on head (golden/orange)
- Regal posture - centered, symmetrical
- Optional: small throne/honeycomb seat beneath

**Animation Frames:**
1. Idle breathing 1 (slightly smaller)
2. Idle breathing 2 (normal)
3. Idle breathing 3 (slightly larger)
4. Idle breathing 2 (back to normal)

**Frame rate:** 2 FPS for subtle breathing

**Color Palette:**
- Same as wasp, plus:
- Crown: #FFA500 (orange)
- Throne: #8B4513 (saddle brown)

### 7.4 Hornet Sprite (32x32)

**Design:**
- Brown/orange body (distinct from yellow wasp)
- Angrier expression (angled eyes/markings)
- Larger mandibles visible
- Similar wing style to wasp
- More aggressive posture

**Animation Frames:**
1. Wings up (patrol)
2. Wings down (patrol)
3. Chase frame 1 (leaning forward)
4. Chase frame 2 (leaning forward, wings back)

**Frame rate:** 12 FPS

**Color Palette:**
- Body: #D2691E (chocolate)
- Stripes: #8B4513 (saddle brown)
- Eyes: #FF0000 (red accents)
- Wings: #FFFFFF (dithered)

### 7.5 Worm Sprite (16x16)

**Design:**
- Pink/pale segmented body
- 3-4 visible segments
- Small dot eyes on front segment
- Curvy S-shape

**Animation Frames:**
1. Curve left
2. Straight
3. Curve right
4. Straight

**Frame rate:** 4 FPS for wiggle

**Color Palette:**
- Body: #FFB6C1 (light pink)
- Segments: #FF69B4 (hot pink for lines)
- Eyes: #000000

### 7.6 Tile Sprites (16x16)

**Wall Tile:**
- Honeycomb hexagon pattern
- Amber/brown color
- 3D depth illusion (lighter top-left, darker bottom-right)
- Seamless tiling

**Floor Tile:**
- Darker honeycomb pattern
- Less pronounced hexagons
- More muted color
- Seamless tiling

**Color Palette:**
- Wall light: #DAA520 (goldenrod)
- Wall dark: #8B4513 (saddle brown)
- Wall edge: #654321 (dark brown)
- Floor: #2D1F1F (very dark brown)
- Floor pattern: #3D2F2F (slightly lighter)

## Files to Create

| File | Size | Frames | Purpose |
|------|------|--------|---------|
| `assets/sprites/wasp.png` | 128x32 | 4 | Player sprite sheet |
| `assets/sprites/queen.png` | 256x64 | 4 | Queen sprite sheet |
| `assets/sprites/hornet.png` | 128x32 | 4 | Enemy sprite sheet |
| `assets/sprites/worm.png` | 64x16 | 4 | Collectible sprite sheet |
| `assets/sprites/wall.png` | 16x16 | 1 | Wall tile |
| `assets/sprites/floor.png` | 16x16 | 1 | Floor tile |

## Code Modifications

### js/scenes/BootScene.js (Asset Loading)
```javascript
preload() {
    // Load sprite sheets
    this.load.spritesheet('wasp', 'assets/sprites/wasp.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    this.load.spritesheet('queen', 'assets/sprites/queen.png', {
        frameWidth: 64,
        frameHeight: 64
    });

    this.load.spritesheet('hornet', 'assets/sprites/hornet.png', {
        frameWidth: 32,
        frameHeight: 32
    });

    this.load.spritesheet('worm', 'assets/sprites/worm.png', {
        frameWidth: 16,
        frameHeight: 16
    });

    // Load tiles
    this.load.image('wall', 'assets/sprites/wall.png');
    this.load.image('floor', 'assets/sprites/floor.png');
}

create() {
    // Create animations
    this.createAnimations();
    this.scene.start('PlayScene');
}

createAnimations() {
    // Wasp flying animation
    this.anims.create({
        key: 'wasp-fly',
        frames: this.anims.generateFrameNumbers('wasp', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // Queen breathing animation
    this.anims.create({
        key: 'queen-idle',
        frames: this.anims.generateFrameNumbers('queen', { start: 0, end: 3 }),
        frameRate: 2,
        repeat: -1
    });

    // Hornet patrol animation
    this.anims.create({
        key: 'hornet-patrol',
        frames: this.anims.generateFrameNumbers('hornet', { start: 0, end: 1 }),
        frameRate: 8,
        repeat: -1
    });

    // Hornet chase animation
    this.anims.create({
        key: 'hornet-chase',
        frames: this.anims.generateFrameNumbers('hornet', { start: 2, end: 3 }),
        frameRate: 12,
        repeat: -1
    });

    // Worm wiggle animation
    this.anims.create({
        key: 'worm-wiggle',
        frames: this.anims.generateFrameNumbers('worm', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
    });
}
```

### Entity Animation Integration

**Wasp.js:**
```javascript
constructor(scene, x, y) {
    super(scene, x, y, 'wasp');
    // ... existing code ...
    this.play('wasp-fly');
}
```

**Queen.js:**
```javascript
constructor(scene, x, y) {
    super(scene, x, y, 'queen');
    // ... existing code ...
    this.play('queen-idle');
}
```

**Hornet.js:**
```javascript
startPatrol() {
    this.state = State.PATROL;
    this.play('hornet-patrol');
    // ... existing code ...
}

startChase() {
    this.state = State.CHASE;
    this.play('hornet-chase');
    // ... existing code ...
}
```

**Worm.js:**
```javascript
constructor(scene, x, y) {
    super(scene, x, y, 'worm');
    // ... existing code ...
    this.play('worm-wiggle');
}
```

## Sprite Creation Workflow

For each sprite, the following process will be used:

1. **Design Description** - Detailed specification provided to artist/generator
2. **Initial Draft** - First version created
3. **User Review** - User approves or requests changes
4. **Iteration** - Adjustments made based on feedback
5. **Integration** - Sprite added to game and tested

## Manual Test Steps

1. **Verify sprites load:**
   - Start game
   - All entities should display pixel art (not colored squares)
   - No "missing texture" errors

2. **Test wasp animation:**
   - Observe wasp sprite
   - Wings should visibly flutter
   - Animation should loop smoothly

3. **Test queen animation:**
   - Observe queen sprite
   - Subtle breathing/pulsing visible
   - Crown marking visible

4. **Test hornet animations:**
   - Observe patrolling hornet
   - Wings flutter in patrol
   - When chasing, animation should change (more aggressive)

5. **Test worm animation:**
   - Observe worm sprites
   - Wiggling motion visible
   - Pink color distinct

6. **Test tiles:**
   - Walls should show honeycomb pattern
   - Floors should be darker
   - No obvious seams between tiles

7. **Visual coherence:**
   - All sprites should feel like same art style
   - Colors should be harmonious
   - No jarring visual mismatches

## Automated Test Specs

### Asset Loading Tests

```javascript
// tests/assets.test.js
describe('Asset Loading', () => {
    test('all sprite sheets exist', () => {
        const assets = [
            'assets/sprites/wasp.png',
            'assets/sprites/queen.png',
            'assets/sprites/hornet.png',
            'assets/sprites/worm.png',
            'assets/sprites/wall.png',
            'assets/sprites/floor.png'
        ];

        for (const asset of assets) {
            expect(fileExists(asset)).toBe(true);
        }
    });

    test('sprite sheet dimensions correct', () => {
        // wasp: 128x32 (4 frames of 32x32)
        expect(getImageDimensions('wasp.png')).toEqual({ width: 128, height: 32 });

        // queen: 256x64 (4 frames of 64x64)
        expect(getImageDimensions('queen.png')).toEqual({ width: 256, height: 64 });
    });
});
```

### Animation Tests

```javascript
describe('Animations', () => {
    test('wasp-fly animation exists', () => {
        const scene = game.scene.scenes[0];
        expect(scene.anims.exists('wasp-fly')).toBe(true);
    });

    test('wasp-fly has 4 frames', () => {
        const anim = game.anims.get('wasp-fly');
        expect(anim.frames.length).toBe(4);
    });

    test('hornet has patrol and chase animations', () => {
        expect(game.anims.exists('hornet-patrol')).toBe(true);
        expect(game.anims.exists('hornet-chase')).toBe(true);
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Navigate and check for sprite errors:**
   - Navigate to `http://localhost:8080`
   - Use `mcp__claude-in-chrome__read_console_messages` with pattern `error|failed|missing`
   - Should return no results about missing textures

2. **Take screenshot and visually verify:**
   - Take full screenshot
   - Verify wasp is pixel art (not solid yellow square)
   - Verify floor/walls have honeycomb texture

3. **Check animation playing:**
   ```javascript
   const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
   console.log('WASP_ANIM:', scene.wasp.anims.currentAnim.key);
   ```
   - Should return 'wasp-fly'

4. **Navigate to see other entities:**
   - Move to find hornet
   - Screenshot: verify hornet is pixel art with brown/orange coloring
   - Move to find worm
   - Screenshot: verify worm is pink pixel art

5. **Verify animation state changes:**
   - Approach hornet to trigger chase
   - Execute: `scene.hornets.getChildren()[0].anims.currentAnim.key`
   - Should be 'hornet-chase' during chase

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 7.1 | Wasp sprite loads | Wasp displays pixel art, not placeholder | Colored square or missing texture |
| 7.2 | Queen sprite loads | Queen displays pixel art 64x64 | Placeholder or wrong size |
| 7.3 | Hornet sprite loads | Hornet displays pixel art, brown/orange | Placeholder or wrong color |
| 7.4 | Worm sprite loads | Worm displays pixel art, pink | Placeholder or wrong color |
| 7.5 | Wall tiles load | Walls show honeycomb pattern | Solid color |
| 7.6 | Floor tiles load | Floors show darker pattern | Solid color or same as walls |
| 7.7 | Wasp animation plays | Wings visibly flutter | Static sprite |
| 7.8 | Queen animation plays | Subtle breathing visible | Static sprite |
| 7.9 | Hornet animation changes | Different animation in chase vs patrol | Same animation always |
| 7.10 | Worm animation plays | Wiggling motion visible | Static sprite |
| 7.11 | No loading errors | Console has no texture/load errors | Any asset loading error |
| 7.12 | Visual consistency | All sprites appear to be same art style | Mismatched styles |

### Verification Commands

```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Check wasp texture is not placeholder
scene.wasp.texture.key === 'wasp'

// Check wasp animation
scene.wasp.anims.isPlaying && scene.wasp.anims.currentAnim.key === 'wasp-fly'

// Check queen animation
scene.queen.anims.isPlaying && scene.queen.anims.currentAnim.key === 'queen-idle'

// Check animation registry
game.anims.exists('wasp-fly') && game.anims.exists('queen-idle') &&
game.anims.exists('hornet-patrol') && game.anims.exists('worm-wiggle')

// Check sprite frame counts
game.anims.get('wasp-fly').frames.length === 4
```

## Sprite Design References

### Wasp Reference Layout (32x32, 4 frames)
```
Frame 1 (Wings Up):
    ░░████░░
    ░█▓▓▓▓█░
    █▓█▓▓█▓█  <- wings extended up
    █▓▓▓▓▓▓█
    ░█▓▓▓▓█░
    ░░█▓▓█░░
    ░░░██░░░  <- stinger

(Yellow ▓, Black █, Wings ░)
```

### Color Reference Table

| Entity | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| Wasp | #FFD700 | #1A1A1A | #FFFFFF |
| Queen | #FFD700 | #1A1A1A | #FFA500 |
| Hornet | #D2691E | #8B4513 | #FF0000 |
| Worm | #FFB6C1 | #FF69B4 | #000000 |
| Wall | #DAA520 | #8B4513 | #654321 |
| Floor | #2D1F1F | #3D2F2F | - |
