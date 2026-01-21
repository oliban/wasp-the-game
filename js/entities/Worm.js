import { CONFIG } from '../config.js';

export class Worm extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'worm');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Make body slightly smaller than sprite for precise collision
        this.body.setSize(CONFIG.WORM_SIZE * 0.8, CONFIG.WORM_SIZE * 0.8);

        // Play wiggle animation
        this.play('worm-wiggle');
    }

    collect() {
        // Stop sprite animation
        this.stop();

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
