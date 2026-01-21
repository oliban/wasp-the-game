import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';
import { Queen } from '../entities/Queen.js';
import { Worm } from '../entities/Worm.js';
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

        // Create queen in queen's chamber
        const queenRoom = this.nestData.queenRoom;
        this.queen = new Queen(this, queenRoom.centerX, queenRoom.centerY);

        // Create wasp near queen
        this.wasp = new Wasp(this, queenRoom.centerX, queenRoom.centerY - 50);

        // Set up collision with walls
        this.physics.add.collider(this.wasp, this.nestData.wallLayer);

        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasp.setCursors(this.cursors);

        // Create worms at spawn points from nest generation
        this.worms = this.physics.add.group();
        this.spawnWorms();

        // Worm collection overlap
        this.physics.add.overlap(this.wasp, this.worms, this.collectWorm, null, this);

        // Queen feeding overlap
        this.physics.add.overlap(this.wasp, this.queen.feedZone, this.feedQueen, null, this);

        // Queen death event
        this.events.on('queenDied', this.gameOver, this);

        // Camera setup
        this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cameras.main.startFollow(this.wasp, true, 0.1, 0.1);

        // UI
        this.createUI();

        console.log('Nest generated:', this.nestData.rooms.length, 'rooms');
        console.log('Worms spawned:', this.worms.getLength());
    }

    spawnWorms() {
        // Spawn worms at the spawn points from nest generation
        for (const point of this.nestData.wormSpawnPoints) {
            const worm = new Worm(this, point.x, point.y);
            this.worms.add(worm);
        }
    }

    collectWorm(wasp, worm) {
        wasp.addWorm();
        worm.collect();

        // Update UI
        this.updateUI();

        console.log('Worm collected! Carrying:', wasp.wormsCarried);
    }

    feedQueen(wasp, feedZone) {
        if (wasp.wormsCarried === 0) return;

        const fed = this.queen.feed(wasp.wormsCarried);
        wasp.removeWorms(fed);

        // Show feed text
        const feedText = this.add.text(
            this.queen.x, this.queen.y - 80,
            `+${fed} worms!`,
            { fontSize: '20px', fill: '#00ff00' }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: feedText,
            y: feedText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => feedText.destroy()
        });

        this.updateUI();
        console.log('Fed queen! Hunger:', this.queen.hunger.toFixed(1));
    }

    createUI() {
        this.uiText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100);

        this.updateUI();
    }

    updateUI() {
        this.uiText.setText([
            `Worms Carried: ${this.wasp.wormsCarried}`,
            `Queen Hunger: ${this.queen.hunger.toFixed(1)}%`,
            `Worms Remaining: ${this.worms.getLength()}`
        ]);
    }

    gameOver() {
        console.log('Game Over - Queen starved!');
        this.scene.start('GameOverScene', { reason: 'starved' });
    }

    update(time, delta) {
        this.wasp.update();

        // Update queen hunger
        this.queen.update(delta);

        // Update UI
        this.updateUI();
    }
}
