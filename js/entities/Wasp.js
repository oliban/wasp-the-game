import { CONFIG } from '../config.js';

export class Wasp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'wasp');

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Movement properties
        this.wormsCarried = 0;
        this.baseMaxVelocity = CONFIG.WASP_MAX_VELOCITY;

        // Configure physics body
        this.body.setDrag(CONFIG.WASP_DRAG);
        this.body.setMaxVelocity(this.baseMaxVelocity);
        this.body.setCollideWorldBounds(true);

        // Store reference to cursors (set by scene)
        this.cursors = null;
    }

    setCursors(cursors) {
        this.cursors = cursors;
    }

    getMaxVelocity() {
        // Reduce max velocity based on worms carried
        const penalty = this.wormsCarried * CONFIG.WASP_WORM_SPEED_PENALTY;
        return Math.max(50, this.baseMaxVelocity - penalty);
    }

    update() {
        if (!this.cursors) return;

        // Update max velocity based on carried worms
        const maxVel = this.getMaxVelocity();
        this.body.setMaxVelocity(maxVel);

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.body.setAccelerationX(-CONFIG.WASP_ACCELERATION);
        } else if (this.cursors.right.isDown) {
            this.body.setAccelerationX(CONFIG.WASP_ACCELERATION);
        } else {
            this.body.setAccelerationX(0);
        }

        // Vertical movement
        if (this.cursors.up.isDown) {
            this.body.setAccelerationY(-CONFIG.WASP_ACCELERATION);
        } else if (this.cursors.down.isDown) {
            this.body.setAccelerationY(CONFIG.WASP_ACCELERATION);
        } else {
            this.body.setAccelerationY(0);
        }
    }

    // Called when wasp picks up a worm (Phase 4)
    addWorm() {
        this.wormsCarried++;
    }

    // Called when wasp feeds queen or drops worms (Phase 4/5)
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
