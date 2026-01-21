# Wasp the Game - Testing Strategy

## Overview

Each feature should be tested through three methods:
1. **Manual verification** - Human testing steps
2. **Console verification** - JavaScript commands run in browser console
3. **Browser automation** - Claude Chrome extension testing

## Testing Environment

### Prerequisites
```bash
# Start local server
cd /Users/fredriksafsten/Workprojects/wasp-the-game
python3 -m http.server 8080

# Open game at http://localhost:8080
```

### Browser Setup
- Chrome browser with Claude extension
- Developer console open (F12)
- No cached assets (hard refresh with Cmd+Shift+R)

## Phase-by-Phase Testing

### SETUP Phase

**Acceptance Criteria:**
- [ ] Canvas renders 800x600
- [ ] No JavaScript errors in console
- [ ] Wasp placeholder visible in center
- [ ] Arrow keys log to console
- [ ] Physics body exists on wasp

**Console Verification:**
```javascript
// Canvas dimensions
document.querySelector('canvas').width === 800
document.querySelector('canvas').height === 600

// Phaser loaded
typeof Phaser !== 'undefined'

// Scene active
game.scene.isActive('PlayScene')

// Wasp has physics
game.scene.scenes.find(s => s.scene.isActive('PlayScene')).wasp.body !== null
```

### MOVE Phase

**Acceptance Criteria:**
- [ ] Wasp accelerates when holding arrow keys
- [ ] Wasp decelerates when no keys pressed
- [ ] Max velocity is capped at 200
- [ ] Diagonal movement works
- [ ] Camera follows wasp

**Console Verification:**
```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Check drag
scene.wasp.body.drag.x === 100

// Check max velocity
scene.wasp.body.maxVelocity.x === 200

// Check camera following (wasp roughly centered)
Math.abs(scene.cameras.main.scrollX - (scene.wasp.x - 400)) < 100
```

### NEST Phase

**Acceptance Criteria:**
- [ ] At least 5 rooms generated
- [ ] Queen room exists at depth 0
- [ ] Wasp starts in queen room
- [ ] Wall collision prevents wasp passing through
- [ ] Worm spawn points created

**Console Verification:**
```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Room count
scene.nestData.rooms.length >= 5

// Queen room
scene.nestData.queenRoom.type === 'queen'
scene.nestData.queenRoom.depth === 0

// Worm spawn points
scene.nestData.wormSpawnPoints.length >= 3
```

### QUEEN Phase

**Acceptance Criteria:**
- [ ] Queen spawns in queen chamber
- [ ] Hunger bar visible and drains over time
- [ ] Worms spawn at spawn points
- [ ] Collecting worm increases wormsCarried
- [ ] Feeding queen restores hunger
- [ ] Game over when hunger reaches 0

**Console Verification:**
```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Queen exists
scene.queen.hunger === 100 // Initially

// Worms exist
scene.worms.getLength() >= 3

// Speed penalty works
scene.wasp.addWorm();
scene.wasp.getMaxVelocity() === 185 // 200 - 15

// Feeding works (manual test required)
```

### HORNET Phase

**Acceptance Criteria:**
- [ ] Hornets spawn in non-queen rooms
- [ ] Hornets patrol back and forth
- [ ] Hornets chase wasp when close
- [ ] Collision drops worms
- [ ] Invincibility activates on hit

**Console Verification:**
```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Hornets spawned
scene.hornets.getLength() > 0

// No hornets in queen room
scene.hornets.getChildren().every(h => h.room.id !== scene.nestData.queenRoom.id)

// Hornet state
scene.hornets.getChildren()[0].state // 'patrol', 'chase', or 'return'

// Invincibility check
scene.wasp.isInvincible()
```

### DIFF Phase

**Acceptance Criteria:**
- [ ] Score tracks survival time
- [ ] Difficulty increases at 45s intervals
- [ ] Hunger drain rate increases
- [ ] New hornets spawn on difficulty increase
- [ ] High score saves to localStorage

**Console Verification:**
```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Score tracking
scene.difficultyManager.getScore()
scene.difficultyManager.getFormattedScore()

// Difficulty level
scene.difficultyManager.getDifficultyLevel()

// High score
localStorage.getItem('waspGameHighScore')
```

### ART Phase

**Acceptance Criteria:**
- [ ] All sprites load without errors
- [ ] Wasp animation plays
- [ ] Queen animation plays
- [ ] Hornet changes animation in chase
- [ ] Tiles display honeycomb pattern

**Console Verification:**
```javascript
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Texture check
scene.wasp.texture.key === 'wasp'

// Animation playing
scene.wasp.anims.isPlaying
scene.wasp.anims.currentAnim.key === 'wasp-fly'

// Animation registry
game.anims.exists('wasp-fly')
game.anims.exists('queen-idle')
```

### POLISH Phase

**Acceptance Criteria:**
- [ ] Title screen loads first
- [ ] Title image displays
- [ ] Sound effects play (if audio enabled)
- [ ] Screen shake on hit
- [ ] Particles on collection

**Console Verification:**
```javascript
// Title scene
game.scene.isActive('TitleScene')

// After starting game
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));

// Sounds loaded (if present)
game.sound.get('pickup') !== undefined

// Shake camera test
scene.cameras.main.shake(200, 0.01)
```

## Chrome Extension Testing

### Basic Procedure

1. Navigate to game URL
2. Take screenshots at key moments
3. Execute JavaScript verification commands
4. Use keyboard input for interaction testing
5. Check console for errors

### Test Template

```
1. Navigate: mcp__claude-in-chrome__navigate to http://localhost:8080
2. Wait: 3 seconds for load
3. Screenshot: capture initial state
4. Execute: verification JavaScript
5. Input: test keyboard controls
6. Screenshot: capture result
7. Console: check for errors with onlyErrors: true
```

## Error Handling

### Common Issues

| Issue | Check | Fix |
|-------|-------|-----|
| Canvas not visible | CSS, Phaser init | Check index.html |
| No physics | Config arcade | Check game.js |
| Sprites missing | Load order | Check BootScene |
| Collision fails | Layer setup | Check tilemap |
| No input | Cursor setup | Check PlayScene |

### Debug Mode

Enable physics debug in game.js:
```javascript
physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
        debug: true  // Shows collision boxes
    }
}
```

## Feature Completion Checklist

Before marking a feature complete:

1. [ ] Code compiles without errors
2. [ ] Manual testing passes
3. [ ] Console verification passes
4. [ ] No new console errors introduced
5. [ ] Existing features still work (regression)
6. [ ] Code follows project patterns
