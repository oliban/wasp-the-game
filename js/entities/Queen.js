import { CONFIG } from '../config.js';

export class Queen extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'queen');

        scene.add.existing(this);

        this.hunger = CONFIG.QUEEN_INITIAL_HUNGER;
        this.drainRate = CONFIG.QUEEN_HUNGER_DRAIN;
        this.isAlive = true;

        // Create hunger bar
        this.createHungerBar();

        // Create overlap zone (larger than sprite for easier feeding)
        this.feedZone = scene.add.zone(x, y, CONFIG.QUEEN_SIZE * 1.5, CONFIG.QUEEN_SIZE * 1.5);
        scene.physics.add.existing(this.feedZone, true); // Static body

        // Play idle animation
        this.play('queen-idle');
    }

    createHungerBar() {
        const barWidth = CONFIG.QUEEN_SIZE * 1.5;
        const barHeight = 10;
        const barY = -CONFIG.QUEEN_SIZE / 2 - 20;

        // Background (dark)
        this.hungerBarBg = this.scene.add.rectangle(
            0, barY, barWidth, barHeight, 0x333333
        );
        this.hungerBarBg.setOrigin(0.5, 0.5);

        // Foreground (colored)
        this.hungerBarFg = this.scene.add.rectangle(
            0, barY, barWidth, barHeight, 0x00ff00
        );
        this.hungerBarFg.setOrigin(0.5, 0.5);

        // Container to group with queen
        this.hungerBarBg.setScrollFactor(1);
        this.hungerBarFg.setScrollFactor(1);
    }

    updateHungerBar() {
        const barWidth = CONFIG.QUEEN_SIZE * 1.5;
        const fillWidth = (this.hunger / 100) * barWidth;

        this.hungerBarFg.width = fillWidth;

        // Color based on hunger level
        if (this.hunger > 50) {
            this.hungerBarFg.setFillStyle(0x00ff00); // Green
        } else if (this.hunger > 25) {
            this.hungerBarFg.setFillStyle(0xffff00); // Yellow
        } else {
            this.hungerBarFg.setFillStyle(0xff0000); // Red
        }

        // Position relative to queen
        this.hungerBarBg.setPosition(this.x, this.y - CONFIG.QUEEN_SIZE / 2 - 20);
        this.hungerBarFg.setPosition(
            this.x - (barWidth - fillWidth) / 2,
            this.y - CONFIG.QUEEN_SIZE / 2 - 20
        );
    }

    update(delta) {
        if (!this.isAlive) return;

        // Drain hunger over time
        const drainAmount = (this.drainRate / 1000) * delta;
        this.hunger = Math.max(0, this.hunger - drainAmount);

        this.updateHungerBar();

        // Check for death
        if (this.hunger <= 0) {
            this.isAlive = false;
            this.scene.events.emit('queenDied');
        }
    }

    feed(wormCount) {
        if (wormCount <= 0) return 0;

        const restoreAmount = wormCount * CONFIG.WORM_HUNGER_RESTORE;
        const oldHunger = this.hunger;
        this.hunger = Math.min(100, this.hunger + restoreAmount);

        const actualRestore = this.hunger - oldHunger;
        this.updateHungerBar();

        // Visual feedback
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });

        return wormCount;
    }

    increaseDrainRate(amount) {
        this.drainRate += amount;
    }
}
