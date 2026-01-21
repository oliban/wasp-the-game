import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';
import { Queen } from '../entities/Queen.js';
import { Worm } from '../entities/Worm.js';
import { NestGenerator } from '../systems/NestGenerator.js';
import { DifficultyManager } from '../systems/DifficultyManager.js';

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

        // Initialize difficulty manager
        this.difficultyManager = new DifficultyManager(this);

        // Listen for difficulty increases
        this.events.on('difficultyIncreased', this.onDifficultyIncreased, this);

        // Worm respawn timer (every 10 seconds)
        this.wormRespawnTimer = this.time.addEvent({
            delay: 10000,
            callback: this.respawnWorms,
            callbackScope: this,
            loop: true
        });

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

    respawnWorms() {
        // Only respawn if below a certain threshold
        const maxWorms = this.nestData.wormSpawnPoints.length;
        const currentWorms = this.worms.getLength();

        if (currentWorms < maxWorms) {
            // Pick random spawn points
            const availablePoints = [...this.nestData.wormSpawnPoints];
            Phaser.Utils.Array.Shuffle(availablePoints);

            // Try to respawn some worms based on difficulty
            const wormsToSpawn = Math.min(3, maxWorms - currentWorms);

            for (let i = 0; i < wormsToSpawn; i++) {
                // Check respawn chance based on difficulty
                if (this.difficultyManager.shouldSpawnWorm()) {
                    const point = availablePoints[i];
                    if (point) {
                        const worm = new Worm(this, point.x, point.y);
                        this.worms.add(worm);
                    }
                }
            }
        }
    }

    onDifficultyIncreased(data) {
        // Increase queen's hunger drain rate
        const newDrainRate = this.queen.drainRate + data.hungerDrainIncrease;
        if (newDrainRate <= 10) { // Max drain rate cap
            this.queen.increaseDrainRate(data.hungerDrainIncrease);
        }

        // Show difficulty increase notification
        this.showDifficultyNotification(data.level);

        console.log(`Difficulty level ${data.level}: Queen drain rate now ${this.queen.drainRate.toFixed(1)}`);
    }

    showDifficultyNotification(level) {
        const notification = this.add.text(
            CONFIG.GAME_WIDTH / 2,
            CONFIG.GAME_HEIGHT / 2 - 50,
            'DIFFICULTY INCREASED!',
            {
                fontSize: '32px',
                fill: '#ff4444',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        const levelText = this.add.text(
            CONFIG.GAME_WIDTH / 2,
            CONFIG.GAME_HEIGHT / 2,
            `Level ${level}`,
            {
                fontSize: '24px',
                fill: '#ffaa00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Animate and remove
        this.tweens.add({
            targets: [notification, levelText],
            alpha: 0,
            y: '-=30',
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy();
                levelText.destroy();
            }
        });
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
        // Main info panel (top left)
        this.uiText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100);

        // Time/Score display (top right)
        this.timeText = this.add.text(CONFIG.GAME_WIDTH - 10, 10, '', {
            fontSize: '18px',
            fill: '#ffff00',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        // Difficulty display (below time)
        this.difficultyText = this.add.text(CONFIG.GAME_WIDTH - 10, 50, '', {
            fontSize: '14px',
            fill: '#ff8800',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        this.updateUI();
    }

    updateUI() {
        this.uiText.setText([
            `Worms Carried: ${this.wasp.wormsCarried}`,
            `Queen Hunger: ${this.queen.hunger.toFixed(1)}%`,
            `Worms Remaining: ${this.worms.getLength()}`
        ]);

        // Update time display
        if (this.difficultyManager) {
            this.timeText.setText(`Time: ${this.difficultyManager.getFormattedScore()}`);
            this.difficultyText.setText(`Difficulty: ${this.difficultyManager.getDifficultyLevel()}`);
        }
    }

    gameOver() {
        console.log('Game Over - Queen starved!');
        this.scene.start('GameOverScene', {
            reason: 'starved',
            score: this.difficultyManager.getScore(),
            formattedScore: this.difficultyManager.getFormattedScore(),
            difficultyLevel: this.difficultyManager.getDifficultyLevel()
        });
    }

    update(time, delta) {
        this.wasp.update();

        // Update queen hunger
        this.queen.update(delta);

        // Update difficulty manager
        this.difficultyManager.update(delta);

        // Update UI
        this.updateUI();
    }
}
