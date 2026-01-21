import { CONFIG } from '../config.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.reason = data.reason || 'unknown';
        this.score = data.score || 0;
        this.formattedScore = data.formattedScore || '00:00';
        this.difficultyLevel = data.difficultyLevel || 1;
    }

    create() {
        const centerX = CONFIG.GAME_WIDTH / 2;
        const centerY = CONFIG.GAME_HEIGHT / 2;

        // Dark background
        this.add.rectangle(centerX, centerY, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 0x000000, 0.8);

        // GAME OVER title
        this.add.text(centerX, centerY - 150, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Death reason
        const reasonText = this.getReasonText();
        this.add.text(centerX, centerY - 80, reasonText, {
            fontSize: '24px',
            fill: '#ff8888'
        }).setOrigin(0.5);

        // Final score display
        this.add.text(centerX, centerY - 20, 'TIME SURVIVED', {
            fontSize: '20px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 20, this.formattedScore, {
            fontSize: '48px',
            fill: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Difficulty reached
        this.add.text(centerX, centerY + 70, `Difficulty Level: ${this.difficultyLevel}`, {
            fontSize: '18px',
            fill: '#ff8800'
        }).setOrigin(0.5);

        // High score handling
        const highScore = this.getHighScore();
        const isNewHighScore = this.score > highScore;

        if (isNewHighScore) {
            this.saveHighScore(this.score);

            // New high score celebration
            const hsText = this.add.text(centerX, centerY + 110, 'NEW HIGH SCORE!', {
                fontSize: '28px',
                fill: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Pulsing animation
            this.tweens.add({
                targets: hsText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        } else {
            // Show existing high score
            const formattedHighScore = this.formatTime(highScore);
            this.add.text(centerX, centerY + 110, `High Score: ${formattedHighScore}`, {
                fontSize: '20px',
                fill: '#888888'
            }).setOrigin(0.5);
        }

        // Restart instructions
        const restartText = this.add.text(centerX, centerY + 180, 'Press SPACE or CLICK to restart', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Blink animation for restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input handling - SPACE key
        this.input.keyboard.once('keydown-SPACE', () => {
            this.restartGame();
        });

        // Input handling - click/tap
        this.input.once('pointerdown', () => {
            this.restartGame();
        });
    }

    getReasonText() {
        switch (this.reason) {
            case 'starved':
                return 'The Queen starved to death!';
            case 'killed':
                return 'You were killed by a hornet!';
            default:
                return 'Game Over';
        }
    }

    getHighScore() {
        const stored = localStorage.getItem('wasp_game_high_score');
        return stored ? parseInt(stored, 10) : 0;
    }

    saveHighScore(score) {
        localStorage.setItem('wasp_game_high_score', score.toString());
    }

    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    restartGame() {
        this.scene.start('PlayScene');
    }
}
