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
