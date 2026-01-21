import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';
import { Queen } from '../entities/Queen.js';
import { Worm } from '../entities/Worm.js';
import { Hornet } from '../entities/Hornet.js';
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

        // Create hornets
        this.hornets = this.physics.add.group({ runChildUpdate: true });
        this.spawnHornets();

        // Hornet-wasp collision
        this.physics.add.overlap(this.wasp, this.hornets, this.hornetHitWasp, null, this);

        // Hornet-wall collision
        this.physics.add.collider(this.hornets, this.nestData.wallLayer);

        // Queen death event
        this.events.on('queenDied', this.gameOver, this);

        // Camera setup
        this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cameras.main.startFollow(this.wasp, true, 0.1, 0.1);

        // UI
        this.createUI();

        console.log('Nest generated:', this.nestData.rooms.length, 'rooms');
        console.log('Worms spawned:', this.worms.getLength());
        console.log('Hornets spawned:', this.hornets.getLength());
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

    spawnHornets() {
        for (const room of this.nestData.rooms) {
            // Skip queen's chamber
            if (room.type === 'queen') continue;
            // Skip corridors
            if (room.type === 'corridor') continue;

            // Spawn based on depth (1-2 hornets)
            const hornetCount = Math.min(room.depth, 2);
            for (let i = 0; i < hornetCount; i++) {
                const offsetX = (Math.random() - 0.5) * room.width * 0.5;
                const offsetY = (Math.random() - 0.5) * room.height * 0.5;
                const hornet = new Hornet(
                    this,
                    room.centerX + offsetX,
                    room.centerY + offsetY,
                    room
                );
                hornet.setTarget(this.wasp);
                this.hornets.add(hornet);
            }
        }
    }

    hornetHitWasp(wasp, hornet) {
        // Skip if invincible
        if (wasp.isInvincible()) return;

        // Drop worms
        const droppedCount = wasp.dropAllWorms();
        if (droppedCount > 0) {
            this.scatterWorms(wasp.x, wasp.y, droppedCount);
        }

        // Make wasp invincible
        wasp.makeInvincible();

        // Hornet returns to patrol
        hornet.onHitWasp();

        console.log('Hit by hornet! Dropped', droppedCount, 'worms');
    }

    scatterWorms(x, y, count) {
        for (let i = 0; i < count; i++) {
            const worm = new Worm(this, x, y);
            this.worms.add(worm);

            // Random scatter velocity
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            worm.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            // Stop after settling
            this.time.delayedCall(500, () => {
                if (worm.body) {
                    worm.body.setVelocity(0, 0);
                }
            });
        }
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
