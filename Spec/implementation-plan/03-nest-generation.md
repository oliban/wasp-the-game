# Phase 3: Procedural Nest Generation

## Objectives

- Create procedurally generated nest layout with rooms and corridors
- Implement collision between wasp and walls
- Place queen's chamber at the starting point
- Scatter worm spawn points in distant rooms
- Ensure each game generates a unique, navigable layout

## Implementation Details

### 3.1 Room Data Structure

Each room stores:
```javascript
{
    id: number,           // Unique identifier
    x: number,            // World X position (top-left)
    y: number,            // World Y position (top-left)
    width: number,        // Room width in pixels
    height: number,       // Room height in pixels
    type: string,         // 'queen', 'normal', 'corridor'
    depth: number,        // Distance from queen (0 = queen's chamber)
    connections: number[] // IDs of connected rooms
}
```

### 3.2 Generation Algorithm

1. **Create Queen's Chamber:**
   - Place large room at world center (0,0 offset)
   - Mark as `type: 'queen'`, `depth: 0`

2. **Recursive Expansion:**
   - For each room, attempt to add corridors in 4 directions
   - `BRANCH_PROBABILITY` (60%) chance per direction
   - Probability decreases with depth
   - Max depth of 5 levels

3. **Corridor Creation:**
   - Narrow passages connecting rooms
   - Width: `CORRIDOR_WIDTH` (64 pixels)
   - Length: random 100-200 pixels

4. **Room Creation:**
   - At end of each corridor, create new room
   - Size: random between `ROOM_MIN_SIZE` and `ROOM_MAX_SIZE`
   - Check for overlaps with existing rooms (reject if overlap)

5. **Worm Placement:**
   - Calculate worm count per room based on depth
   - Formula: `wormCount = Math.floor(depth * 0.5) + random(0, 2)`
   - Queen's chamber (depth 0) has no worms

### 3.3 Tilemap Generation

Convert room data to Phaser tilemap:
- Wall tiles (impassable) around room/corridor perimeters
- Floor tiles (walkable) inside rooms/corridors
- Use `TILE_SIZE` (16px) grid

### 3.4 Collision Setup

- Create static physics group for walls
- Wasp collides with wall group
- Use tilemap collision layer

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `js/systems/NestGenerator.js` | Create | Procedural generation logic |
| `js/scenes/PlayScene.js` | Modify | Use NestGenerator, setup collisions |

## Code Examples

