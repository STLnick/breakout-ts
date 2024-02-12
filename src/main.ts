import Player from './classes/Player.ts';
import { getRandomNumberBetween } from './utils.ts';

// Initialize HTML
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1 id="game-title">Breakout Game</h1>
    <div class="game-container">
        <!-- Starting Blocks -->
        <!-- (Space) -->
        <!-- Player -->
    </div>
`;


type GameState = 'menu' | 'in_progress' | 'lost' | 'won';
const GAME_STATES = Object.freeze({
    menu: <GameState>'menu',
    in_progress: <GameState>'in_progress',
    lost: <GameState>'lost',
    won: <GameState>'won',
    quit: <GameState>'quit',
});

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
let blockData: {
    blocks: (HTMLDivElement|null)[],
    leftMostX: number,
    rightMostX: number,
    lowestY: number,
};
let state = {
    value: GAME_STATES.menu,
    updated: true,
    setValue(val: GameState) {
        this.updated = true;
        this.value = val;
    },
};

function layoutBlocks(container: HTMLDivElement) {
    let blocks: HTMLDivElement[] = Array(ROWS * COLUMNS);
    let block: HTMLDivElement;
    let initialLeft: number = (CONTAINER_WIDTH / 2) - (LAYOUT_WIDTH / 2);
    let leftStart: number;
    let topStart: number;

    for (let i = 0; i < ROWS; i++) {
        leftStart = initialLeft;
        topStart = i * (BLOCK_HEIGHT + BLOCK_PADDING);

        for (let j = 0; j < COLUMNS; j++) {
            block = document.createElement('div');
            block.classList.add('layout-block', `layout-block--row-${i}`);
            block.id = `layout-block--row-${i}--col-${j}`;
            block.style.height = `${BLOCK_HEIGHT}px`;
            block.style.width = `${BLOCK_WIDTH}px`;
            block.style.left = `${leftStart}px`;
            block.style.top = `${topStart}px`;

            container.appendChild(block);
            blocks[j + (i * COLUMNS)] = block;

            leftStart += BLOCK_PADDING + BLOCK_WIDTH;
        }
    }

    blockData = {
        blocks,
        leftMostX: initialLeft,
        rightMostX: initialLeft + (COLUMNS * (BLOCK_PADDING + BLOCK_WIDTH)),
        lowestY: ROWS * (BLOCK_HEIGHT + BLOCK_PADDING),
    };
}

function checkXInPlayerRange(leftVal: number, rightVal: number): boolean {
    const xInPlayerRange = (rightVal >= player.leftPosition && rightVal <= player.leftPosition + BLOCK_WIDTH)
        || (leftVal >= player.leftPosition && leftVal <= player.leftPosition + BLOCK_WIDTH);

    return xInPlayerRange;
}

function checkYInPlayerRange(topVal: number, bottomVal: number): boolean {
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

    return false;
}

function checkBlockCollision(top: number, right: number, left: number): HTMLDivElement | null {
    if (top > blockData.lowestY) {
        return null;
    }
    if (right < blockData.leftMostX || left > blockData.rightMostX) {
        return null;
    }

    // IF we get here then we're generally within the X coords of some blocks
    // and our Y is AT OR ABOVE the lowest Y so it's possible we can collide but not guaranteed yet

    let blockStyle: CSSStyleDeclaration;
    let block: HTMLDivElement | null;
    let blockLeft: number;
    let blockTop: number;
    for (let i = 0; i < blockData.blocks.length; i++) {
        block = blockData.blocks[i];
        if (block === null) {
            continue;
        }
        blockStyle = getComputedStyle(<Element>block);
        blockTop = parseFloat(blockStyle.top);
        if (top >= blockTop && top <= blockTop + BLOCK_HEIGHT) {
            blockLeft = parseFloat(blockStyle.left);
            if (
                left >= blockLeft && left <= blockLeft + BLOCK_WIDTH
                || right >= blockLeft && right <= blockLeft + BLOCK_WIDTH
            ) {
                console.log(`Collided with Block"${block.id}"`);
                blockData.blocks[i] = null;
                return block;
            }
        }
    }

    return null;
}

function updateBlockData() {
    let leftMostX = 9999;
    let rightMostX = 0;
    let lowestY = 0;
    let block: HTMLDivElement | null;
    let blockStyle: CSSStyleDeclaration;
    let blockLeft: number;
    let blockTop: number;
    
    for (let i = 0; i < blockData.blocks.length; i++) {
        block = blockData.blocks[i];
        if (block === null) {
            continue;
        }

        blockStyle = getComputedStyle(<Element>block);
        blockTop = parseFloat(blockStyle.top);
        blockLeft = parseFloat(blockStyle.left);

        if (blockLeft < leftMostX) {
            leftMostX = blockLeft;
        }
        if (blockLeft + BLOCK_WIDTH > rightMostX) {
            rightMostX = blockLeft + BLOCK_WIDTH;
        }
        if (blockTop + BLOCK_HEIGHT > lowestY) {
            lowestY = blockTop + BLOCK_HEIGHT;
        }
    }

    blockData.leftMostX = leftMostX;
    blockData.rightMostX = rightMostX;
    blockData.lowestY = lowestY;
}

function setupGameBall(container: HTMLDivElement) {
    ball = {
        element: document.createElement('div'),
        rise: getRandomNumberBetween(-1, 1),
        //rise: 1,
        run: getRandomNumberBetween(-1, 1),
        //run: 0,
        velocity: getRandomNumberBetween(6, 10),
        //velocity: 0,
    };

    ball.element.classList.add('breakout-ball');
    ball.element.style.left = `${CONTAINER_WIDTH / 2}px`;
    ball.element.style.top = `${CONTAINER_HEIGHT / 2}px`;

    container.appendChild(ball.element);
}

function gameTick() {
    const leftVal = parseFloat(ball.element.style.left.split('px')[0]);
    const rightVal = leftVal + BALL_DIAMETER;
    const topVal = parseFloat(ball.element.style.top.split('px')[0]);
    const bottomVal = topVal + BALL_DIAMETER;

    // IF moving would collide with top/bottom
    if (topVal + (ball.rise * ball.velocity) < 0) {
        ball.rise *= -1;
    } else if (topVal + (ball.rise * ball.velocity) > CONTAINER_HEIGHT - BALL_DIAMETER) {
        // TODO: lose a life / lose the game
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
    const collidee = checkBlockCollision(topVal, rightVal, leftVal);
    if (collidee !== null) {
        collidee.parentNode?.removeChild(collidee);
        updateBlockData();
        ball.rise *= -1;
    }

    // Updating ball position values
    ball.element.style.left = `${leftVal + (ball.run * ball.velocity)}px`;
    ball.element.style.top = `${topVal + (ball.rise * ball.velocity)}px`;
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

    const containerLeft = container.getBoundingClientRect().left;
    window.addEventListener('mousemove', function(evt) {
        player.moveTo(evt.clientX - containerLeft);
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
        setTimeout(() => layoutGame(attempts + 1), 75);
        return;
    }
    
    setupPlayer(container);
    layoutBlocks(container);
    setupGameBall(container);
}

function goToMenu() {
    const route = document.URL;
    console.log({ route });
}

function runGame() {
    console.log('runGame() :: START');
    
    let interval: NodeJS.Timeout | undefined;

    window.addEventListener('unload', () => {
        clearInterval(interval);
    });
    window.addEventListener('keypress', evt => {
        if (evt.shiftKey && evt.key === 'q') {
            clearInterval(interval);
            state.setValue(GAME_STATES.quit);
        }
    });
    
    console.log('runGame() :: setup unload listener');

    while (state.value !== GAME_STATES.quit) {
        console.log('runGame() :: while() :: START');

        if (state.updated) {
            state.updated = false;
            clearInterval(interval);

            switch (state.value) {
                case GAME_STATES.menu:
                    goToMenu();
                    break;
                case GAME_STATES.in_progress:
                    layoutGame();

                    interval = setInterval(() => {
                        gameTick();
                    }, FPS);

                    break;
                case GAME_STATES.lost:
                    break;
                case GAME_STATES.won:
                    break;
                default:
                    // do nothing so outer loop captures and ends
                    break;
            }

        }
    }
   
    clearInterval(interval);
    
    console.log('quit game state detected - ending main()');
}

//runGame();
