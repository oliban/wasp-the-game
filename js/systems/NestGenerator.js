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
            // Decrease probability with depth - branch if random is LESS than probability
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

        // Check for overlaps (excluding the room we're extending from)
        if (this.overlapsExisting(corridor, [fromRoom.id])) return null;

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
