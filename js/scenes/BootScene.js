import { CONFIG } from '../config.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.createPlaceholderSprites();
    }

    createPlaceholderSprites() {
        // Wasp placeholder (yellow square)
        const waspGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        waspGraphics.fillStyle(CONFIG.COLOR_WASP);
        waspGraphics.fillRect(0, 0, CONFIG.WASP_SIZE, CONFIG.WASP_SIZE);
        waspGraphics.generateTexture('wasp', CONFIG.WASP_SIZE, CONFIG.WASP_SIZE);
        waspGraphics.destroy();

        // Queen placeholder (magenta square)
        const queenGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        queenGraphics.fillStyle(CONFIG.COLOR_QUEEN);
        queenGraphics.fillRect(0, 0, CONFIG.QUEEN_SIZE, CONFIG.QUEEN_SIZE);
        queenGraphics.generateTexture('queen', CONFIG.QUEEN_SIZE, CONFIG.QUEEN_SIZE);
        queenGraphics.destroy();

        // Worm placeholder (pink square)
        const wormGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        wormGraphics.fillStyle(CONFIG.COLOR_WORM);
        wormGraphics.fillRect(0, 0, CONFIG.WORM_SIZE, CONFIG.WORM_SIZE);
        wormGraphics.generateTexture('worm', CONFIG.WORM_SIZE, CONFIG.WORM_SIZE);
        wormGraphics.destroy();

        // Hornet placeholder (orange square)
        const hornetGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        hornetGraphics.fillStyle(CONFIG.COLOR_HORNET);
        hornetGraphics.fillRect(0, 0, CONFIG.HORNET_SIZE, CONFIG.HORNET_SIZE);
        hornetGraphics.generateTexture('hornet', CONFIG.HORNET_SIZE, CONFIG.HORNET_SIZE);
        hornetGraphics.destroy();

        // Wall tile placeholder
        const wallGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        wallGraphics.fillStyle(CONFIG.COLOR_WALL);
        wallGraphics.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wallGraphics.generateTexture('wall', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wallGraphics.destroy();

        // Floor tile placeholder
        const floorGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        floorGraphics.fillStyle(CONFIG.COLOR_FLOOR);
        floorGraphics.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        floorGraphics.generateTexture('floor', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        floorGraphics.destroy();
    }

    create() {
        this.scene.start('PlayScene');
    }
}
