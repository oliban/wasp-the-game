export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // Load title image
        this.load.image('title-bg', 'wasp-the-game.png');
    }

    create() {
        // Title image as background (scaled to fit 800x600 canvas)
        const titleImage = this.add.image(400, 300, 'title-bg');
        titleImage.setDisplaySize(800, 600);

        // Semi-transparent overlay at bottom for text readability
        this.add.rectangle(400, 550, 800, 100, 0x000000, 0.5);

        // Start prompt
        const startText = this.add.text(400, 520, 'Press SPACE to start', {
            fontSize: '28px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Pulsing animation for start text
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // High score display
        const highScore = localStorage.getItem('waspGameHighScore') || 0;
        if (highScore > 0) {
            const mins = Math.floor(highScore / 60);
            const secs = highScore % 60;
            this.add.text(400, 565, `High Score: ${mins}:${secs.toString().padStart(2, '0')}`, {
                fontSize: '18px',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
        }

        // SPACE key to start
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('BootScene');
        });

        // Also allow click to start
        this.input.once('pointerdown', () => {
            this.scene.start('BootScene');
        });
    }
}
