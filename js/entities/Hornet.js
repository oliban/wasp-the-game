import { CONFIG } from '../config.js';

const State = {
    PATROL: 'patrol',
    CHASE: 'chase',
    RETURN: 'return'
};

export class Hornet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, room) {
        super(scene, x, y, 'hornet');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Home and room reference
        this.homeX = x;
        this.homeY = y;
        this.room = room;

        // State machine
        this.state = State.PATROL;
        this.stateTimer = 0;

        // Patrol config
        this.patrolDirection = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        this.patrolVelocity = 80;
        this.patrolDir = 1; // 1 or -1

        // Chase config
        this.chaseSpeed = 120;
        this.detectionRange = 150;
        this.maxChaseTime = 5000; // 5 seconds
        this.chaseTimer = 0;

        // Return config
        this.returnSpeed = 100;

        // Target (wasp reference, set by scene)
        this.target = null;

        // Start patrol
        this.startPatrol();
    }

    setTarget(wasp) {
        this.target = wasp;
    }

    update(time, delta) {
        switch (this.state) {
            case State.PATROL:
                this.updatePatrol(delta);
                break;
            case State.CHASE:
                this.updateChase(delta);
                break;
            case State.RETURN:
                this.updateReturn(delta);
                break;
        }
    }

    startPatrol() {
        this.state = State.PATROL;
        if (this.patrolDirection === 'horizontal') {
            this.body.setVelocity(this.patrolVelocity * this.patrolDir, 0);
        } else {
            this.body.setVelocity(0, this.patrolVelocity * this.patrolDir);
        }
    }

    updatePatrol(delta) {
        // Check room boundaries
        const padding = 20;
        if (this.patrolDirection === 'horizontal') {
            if (this.x <= this.room.x + padding || this.x >= this.room.x + this.room.width - padding) {
                this.patrolDir *= -1;
                this.body.setVelocityX(this.patrolVelocity * this.patrolDir);
            }
        } else {
            if (this.y <= this.room.y + padding || this.y >= this.room.y + this.room.height - padding) {
                this.patrolDir *= -1;
                this.body.setVelocityY(this.patrolVelocity * this.patrolDir);
            }
        }

        // Check for target in range
        if (this.target && this.canDetectTarget()) {
            this.startChase();
        }
    }

    canDetectTarget() {
        if (!this.target) return false;

        // Distance check
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (dist > this.detectionRange) return false;

        // Check if target is in same room
        const inRoom = this.target.x >= this.room.x &&
                       this.target.x <= this.room.x + this.room.width &&
                       this.target.y >= this.room.y &&
                       this.target.y <= this.room.y + this.room.height;

        return inRoom;
    }

    startChase() {
        this.state = State.CHASE;
        this.chaseTimer = 0;
        console.log('Hornet starting chase!');
    }

    updateChase(delta) {
        this.chaseTimer += delta;

        // Chase timeout
        if (this.chaseTimer >= this.maxChaseTime) {
            this.startReturn();
            return;
        }

        // Target left room
        if (!this.canDetectTarget()) {
            this.startReturn();
            return;
        }

        // Move toward target
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.body.setVelocity(
            Math.cos(angle) * this.chaseSpeed,
            Math.sin(angle) * this.chaseSpeed
        );
    }

    startReturn() {
        this.state = State.RETURN;
        console.log('Hornet returning to patrol');
    }

    updateReturn(delta) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY);

        if (dist < 10) {
            this.x = this.homeX;
            this.y = this.homeY;
            this.startPatrol();
            return;
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        this.body.setVelocity(
            Math.cos(angle) * this.returnSpeed,
            Math.sin(angle) * this.returnSpeed
        );
    }

    // Called when hornet hits wasp
    onHitWasp() {
        this.startReturn();
    }
}