### js/systems/NestGenerator.js
```javascript
import { CONFIG } from '../config.js';

export class NestGenerator {
    constructor(scene) {
        this.scene = scene;
        this.rooms = [];
        this.roomId = 0;
        this.wormSpawnPoints = [];
    }

    generate() {
        this.rooms = [];
        this.wormSpawnPoints = [];
        this.roomId = 0;

        // Create queen's chamber at center
        const queenRoom = this.createRoom(
            0, 0,
            CONFIG.ROOM_MAX_SIZE,
            CONFIG.ROOM_MAX_SIZE,
            'queen',
            0
        );
        this.rooms.push(queenRoom);

        // Recursively expand from queen's chamber
        this.expandRoom(queenRoom);

        // Calculate world bounds
        const bounds = this.calculateWorldBounds();

        // Generate tilemap
        const { tilemap, wallLayer, floorLayer } = this.createTilemap(bounds);

        return {
            rooms: this.rooms,
            queenRoom: queenRoom,
            wormSpawnPoints: this.wormSpawnPoints,
            tilemap,
            wallLayer,
            floorLayer,
            bounds
        };
    }

    createRoom(x, y, width, height, type, depth) {
        const room = {
            id: this.roomId++,
            x, y, width, height, type, depth,
            connections: [],
            centerX: x + width / 2,
            centerY: y + height / 2
        };
        return room;
    }

    expandRoom(room) {
        if (room.depth >= CONFIG.MAX_DEPTH) return;

        // Try each direction
        const directions = [
            { dx: 1, dy: 0 },  // Right
            { dx: -1, dy: 0 }, // Left
            { dx: 0, dy: 1 },  // Down
            { dx: 0, dy: -1 }  // Up
        ];

        // Shuffle directions for variety
        this.shuffleArray(directions);

        for (const dir of directions) {
            // Decrease probability with depth
            const probability = CONFIG.BRANCH_PROBABILITY * (1 - room.depth * 0.1);
            if (Math.random() > probability) continue;

            // Create corridor
            const corridor = this.createCorridor(room, dir);
            if (!corridor) continue;

            // Create room at end of corridor
            const newRoom = this.createRoomAtCorridor(corridor, dir, room.depth + 1);
            if (!newRoom) {
                // Remove corridor if room couldn't be placed
                this.rooms.pop();
                continue;
            }

            // Connect rooms
            room.connections.push(corridor.id);
            corridor.connections.push(room.id, newRoom.id);
            newRoom.connections.push(corridor.id);

            // Add worm spawn points based on depth
            this.addWormSpawnPoints(newRoom);

            // Recursively expand
            this.expandRoom(newRoom);
        }
    }

    createCorridor(fromRoom, dir) {
        const corridorLength = 100 + Math.random() * 100;
        const corridorWidth = CONFIG.CORRIDOR_WIDTH;

        let x, y, width, height;

        if (dir.dx !== 0) {
            // Horizontal corridor
            width = corridorLength;
            height = corridorWidth;
            y = fromRoom.centerY - corridorWidth / 2;
            x = dir.dx > 0 ? fromRoom.x + fromRoom.width : fromRoom.x - corridorLength;
        } else {
            // Vertical corridor
            width = corridorWidth;
            height = corridorLength;
            x = fromRoom.centerX - corridorWidth / 2;
            y = dir.dy > 0 ? fromRoom.y + fromRoom.height : fromRoom.y - corridorLength;
        }

        const corridor = this.createRoom(x, y, width, height, 'corridor', fromRoom.depth);

        // Check for overlaps
        if (this.overlapsExisting(corridor)) return null;

        this.rooms.push(corridor);
        return corridor;
    }

    createRoomAtCorridor(corridor, dir, depth) {
        const roomWidth = CONFIG.ROOM_MIN_SIZE + Math.random() * (CONFIG.ROOM_MAX_SIZE - CONFIG.ROOM_MIN_SIZE);
        const roomHeight = CONFIG.ROOM_MIN_SIZE + Math.random() * (CONFIG.ROOM_MAX_SIZE - CONFIG.ROOM_MIN_SIZE);

        let x, y;

        if (dir.dx > 0) {
            x = corridor.x + corridor.width;
            y = corridor.centerY - roomHeight / 2;
        } else if (dir.dx < 0) {
            x = corridor.x - roomWidth;
            y = corridor.centerY - roomHeight / 2;
        } else if (dir.dy > 0) {
            x = corridor.centerX - roomWidth / 2;
            y = corridor.y + corridor.height;
        } else {
            x = corridor.centerX - roomWidth / 2;
            y = corridor.y - roomHeight;
        }

        const room = this.createRoom(x, y, roomWidth, roomHeight, 'normal', depth);

        // Check for overlaps (excluding the corridor we're connecting from)
        if (this.overlapsExisting(room, [corridor.id])) return null;

        this.rooms.push(room);
        return room;
    }

    overlapsExisting(newRoom, excludeIds = []) {
        const padding = CONFIG.TILE_SIZE * 2; // Buffer between rooms

        for (const room of this.rooms) {
            if (excludeIds.includes(room.id)) continue;

            const overlaps = !(
                newRoom.x + newRoom.width + padding < room.x ||
                newRoom.x > room.x + room.width + padding ||
                newRoom.y + newRoom.height + padding < room.y ||
                newRoom.y > room.y + room.height + padding
            );

            if (overlaps) return true;
        }
        return false;
    }

    addWormSpawnPoints(room) {
        if (room.type === 'queen' || room.type === 'corridor') return;

        const wormCount = Math.floor(room.depth * 0.5) + Math.floor(Math.random() * 3);

        for (let i = 0; i < wormCount; i++) {
            const padding = CONFIG.TILE_SIZE * 2;
            const x = room.x + padding + Math.random() * (room.width - padding * 2);
            const y = room.y + padding + Math.random() * (room.height - padding * 2);

            this.wormSpawnPoints.push({ x, y, roomId: room.id, depth: room.depth });
        }
    }

    calculateWorldBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const room of this.rooms) {
            minX = Math.min(minX, room.x);
            minY = Math.min(minY, room.y);
            maxX = Math.max(maxX, room.x + room.width);
            maxY = Math.max(maxY, room.y + room.height);
        }

        // Add padding
        const padding = CONFIG.TILE_SIZE * 10;
        return {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2
        };
    }

    createTilemap(bounds) {
        const tileSize = CONFIG.TILE_SIZE;
        const widthInTiles = Math.ceil(bounds.width / tileSize);
        const heightInTiles = Math.ceil(bounds.height / tileSize);

        // Create tilemap data (0 = wall, 1 = floor)
        const mapData = [];
        for (let y = 0; y < heightInTiles; y++) {
            mapData[y] = [];
            for (let x = 0; x < widthInTiles; x++) {
                mapData[y][x] = 0; // Default to wall
            }
        }

        // Carve out rooms
        for (const room of this.rooms) {
            const startX = Math.floor((room.x - bounds.x) / tileSize);
            const startY = Math.floor((room.y - bounds.y) / tileSize);
            const endX = Math.ceil((room.x + room.width - bounds.x) / tileSize);
            const endY = Math.ceil((room.y + room.height - bounds.y) / tileSize);

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (y >= 0 && y < heightInTiles && x >= 0 && x < widthInTiles) {
                        mapData[y][x] = 1; // Floor
                    }
                }
            }
        }

        // Create Phaser tilemap
        const tilemap = this.scene.make.tilemap({
            data: mapData,
            tileWidth: tileSize,
            tileHeight: tileSize
        });

        // Add tilesets
        const wallTileset = tilemap.addTilesetImage('wall');
        const floorTileset = tilemap.addTilesetImage('floor');

        // Create layers
        const wallLayer = tilemap.createBlankLayer('walls', wallTileset);
        const floorLayer = tilemap.createBlankLayer('floor', floorTileset);

        // Position tilemap
        wallLayer.setPosition(bounds.x, bounds.y);
        floorLayer.setPosition(bounds.x, bounds.y);

        // Fill tiles
        for (let y = 0; y < heightInTiles; y++) {
            for (let x = 0; x < widthInTiles; x++) {
                if (mapData[y][x] === 0) {
                    wallLayer.putTileAt(0, x, y);
                } else {
                    floorLayer.putTileAt(0, x, y);
                }
            }
        }

        // Set collision on walls
        wallLayer.setCollisionByExclusion([-1]);

        return { tilemap, wallLayer, floorLayer };
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
```

