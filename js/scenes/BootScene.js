import { CONFIG } from '../config.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load sprite sheets from assets/sprites/
        this.load.spritesheet('wasp', 'assets/sprites/wasp.png', {
            frameWidth: CONFIG.WASP_SIZE,
            frameHeight: CONFIG.WASP_SIZE
        });

        this.load.spritesheet('queen', 'assets/sprites/queen.png', {
            frameWidth: CONFIG.QUEEN_SIZE,
            frameHeight: CONFIG.QUEEN_SIZE
        });

        this.load.spritesheet('hornet', 'assets/sprites/hornet.png', {
            frameWidth: CONFIG.HORNET_SIZE,
            frameHeight: CONFIG.HORNET_SIZE
        });

        this.load.spritesheet('worm', 'assets/sprites/worm.png', {
            frameWidth: CONFIG.WORM_SIZE,
            frameHeight: CONFIG.WORM_SIZE
        });

        // Load tile images
        this.load.image('wall', 'assets/sprites/wall.png');
        this.load.image('floor', 'assets/sprites/floor.png');
    }

    create() {
        // Create animations
        this.createAnimations();

        // Start the game
        this.scene.start('PlayScene');
    }

    createAnimations() {
        // Wasp flying animation (10 fps)
        this.anims.create({
            key: 'wasp-fly',
            frames: this.anims.generateFrameNumbers('wasp', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Queen idle animation (2 fps - slow, regal breathing)
        this.anims.create({
            key: 'queen-idle',
            frames: this.anims.generateFrameNumbers('queen', { start: 0, end: 3 }),
            frameRate: 2,
            repeat: -1
        });

        // Hornet patrol animation (8 fps - casual movement)
        this.anims.create({
            key: 'hornet-patrol',
            frames: this.anims.generateFrameNumbers('hornet', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });

        // Hornet chase animation (12 fps - aggressive, faster)
        this.anims.create({
            key: 'hornet-chase',
            frames: this.anims.generateFrameNumbers('hornet', { start: 2, end: 3 }),
            frameRate: 12,
            repeat: -1
        });

        // Worm wiggle animation (4 fps - slow wiggle)
        this.anims.create({
            key: 'worm-wiggle',
            frames: this.anims.generateFrameNumbers('worm', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
    }
}
