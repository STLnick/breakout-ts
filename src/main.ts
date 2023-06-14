import './style.css';

import config from './gameConfig.ts';
import Player from './classes/Player.ts';
import {getRandomNumberBetween} from "./utils.ts";


interface GameBall {
    element: HTMLDivElement;
    rise: number;
    run: number;
    velocity: number;
}

interface GameBlock {
    x: number[],
    y: number[],
}

// Global variables
let player: Player;
let ball: GameBall;
let blocks: GameBlock[] = new Array(config.ROWS * config.COLUMNS);

function layoutBlocks(container: HTMLDivElement) {
    let block: HTMLDivElement;
    let leftStart: number;
    let topStart: number;

    for (let i = 0; i < config.ROWS; i++) {
        leftStart = (config.CONTAINER_WIDTH / 2) - (config.LAYOUT_WIDTH / 2);
        topStart = i * (config.BLOCK_HEIGHT + config.BLOCK_PADDING);

        for (let j = 0; j < config.COLUMNS; j++) {
            block = document.createElement('div');

            block.classList.add('layout-block');
            block.classList.add(`layout-block--row-${i}`);
            block.classList.add(`layout-block--row-${i}--col-${j}`);
            block.style.height = `${config.BLOCK_HEIGHT}px`;
            block.style.width = `${config.BLOCK_WIDTH}px`;
            block.style.left = `${leftStart}px`;
            block.style.top = `${topStart}px`;

            container.appendChild(block);

            blocks.push({
               x: [leftStart, leftStart + config.BLOCK_WIDTH],
               y: [topStart, topStart + config.BLOCK_HEIGHT],
            });

            leftStart += config.BLOCK_PADDING + config.BLOCK_WIDTH;
        }
    }
}

function setupGameBall(container: HTMLDivElement) {
    ball = {
        element: document.createElement('div'),
        rise: getRandomNumberBetween(-1, 1),
        run: getRandomNumberBetween(-1, 1),
        velocity: getRandomNumberBetween(4, 8),
    };

    ball.element.classList.add('breakout-ball');
    ball.element.style.left = `${config.CONTAINER_WIDTH / 2}px`;
    ball.element.style.top = `${config.CONTAINER_HEIGHT / 2}px`;

    container.appendChild(ball.element);

    const interval = setInterval(() => {
        const leftVal = parseFloat(ball.element.style.left.split('px')[0]);
        const topVal = parseFloat(ball.element.style.top.split('px')[0]);

        // IF moving would collide with top/bottom
        if (
            topVal + (ball.rise * ball.velocity) < 0
            || topVal + (ball.rise * ball.velocity) > config.CONTAINER_HEIGHT - config.BALL_DIAMETER
        ) {
            ball.rise = -ball.rise;
        }

        // IF moving would collide with left/right
        if (
            leftVal + (ball.run * ball.velocity) < 0
            || leftVal + (ball.run * ball.velocity) > config.CONTAINER_WIDTH - config.BALL_DIAMETER
        ) {
            ball.run = -ball.run;
        }

        // Updating ball position values
        ball.element.style.left = `${leftVal + (ball.run * ball.velocity)}px`;
        ball.element.style.top = `${topVal + (ball.rise * ball.velocity)}px`;
    }, config.FPS);

    // Cleanup ball animation interval
    window.addEventListener('unload', () => {
        clearInterval(interval);
    });
}

function setupPlayer(container: HTMLDivElement) {
    const left = (config.CONTAINER_WIDTH / 2) - (config.BLOCK_WIDTH / 2);
    const top = config.CONTAINER_HEIGHT - config.BLOCK_HEIGHT - 16;
    const playerBlock = document.createElement('div');

    playerBlock.classList.add('player-block');
    playerBlock.style.height = `${config.BLOCK_HEIGHT}px`;
    playerBlock.style.width = `${config.BLOCK_WIDTH}px`;
    playerBlock.style.left = `${left}px`;
    playerBlock.style.top = `${top}px`;

    container.appendChild(playerBlock);

    player = new Player(
        playerBlock,
        left,
        top,
        config.CONTAINER_WIDTH - config.BLOCK_WIDTH,
    );

    // Add listeners for Player Movement
    window.addEventListener('keydown', function (evt) {
        if (evt.key === 'ArrowLeft') {
            player.move('LEFT');
        } else if (evt.key === 'ArrowRight') {
            player.move('RIGHT');
        }
    });
}

function layoutGame(attempts = 0) {
    const container = document.querySelector<HTMLDivElement>('.game-container');

    if (container === null) {
        if (attempts > 3) {
            console.error(`Container: ${container}, Attempts: ${attempts}`);
            throw new Error('Error finding Game Container - unable to layout game');
        }
        // Try to layout again in 75ms
        setTimeout(() => {
            layoutGame(attempts + 1)
        }, 75);
        return;
    }

    setupPlayer(container);
    layoutBlocks(container);
    setupGameBall(container);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1 id="game-title">Breakout Game</h1>
    <div class="game-container">
        <!-- Starting Blocks -->
        <!-- (Space) -->
        <!-- Player -->
    </div>
`;

layoutGame();