### js/scenes/PlayScene.js (Modified)
```javascript
import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';
import { NestGenerator } from '../systems/NestGenerator.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Generate nest
        this.nestGenerator = new NestGenerator(this);
        this.nestData = this.nestGenerator.generate();

        // Set world bounds from generated nest
        const bounds = this.nestData.bounds;
        this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

        // Create wasp at queen's chamber center
        const queenRoom = this.nestData.queenRoom;
        this.wasp = new Wasp(this, queenRoom.centerX, queenRoom.centerY);

        // Set up collision with walls
        this.physics.add.collider(this.wasp, this.nestData.wallLayer);

        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasp.setCursors(this.cursors);

        // Camera setup
        this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cameras.main.startFollow(this.wasp, true, 0.1, 0.1);

        // Debug info
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0).setDepth(100);

        console.log('Nest generated:', this.nestData.rooms.length, 'rooms');
        console.log('Worm spawn points:', this.nestData.wormSpawnPoints.length);
    }

    update(time, delta) {
        this.wasp.update();

        // Debug display
        this.debugText.setText([
            `Rooms: ${this.nestData.rooms.length}`,
            `Worm Points: ${this.nestData.wormSpawnPoints.length}`,
            `Position: (${this.wasp.x.toFixed(0)}, ${this.wasp.y.toFixed(0)})`
        ]);
    }
}
```

## Manual Test Steps

1. **Load game and observe generation:**
   - Each page refresh should create different layout
   - Floor tiles visible (dark color)
   - Wall tiles visible (brown color)

2. **Verify queen's chamber:**
   - Wasp starts in a large central room
   - Room should be clearly defined

3. **Test wall collision:**
   - Move wasp toward walls
   - Wasp should stop at wall boundary
   - Should not pass through walls

4. **Explore the nest:**
   - Navigate through corridors to other rooms
   - Multiple paths should be available
   - Some dead ends expected

5. **Check generation consistency:**
   - Refresh page 5+ times
   - Each layout should be different
   - All layouts should be navigable (no isolated rooms)

6. **Verify worm spawn points:**
   - Check console for worm spawn count
   - Should be > 0
   - Distant rooms should have more spawn points

## Automated Test Specs

### Unit Tests (NestGenerator.js)

