import { CONFIG } from '../config.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        // Create placeholder wasp sprite in center
        this.wasp = this.physics.add.sprite(
            CONFIG.GAME_WIDTH / 2,
            CONFIG.GAME_HEIGHT / 2,
            'wasp'
        );

        // Set up arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Debug text
        this.debugText = this.add.text(10, 10, 'Phase 1: Setup Complete', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        console.log('PlayScene created successfully');
        console.log('Wasp sprite:', this.wasp);
        console.log('Cursors:', this.cursors);
    }

    update() {
        // Log arrow key presses (movement implemented in Phase 2)
        if (this.cursors.left.isDown) console.log('Left pressed');
        if (this.cursors.right.isDown) console.log('Right pressed');
        if (this.cursors.up.isDown) console.log('Up pressed');
        if (this.cursors.down.isDown) console.log('Down pressed');
    }
}
