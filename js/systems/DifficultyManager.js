import { CONFIG } from '../config.js';

export class DifficultyManager {
    constructor(scene) {
        this.scene = scene;
        this.elapsedTime = 0;
        this.difficultyLevel = 1;
        this.lastDifficultyTime = 0;

        // Difficulty caps
        this.maxDrainRate = 10;
        this.maxHornets = 20;
        this.minWormRespawnChance = 0.2;

        // Current values
        this.currentWormRespawnChance = 1.0;
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

        // Reduce worm respawn chance
        this.currentWormRespawnChance = Math.max(
            this.minWormRespawnChance,
            this.currentWormRespawnChance - 0.1
        );

        console.log(`Difficulty increased to level ${this.difficultyLevel}`);
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
