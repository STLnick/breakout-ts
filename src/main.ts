import './style.css';
import Player from './classes/Player.ts';
import { getRandomNumberBetween } from "./utils.ts";

interface Ball {
    element: HTMLDivElement;
    rise: number;
    run: number;
    velocity: number;
}

// Constants
const BLOCK_HEIGHT = 15;
const BLOCK_WIDTH = 75;
const BLOCK_PADDING = 16;
const CONTAINER_PADDING = 16;
const CONTAINER_HEIGHT = 500;
const CONTAINER_WIDTH = 750;
const COLUMNS = 5;
const ROWS = 3;
const LAYOUT_WIDTH = (BLOCK_WIDTH * COLUMNS) + (BLOCK_PADDING * (COLUMNS - 1));

// Global variables
let player: Player;
let ball: Ball;

function layoutBlocks(container: HTMLDivElement) {
    let block: HTMLDivElement;
    let leftStart: number;
    let topStart: number;

    for (let i = 0; i < ROWS; i++) {
        leftStart = CONTAINER_PADDING + (CONTAINER_WIDTH / 2) - (LAYOUT_WIDTH / 2);
        topStart = CONTAINER_PADDING + i * (BLOCK_HEIGHT + BLOCK_PADDING);

        for (let j = 0; j < COLUMNS; j++) {
            block = document.createElement('div');

            block.classList.add('layout-block');
            block.classList.add(`layout-block--row-${i}`);
            block.classList.add(`layout-block--row-${i}--col-${j}`);
            block.style.height = `${BLOCK_HEIGHT}px`;
            block.style.width = `${BLOCK_WIDTH}px`;
            block.style.left = `${leftStart}px`;
            block.style.top = `${topStart}px`;

            container.appendChild(block);

            leftStart += BLOCK_PADDING + BLOCK_WIDTH;
        }
    }
}

function setupBall(container: HTMLDivElement) {
    ball = {
        element: document.createElement('div'),
        rise: getRandomNumberBetween(-1, 1),
        run: getRandomNumberBetween(-1, 1),
        velocity: getRandomNumberBetween(3, 8),
    };

    ball.element.classList.add('breakout-ball');
    ball.element.style.left = `${CONTAINER_WIDTH / 2}px`;
    ball.element.style.top = `${CONTAINER_HEIGHT / 2}px`;

    container.appendChild(ball.element);

    const ballObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log({ entry })
            if (entry.isIntersecting) {
                console.log('INTERSECTING');
            }
        })
    });
    ballObserver.observe(ball.element);



    // Send ball flying (should be a constant loop no stop (until out of bottom?)
    const interval = setInterval(() => {
        const leftVal = parseFloat(ball.element.style.left.split('px')[0]);
        const topVal = parseFloat(ball.element.style.top.split('px')[0]);

        ball.element.style.left = `${leftVal + (ball.run * ball.velocity)}px`;
        ball.element.style.top = `${topVal + (-ball.rise * ball.velocity)}px`;
    }, 50);

    // Cleanup ball animation interval
    window.addEventListener('unload', () => {
        clearInterval(interval);
    });
}

function setupPlayer(container: HTMLDivElement) {
    const start = CONTAINER_PADDING + (CONTAINER_WIDTH / 2) - (BLOCK_WIDTH / 2);
    const playerBlock = document.createElement('div');

    playerBlock.classList.add('player-block');
    playerBlock.style.height = `${BLOCK_HEIGHT}px`;
    playerBlock.style.width = `${BLOCK_WIDTH}px`;
    playerBlock.style.left = `${start}px`;

    container.appendChild(playerBlock);

    player = new Player(
        playerBlock,
        start,
        CONTAINER_PADDING,
        CONTAINER_WIDTH - BLOCK_WIDTH + CONTAINER_PADDING
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
    setupBall(container);
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
