import { CONFIG } from '../config.js';

export class Worm extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'worm');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Make body slightly smaller than sprite for precise collision
        this.body.setSize(CONFIG.WORM_SIZE * 0.8, CONFIG.WORM_SIZE * 0.8);

        // Simple wiggle animation
        this.startWiggle();
    }

    startWiggle() {
        this.scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect() {
        // Stop animation
        this.scene.tweens.killTweensOf(this);

        // Quick scale down and destroy
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 150,
            onComplete: () => this.destroy()
        });
    }
}
