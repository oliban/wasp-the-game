import { CONFIG } from './config.js';
import { TitleScene } from './scenes/TitleScene.js';
import { BootScene } from './scenes/BootScene.js';
import { PlayScene } from './scenes/PlayScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    width: CONFIG.GAME_WIDTH,
    height: CONFIG.GAME_HEIGHT,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true  // Enable during development
        }
    },
    scene: [TitleScene, BootScene, PlayScene, GameOverScene]
};

const game = new Phaser.Game(config);

// Expose game globally for testing
window.gameInstance = game;
