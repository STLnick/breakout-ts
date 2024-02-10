import './style.css';
import Player from './classes/Player.ts';
import { getRandomNumberBetween } from './utils.ts';

interface GameBall {
    element: HTMLDivElement;
    rise: number;
    run: number;
    velocity: number;
}

// Constants
const BALL_DIAMETER = 20;
const BLOCK_HEIGHT = 15;
const BLOCK_WIDTH = 75;
const BLOCK_PADDING = 16;
const CONTAINER_HEIGHT = 500;
const CONTAINER_WIDTH = 750;
const COLUMNS = 5;
const ROWS = 3;
const LAYOUT_WIDTH = (BLOCK_WIDTH * COLUMNS) + (BLOCK_PADDING * (COLUMNS - 1));
const FPS = 1000 / 60; // 60 frames per second

// Global variables
let player: Player;
let ball: GameBall;

function layoutBlocks(container: HTMLDivElement) {
    let block: HTMLDivElement;
    let leftStart: number;
    let topStart: number;

    for (let i = 0; i < ROWS; i++) {
        leftStart = (CONTAINER_WIDTH / 2) - (LAYOUT_WIDTH / 2);
        topStart = i * (BLOCK_HEIGHT + BLOCK_PADDING);

        for (let j = 0; j < COLUMNS; j++) {
            block = document.createElement('div');

            block.classList.add(
                'layout-block',
                `layout-block--row-${i}`,
                `layout-block--row-${i}--col-${j}`,
            );
            block.style.height = `${BLOCK_HEIGHT}px`;
            block.style.width = `${BLOCK_WIDTH}px`;
            block.style.left = `${leftStart}px`;
            block.style.top = `${topStart}px`;

            container.appendChild(block);

            leftStart += BLOCK_PADDING + BLOCK_WIDTH;
        }
    }
}

function checkXInPlayerRange(leftVal: number, rightVal: number) {
    const xInPlayerRange = (rightVal >= player.leftPosition && rightVal <= player.leftPosition + BLOCK_WIDTH)
        || (leftVal >= player.leftPosition && leftVal <= player.leftPosition + BLOCK_WIDTH);

    return xInPlayerRange;
}

function checkYInPlayerRange(topVal: number, bottomVal: number) {
    const playerTop = parseFloat(getComputedStyle(player.domEl).top);
    const playerBottom = playerTop + BLOCK_HEIGHT;
    
    // bottom is in player Y range
    if (bottomVal >= playerTop && bottomVal <= playerBottom) {
        return true;
    }
    // top is in player Y range
    if (topVal >= playerTop && topVal <= playerBottom) {
        return true;
    }
    // top is above player.top && bottom is below player.bottom

    const yInPlayerRange = (bottomVal >= playerBottom + BALL_DIAMETER && bottomVal <= playerBottom)
        || (topVal >= playerBottom + BALL_DIAMETER && topVal <= playerBottom);

    return yInPlayerRange;
}

function setupGameBall(container: HTMLDivElement) {
    ball = {
        element: document.createElement('div'),
        
        //rise: getRandomNumberBetween(-1, 1),
        rise: 1,
        
        run: getRandomNumberBetween(-1, 1),
        //run: 0,
        
        velocity: getRandomNumberBetween(6, 10),
        //velocity: 0,
    };

    ball.element.classList.add('breakout-ball');
    ball.element.style.left = `${CONTAINER_WIDTH / 2}px`;
    ball.element.style.top = `${CONTAINER_HEIGHT / 2}px`;

    container.appendChild(ball.element);

    const interval = setInterval(() => {
        const leftVal = parseFloat(ball.element.style.left.split('px')[0]);
        const rightVal = leftVal + BALL_DIAMETER;
        const topVal = parseFloat(ball.element.style.top.split('px')[0]);
        const bottomVal = topVal + BALL_DIAMETER;

        // IF moving would collide with top/bottom
        if (
            topVal + (ball.rise * ball.velocity) < 0
            || topVal + (ball.rise * ball.velocity) > CONTAINER_HEIGHT - BALL_DIAMETER
        ) {
            ball.rise *= -1;
        }

        // IF moving would collide with left/right
        if (
            leftVal + (ball.run * ball.velocity) < 0
            || leftVal + (ball.run * ball.velocity) > CONTAINER_WIDTH - BALL_DIAMETER
        ) {
            ball.run *= -1;
        }

        // Player collision check
        if (checkXInPlayerRange(leftVal, rightVal) && checkYInPlayerRange(topVal, bottomVal)) {
            ball.rise *= -1;
        }
        
        // Block collision check
        // TODO

        // Updating ball position values
        ball.element.style.left = `${leftVal + (ball.run * ball.velocity)}px`;
        ball.element.style.top = `${topVal + (ball.rise * ball.velocity)}px`;
    }, FPS);

    // Cleanup ball animation interval
    window.addEventListener('unload', () => {
        clearInterval(interval);
    });
}

function setupPlayer(container: HTMLDivElement) {
    const start = (CONTAINER_WIDTH / 2) - (BLOCK_WIDTH / 2);
    const playerBlock = document.createElement('div');

    playerBlock.classList.add('player-block');
    playerBlock.style.height = `${BLOCK_HEIGHT}px`;
    playerBlock.style.width = `${BLOCK_WIDTH}px`;
    playerBlock.style.left = `${start}px`;

    container.appendChild(playerBlock);

    player = new Player(
        playerBlock,
        start,
        CONTAINER_WIDTH - BLOCK_WIDTH,
    );
    window.player = player;

    window.addEventListener('mousemove', function(evt) {
        player.moveTo(evt.clientX - containerLeft);
    });
}

var containerLeft = 0;
function layoutGame(attempts = 0) {
    const container = document.querySelector<HTMLDivElement>('.game-container');

    if (container === null) {
        if (attempts > 3) {
            console.error(`Container: ${container}, Attempts: ${attempts}`);
            throw new Error('Error finding Game Container - unable to layout game');
        }
        // Try to layout again in 75ms
        setTimeout(() => layoutGame(attempts + 1), 75);
        return;
    }
    
    containerLeft = container.getBoundingClientRect().left;
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
