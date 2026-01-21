import { CONFIG } from '../config.js';

export class Wasp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'wasp');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.wormsCarried = 0;
        this.baseMaxVelocity = CONFIG.WASP_MAX_VELOCITY;

        this.body.setDrag(CONFIG.WASP_DRAG);
        this.body.setMaxVelocity(this.baseMaxVelocity);
        this.cursors = null;
    }

    setCursors(cursors) {
        this.cursors = cursors;
    }

    getMaxVelocity() {
        const penalty = this.wormsCarried * CONFIG.WASP_WORM_SPEED_PENALTY;
        return Math.max(50, this.baseMaxVelocity - penalty);
    }

    update() {
        if (!this.cursors) return;

        const maxVel = this.getMaxVelocity();
        this.body.setMaxVelocity(maxVel);

        if (this.cursors.left.isDown) {
            this.body.setAccelerationX(-CONFIG.WASP_ACCELERATION);
        } else if (this.cursors.right.isDown) {
            this.body.setAccelerationX(CONFIG.WASP_ACCELERATION);
        } else {
            this.body.setAccelerationX(0);
        }

        if (this.cursors.up.isDown) {
            this.body.setAccelerationY(-CONFIG.WASP_ACCELERATION);
        } else if (this.cursors.down.isDown) {
            this.body.setAccelerationY(CONFIG.WASP_ACCELERATION);
        } else {
            this.body.setAccelerationY(0);
        }
    }

    addWorm() { this.wormsCarried++; }
    removeWorms(count = this.wormsCarried) {
        const removed = Math.min(count, this.wormsCarried);
        this.wormsCarried -= removed;
        return removed;
    }
    dropAllWorms() {
        const dropped = this.wormsCarried;
        this.wormsCarried = 0;
        return dropped;
    }
}
