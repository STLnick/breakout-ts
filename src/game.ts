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
import {
    checkXInPlayerRange,
    checkXInRange,
    checkYInPlayerRange,
    checkYInRange,
} from "./utils.ts";

// Global variables
let player: Player;
let ball: GameBall;
let blockData: BlockData;
let state = {
    value: GAME_STATES.menu,
    updated: true,
    setValue(val: GameState) {
        this.updated = true;
        this.value = val;
    },
    inProgress() {
        return this.value === GAME_STATES.in_progress;
    },
};

function moveButtons(pos: string | undefined) {
    const gameMsg = document.querySelector(".game-msg")!;
    const buttonsDiv = document.querySelector(".game-buttons")!;
    const footer = document.querySelector(".game-footer")!;
    if (pos === "low") {
        gameMsg.classList.add("hidden");
        buttonsDiv.classList.add("low");
        footer.classList.add("low");
    } else {
        gameMsg.classList.remove("hidden");
        buttonsDiv.classList.remove("low");
        footer.classList.remove("low");
    }
}

// Initialize HTML
document.getElementById("app")!.innerHTML = fragments.base;

// Grab elements
let container = document.querySelector<HTMLDivElement>(".game-container")!;
const gameMsg = document.querySelector(".game-msg")!;
const startBtn = document.getElementById("start-game-btn")!;

document.getElementById("start-game-btn")!.addEventListener("click", function() {
    resetInterval();
    if (!state.inProgress()) {
        this.textContent = "Restart";
    }

    const buttonsDiv = document.querySelector(".game-buttons")!;
    if (!buttonsDiv.classList.contains("low")) {
        moveButtons("low");
    }

    if (!container) {
        container = document.querySelector<HTMLDivElement>(".game-container")!;
    }
    container.innerHTML = "";

    setTimeout(() => runGame(), 300);
});

/**
 * Check for collision with a block. In event of collision detection we null out the
 * block entry in our array and return the collidee and the side of block collided with..
 *
 */
function checkBlockCollision(top: number, right: number, bottom: number, left: number) {
    // First check if we're generally within the X and Y coords of
    // some blocks to quickly determine if a collision is possible
    if (
        top > blockData.lowestY
        || (right < blockData.leftMostX || left > blockData.rightMostX)
    ) {
        return { collidee: null, side: '' };
    }

    let blockStyle: CSSStyleDeclaration;
    let collidee: HTMLDivElement | null;
    let blockTop: number;
    let blockLeft: number;
    
    // Check all blocks for potential collision
    for (let i = 0; i < blockData.blocks.length; i++) {
        collidee = blockData.blocks[i];
        
        if (collidee === null) {
            continue;
        }
        
        blockStyle = getComputedStyle(<Element>collidee);
        blockTop = parseFloat(blockStyle.top);
        blockLeft = parseFloat(blockStyle.left);

        if (
            (checkYInRange(top, bottom, blockTop, blockTop + BLOCK_HEIGHT)
            // The ball is taller than the blocks so handle "centered" case
            || (top < blockTop && bottom > blockTop + BLOCK_HEIGHT))
            && checkXInRange(left, right, blockLeft, blockLeft + BLOCK_WIDTH)
        ) {
            blockData.blocks[i] = null;

            const distances = {
                top: Math.abs(top - blockTop),
                right: Math.abs(right - blockLeft + BLOCK_WIDTH),
                bottom: Math.abs(bottom - blockTop + BLOCK_HEIGHT),
                left: Math.abs(left - blockLeft),
            };
            
            switch (Math.min(...Object.values(distances))) {
                case distances.top:
                    return { collidee: collidee, side: 'top' };
                case distances.right:
                    return { collidee: collidee, side: 'right' };
                case distances.bottom:
                    return { collidee: collidee, side: 'bottom' };
                case distances.left:
                    return { collidee: collidee, side: 'right' };
            }
        }
    }

    return { collidee: null, side: '' };
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
        container.innerHTML = "";
        gameMsg.textContent = "LOST";
        startBtn.textContent = "Retry";
        moveButtons("center");
        removeWindowListeners();
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
    if (
        checkXInPlayerRange(player, leftVal, rightVal)
        && checkYInPlayerRange(player, topVal, bottomVal)
    ) {
        ball.rise *= -1;
        ball.velocity *= 1.05;
    }

    // Block collision check
    const { collidee, side } = checkBlockCollision(topVal, rightVal, bottomVal, leftVal);
    if (collidee !== null) {
        collidee.parentNode?.removeChild(collidee);
        const haveBlocks = updateBlockData();

        if (!haveBlocks) {
            state.setValue(GAME_STATES.won);
            resetInterval();
            container.innerHTML = "";
            gameMsg.textContent = "WON";
            gameMsg.classList.add("won");
            startBtn.textContent = "Play Again";
            moveButtons("center");
            removeWindowListeners();
            return;
        }

        if (side === 'top' || side === 'bottom') {
            ball.rise *= -1;
        } else {
            ball.run *= -1;
        }
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

function quit(evt: KeyboardEvent) {
    if (evt.shiftKey && evt.key === "q") {
        if (gameInterval) resetInterval();
        state.setValue(GAME_STATES.quit);
    }
}

function removeWindowListeners() {
    window.removeEventListener("unload", resetInterval);
    window.removeEventListener("keypress", quit);
}

function runGame() {
    gameMsg.classList.remove("won");
    window.addEventListener("unload", resetInterval);
    window.addEventListener("keypress", quit);
    
    const newGame = layoutGame();
    ball = newGame.ball;
    blockData = newGame.blockData;
    player = newGame.player;

    // Start the game
    state.setValue(GAME_STATES.in_progress);
    gameInterval = window.setInterval(gameTick, FPS);
}

