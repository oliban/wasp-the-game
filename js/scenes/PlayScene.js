import { CONFIG } from '../config.js';
import { Wasp } from '../entities/Wasp.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        const worldWidth = 2000;
        const worldHeight = 2000;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.wasp = new Wasp(this, worldWidth / 2, worldHeight / 2);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasp.setCursors(this.cursors);

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.wasp, true, 0.1, 0.1);

        this.debugText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setScrollFactor(0).setDepth(100);

        console.log('PlayScene created with Wasp entity');
    }

    update(time, delta) {
        this.wasp.update();

        const vel = this.wasp.body.velocity;
        const maxVel = this.wasp.getMaxVelocity();
        this.debugText.setText([
            `Velocity: (${vel.x.toFixed(0)}, ${vel.y.toFixed(0)})`,
            `Max Velocity: ${maxVel}`,
            `Worms Carried: ${this.wasp.wormsCarried}`,
            `Position: (${this.wasp.x.toFixed(0)}, ${this.wasp.y.toFixed(0)})`
        ]);
    }
}
