import { CONFIG } from '../config.js';

export class DifficultyManager {
    constructor(scene) {
        this.scene = scene;
        this.elapsedTime = 0;
        this.difficultyLevel = 0;
        this.lastDifficultyTime = 0;

        // Difficulty caps
        this.maxDrainRate = 10;
        this.maxHornets = 20;
        this.minWormRespawnChance = 0.2;

        // Current values
        this.currentWormRespawnChance = 0.5; // 50% base chance as per spec
        this.hornetsSpawned = 0;
    }

    update(delta) {
        this.elapsedTime += delta;

        // Check for difficulty increase every DIFFICULTY_INTERVAL ms
        if (this.elapsedTime - this.lastDifficultyTime >= CONFIG.DIFFICULTY_INTERVAL) {
            this.increaseDifficulty();
            this.lastDifficultyTime = this.elapsedTime;
        }
    }

    increaseDifficulty() {
        this.difficultyLevel++;

        // Emit event for PlayScene to handle
        this.scene.events.emit('difficultyIncreased', {
            level: this.difficultyLevel,
            hungerDrainIncrease: CONFIG.HUNGER_DRAIN_INCREASE,
            enemySpawnIncrease: CONFIG.ENEMY_SPAWN_INCREASE
        });

        // Spawn additional hornet (if hornets system is available)
        if (this.canSpawnMoreHornets()) {
            this.spawnNewHornet();
        }

        // Reduce worm respawn chance
        this.currentWormRespawnChance = Math.max(
            this.minWormRespawnChance,
            this.currentWormRespawnChance - 0.1
        );

        console.log(`Difficulty increased to level ${this.difficultyLevel}`);
    }

    spawnNewHornet() {
        // Check if hornets system exists in scene (Phase 5)
        if (!this.scene.hornets || !this.scene.nestData || !this.scene.Hornet) {
            console.log('Hornet spawning not available - hornets system not initialized');
            return;
        }

        // Filter rooms to exclude queen room and corridors
        const rooms = this.scene.nestData.rooms.filter(
            r => r.type !== 'queen' && r.type !== 'corridor'
        );

        if (rooms.length === 0) {
            console.log('No suitable rooms for hornet spawn');
            return;
        }

        // Pick random room
        const room = Phaser.Utils.Array.GetRandom(rooms);

        // Create new hornet using the Hornet class reference stored in scene
        const hornet = new this.scene.Hornet(
            this.scene,
            room.centerX,
            room.centerY,
            room
        );

        // Set target to wasp if available
        if (this.scene.wasp) {
            hornet.setTarget(this.scene.wasp);
        }

        this.scene.hornets.add(hornet);
        this.recordHornetSpawn();

        console.log(`Spawned new hornet in room at (${room.centerX}, ${room.centerY})`);
    }

    getScore() {
        return Math.floor(this.elapsedTime / 1000);
    }

    getFormattedScore() {
        const totalSeconds = this.getScore();
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getDifficultyLevel() {
        return this.difficultyLevel;
    }

    getWormRespawnChance() {
        return this.currentWormRespawnChance;
    }

    shouldSpawnWorm() {
        return Math.random() < this.currentWormRespawnChance;
    }

    canSpawnMoreHornets() {
        return this.hornetsSpawned < this.maxHornets;
    }

    recordHornetSpawn() {
        this.hornetsSpawned++;
    }

    getHornetsToSpawn(baseCount) {
        const toSpawn = Math.min(baseCount, this.maxHornets - this.hornetsSpawned);
        return Math.max(0, toSpawn);
    }
}
