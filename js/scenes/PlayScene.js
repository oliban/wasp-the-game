import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';
import { Queen } from '../entities/Queen.js';
import { Worm } from '../entities/Worm.js';
import { NestGenerator } from '../systems/NestGenerator.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
        this.difficultyLevel = 0;
        this.lastDifficultyTime = 0;
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

        // Create particle texture for worm collection
        this.createParticleTexture();

        // Create particle emitter for worm collection
        this.createWormParticles();

        // Track elapsed time for difficulty
        this.elapsedTime = 0;

        console.log('Nest generated:', this.nestData.rooms.length, 'rooms');
        console.log('Worms spawned:', this.worms.getLength());
    }

    createParticleTexture() {
        // Create a small yellow/gold particle texture
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xFFD700); // Gold color
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    createWormParticles() {
        // Create particle emitter for worm collection sparkles
        this.collectParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: [0xFFFF00, 0xFFD700, 0xFFA500], // Yellow/gold colors
            emitting: false
        });
        this.collectParticles.setDepth(50);
    }

    shakeCamera(intensity = 0.01, duration = 200) {
        this.cameras.main.shake(duration, intensity);
    }

    spawnWorms() {
        // Spawn worms at the spawn points from nest generation
        for (const point of this.nestData.wormSpawnPoints) {
            const worm = new Worm(this, point.x, point.y);
            this.worms.add(worm);
        }
    }

    collectWorm(wasp, worm) {
        // Trigger particle effect at worm position
        this.collectParticles.setPosition(worm.x, worm.y);
        this.collectParticles.explode(Phaser.Math.Between(5, 10));

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

        // Create hunger bar background
        this.hungerBarBg = this.add.rectangle(400, 25, 204, 24, 0x333333)
            .setScrollFactor(0)
            .setDepth(100);

        // Create hunger bar fill
        this.hungerBar = this.add.rectangle(300, 25, 200, 20, 0x00ff00)
            .setScrollFactor(0)
            .setDepth(100)
            .setOrigin(0, 0.5);

        // Hunger bar label
        this.hungerLabel = this.add.text(400, 25, 'HUNGER', {
            fontSize: '12px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(101).setOrigin(0.5);

        // Difficulty increase text (hidden initially)
        this.difficultyText = this.add.text(400, 80, 'DIFFICULTY INCREASED!', {
            fontSize: '24px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5).setAlpha(0);

        this.updateUI();
    }

    updateUI() {
        this.uiText.setText([
            `Worms Carried: ${this.wasp.wormsCarried}`,
            `Worms Remaining: ${this.worms.getLength()}`,
            `Difficulty: ${this.difficultyLevel}`
        ]);

        // Update hunger bar
        const hungerPercent = this.queen.hunger / 100;
        this.hungerBar.setScale(hungerPercent, 1);

        // Color based on hunger level
        if (this.queen.hunger > 50) {
            this.hungerBar.setFillStyle(0x00ff00); // Green
        } else if (this.queen.hunger > 25) {
            this.hungerBar.setFillStyle(0xffff00); // Yellow
        } else {
            this.hungerBar.setFillStyle(0xff0000); // Red
        }

        // Pulsing effect when hunger is low (< 25%)
        if (this.queen.hunger < 25) {
            if (!this.hungerPulsing) {
                this.hungerPulsing = true;
                this.hungerPulseTween = this.tweens.add({
                    targets: [this.hungerBar, this.hungerBarBg],
                    scaleY: 1.2,
                    duration: 200,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else {
            if (this.hungerPulsing) {
                this.hungerPulsing = false;
                if (this.hungerPulseTween) {
                    this.hungerPulseTween.stop();
                    this.hungerBar.setScale(hungerPercent, 1);
                    this.hungerBarBg.setScale(1, 1);
                }
            }
        }
    }

    showDifficultyIncrease() {
        // Show difficulty increased text
        this.difficultyText.setAlpha(1);

        // Shake camera on difficulty increase
        this.shakeCamera(0.005, 100);

        // Animate the text
        this.tweens.add({
            targets: this.difficultyText,
            alpha: 0,
            y: 60,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.difficultyText.setY(80);
            }
        });

        console.log('Difficulty increased to level', this.difficultyLevel);
    }

    gameOver() {
        console.log('Game Over - Queen starved!');
        this.scene.start('GameOverScene', { reason: 'starved' });
    }

    update(time, delta) {
        this.wasp.update();

        // Update queen hunger
        this.queen.update(delta);

        // Track elapsed time for difficulty scaling
        this.elapsedTime += delta;

        // Check for difficulty increase (every 45 seconds)
        if (this.elapsedTime - this.lastDifficultyTime >= CONFIG.DIFFICULTY_INTERVAL) {
            this.difficultyLevel++;
            this.lastDifficultyTime = this.elapsedTime;
            this.showDifficultyIncrease();

            // Increase hunger drain rate
            this.queen.increaseDrainRate(CONFIG.HUNGER_DRAIN_INCREASE);
        }

        // Update UI
        this.updateUI();
    }
}