```javascript
// tests/systems/NestGenerator.test.js
import { NestGenerator } from '../js/systems/NestGenerator.js';

describe('NestGenerator', () => {
    let generator;
    let mockScene;

    beforeEach(() => {
        mockScene = createMockScene();
        generator = new NestGenerator(mockScene);
    });

    describe('generate', () => {
        test('creates queen room at depth 0', () => {
            const result = generator.generate();
            expect(result.queenRoom).toBeDefined();
            expect(result.queenRoom.type).toBe('queen');
            expect(result.queenRoom.depth).toBe(0);
        });

        test('creates multiple rooms', () => {
            const result = generator.generate();
            expect(result.rooms.length).toBeGreaterThan(1);
        });

        test('creates worm spawn points', () => {
            const result = generator.generate();
            expect(result.wormSpawnPoints.length).toBeGreaterThan(0);
        });

        test('no worms in queen chamber', () => {
            const result = generator.generate();
            const queenWorms = result.wormSpawnPoints.filter(
                w => w.roomId === result.queenRoom.id
            );
            expect(queenWorms.length).toBe(0);
        });
    });

    describe('overlapsExisting', () => {
        test('detects overlapping rooms', () => {
            generator.rooms.push({ id: 0, x: 0, y: 0, width: 100, height: 100 });
            const overlapping = { x: 50, y: 50, width: 100, height: 100 };
            expect(generator.overlapsExisting(overlapping)).toBe(true);
        });

        test('allows non-overlapping rooms', () => {
            generator.rooms.push({ id: 0, x: 0, y: 0, width: 100, height: 100 });
            const separate = { x: 200, y: 200, width: 100, height: 100 };
            expect(generator.overlapsExisting(separate)).toBe(false);
        });
    });
});
```

### Integration Test Spec

```javascript
// tests/generation.integration.test.js
describe('Nest Generation Integration', () => {
    test('generated nest is navigable from queen room', async () => {
        // BFS/DFS from queen room
        // Verify all rooms are reachable via connections
    });

    test('tilemap collision prevents wasp from entering walls', async () => {
        // Position wasp near wall
        // Apply velocity toward wall
        // Verify wasp position doesn't enter wall tiles
    });

    test('multiple generations produce different layouts', async () => {
        // Generate 5 nests
        // Compare room counts or positions
        // Verify at least 3 are different
    });
});
```

## Claude Browser Test Instructions

### Test Procedure

1. **Navigate to game:**
   - Use `mcp__claude-in-chrome__navigate` to `http://localhost:8080`
   - Wait 3 seconds for generation

2. **Take screenshot of generated nest:**
   - Use `mcp__claude-in-chrome__computer` with action `screenshot`
   - Verify floor and wall tiles are visible
   - Wasp should be in a room (floor tiles around it)

3. **Verify generation via JavaScript:**
   ```javascript
   const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
   console.log('ROOM_COUNT:', scene.nestData.rooms.length);
   console.log('WORM_POINTS:', scene.nestData.wormSpawnPoints.length);
   ```
   - Room count should be > 5
   - Worm points should be > 0

4. **Test wall collision:**
   - Identify wall direction from screenshot
   - Hold arrow key toward wall for 2 seconds
   - Take screenshot
   - Wasp should be at wall boundary, not through it

5. **Test exploration:**
   - Navigate through a corridor to another room
   - Take screenshot in new room
   - Camera should have followed

6. **Verify randomness:**
   - Refresh page (navigate to same URL)
   - Take screenshot
   - Compare room layout to previous screenshot
   - Should be visibly different

## Acceptance Criteria (Strict Pass/Fail)

| ID | Criterion | Pass Condition | Fail Condition |
|----|-----------|----------------|----------------|
| 3.1 | Nest generates | At least 5 rooms created | Fewer than 5 rooms |
| 3.2 | Queen room exists | Room with type 'queen' at depth 0 | No queen room |
| 3.3 | Wasp starts in queen room | Wasp position inside queen room bounds | Wasp outside queen room |
| 3.4 | Wall collision works | Wasp cannot pass through wall tiles | Wasp enters wall area |
| 3.5 | Corridors connect rooms | All rooms reachable from queen via connections | Isolated rooms exist |
| 3.6 | Worm spawn points created | At least 3 worm spawn points exist | No worm points or < 3 |
| 3.7 | No worms in queen room | Zero spawn points with queenRoom.id | Worms spawn in queen room |
| 3.8 | Generation is random | Different room layouts on refresh | Same layout every time |
| 3.9 | World bounds set correctly | Camera bounds match nest bounds | Camera shows void areas |
| 3.10 | No errors | No JavaScript errors during generation | Any JS error |

### Verification Commands

```javascript
// Check room count
const scene = game.scene.scenes.find(s => s.scene.isActive('PlayScene'));
scene.nestData.rooms.length >= 5

// Check queen room
scene.nestData.queenRoom.type === 'queen' && scene.nestData.queenRoom.depth === 0

// Check wasp in queen room
const q = scene.nestData.queenRoom;
scene.wasp.x >= q.x && scene.wasp.x <= q.x + q.width &&
scene.wasp.y >= q.y && scene.wasp.y <= q.y + q.height

// Check worm spawn points
scene.nestData.wormSpawnPoints.length >= 3

// Check no worms in queen room
scene.nestData.wormSpawnPoints.filter(w => w.roomId === scene.nestData.queenRoom.id).length === 0

// Check wall layer has collision
scene.nestData.wallLayer.layer.collideIndexes.length > 0
```
