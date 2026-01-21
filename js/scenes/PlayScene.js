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
