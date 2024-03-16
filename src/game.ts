import Player from "./classes/Player.ts";
import { fragments, layoutGame } from "./layout.ts";
import {
    BALL_DIAMETER,
    BLOCK_HEIGHT,
    BLOCK_WIDTH,
    CONTAINER_HEIGHT,
    CONTAINER_WIDTH,
    FPS,
} from "./constants.ts";
import { BlockData, GameState, GAME_STATES, GameBall } from "./types.ts";

// Global variables
let stateDisplay: HTMLElement;
let player: Player;
let ball: GameBall;
let blockData: BlockData
let state = {
    value: GAME_STATES.menu,
    updated: true,
    setValue(val: GameState) {
        this.updated = true;
        this.value = val;
        stateDisplay.innerHTML = val;
    },
};

// Initialize HTML
document.getElementById("app")!.innerHTML = fragments.base;
document.getElementById("start-game-btn")!.addEventListener("click", () => {
    if (state.value !== GAME_STATES.in_progress) {
        runGame();
    }
});

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

/**
 * Check for collision with a block. In event of collision detection we null out the
 * block entry in our array and return the collidee.
 *
 * @returns {HTMLDivElement | null} The block that was collided with.
 */
function checkBlockCollision(top: number, right: number, left: number): HTMLDivElement | null {
    // First check if we're generally within the X and Y coords of
    // some blocks to quickly determine if a collision is possible
    if (
        top > blockData.lowestY
        || (right < blockData.leftMostX || left > blockData.rightMostX)
    ) {
        return null;
    }

    let blockStyle: CSSStyleDeclaration;
    let block: HTMLDivElement | null;
    let blockLeft: number;
    let blockTop: number;
    
    // Check all blocks for potential collision
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
                (left >= blockLeft && left <= blockLeft + BLOCK_WIDTH)
                || (right >= blockLeft && right <= blockLeft + BLOCK_WIDTH)
            ) {
                blockData.blocks[i] = null;
                return block;
            }
        }
    }

    return null;
}

/**
 * Update block data for after a collision to update leftMostX, rightMostX, and lowestY values.
 *
 * @returns {boolean} If there are blocks remaining to collide with.
 */
function updateBlockData(): boolean {
    let leftMostX = 9999;
    let rightMostX = 0;
    let lowestY = 0;
    let block: HTMLDivElement | null;
    let blockStyle: CSSStyleDeclaration;
    let blockLeft: number;
    let blockTop: number;
    let haveBlocks = false;
    
    for (let i = 0; i < blockData.blocks.length; i++) {
        block = blockData.blocks[i];
        if (block === null) {
            continue;
        }

        haveBlocks = true;
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

    return haveBlocks;
}

function gameTick() {
    const leftVal = parseFloat(ball.element.style.left.split("px")[0]);
    const rightVal = leftVal + BALL_DIAMETER;
    const topVal = parseFloat(ball.element.style.top.split("px")[0]);
    const bottomVal = topVal + BALL_DIAMETER;

    // IF moving would collide with top/bottom
    if (topVal + (ball.rise * ball.velocity) < 0) {
        ball.rise *= -1;
    } else if (topVal + (ball.rise * ball.velocity) > CONTAINER_HEIGHT - BALL_DIAMETER) {
        state.setValue(GAME_STATES.lost);
        resetInterval();
        const container = document.querySelector<HTMLDivElement>(".game-container")!;
        container.innerHTML = fragments.lost;
        return;
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
        ball.velocity *= 1.05;
    }

    // Block collision check
    const collidee = checkBlockCollision(topVal, rightVal, leftVal);
    if (collidee !== null) {
        collidee.parentNode?.removeChild(collidee);
        const haveBlocks = updateBlockData();

        if (!haveBlocks) {
            state.setValue(GAME_STATES.won);
            resetInterval();
            const container = document.querySelector<HTMLDivElement>(".game-container")!;
            container.innerHTML = fragments.won;
            return;
        }

        ball.rise *= -1;
    }

    // Updating ball position values
    ball.element.style.left = `${leftVal + (ball.run * ball.velocity)}px`;
    ball.element.style.top = `${topVal + (ball.rise * ball.velocity)}px`;
}

var gameInterval: number | undefined;

function resetInterval() {
    clearInterval(gameInterval);
    gameInterval = undefined;
}

function runGame() {
    window.addEventListener("unload", resetInterval);
    window.addEventListener("keypress", evt => {
        if (evt.shiftKey && evt.key === "q") {
            if (gameInterval) resetInterval();
            state.setValue(GAME_STATES.quit);
        }
    });
    
    const newGame = layoutGame();
    ball = newGame.ball;
    blockData = newGame.blockData;
    player = newGame.player;

    // Start the game
    stateDisplay = document.getElementById("state-display")!;
    state.setValue(GAME_STATES.in_progress);
    gameInterval = window.setInterval(gameTick, FPS);
}

