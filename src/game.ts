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

function checkBlockCollision(top: number, right: number, left: number): HTMLDivElement | null {
    if (top > blockData.lowestY) {
        return null;
    }
    if (right < blockData.leftMostX || left > blockData.rightMostX) {
        return null;
    }

    // IF we get here then we"re generally within the X coords of some blocks
    // and our Y is AT OR ABOVE the lowest Y so it"s possible we can collide but not guaranteed yet

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

function gameTick() {
    const leftVal = parseFloat(ball.element.style.left.split("px")[0]);
    const rightVal = leftVal + BALL_DIAMETER;
    const topVal = parseFloat(ball.element.style.top.split("px")[0]);
    const bottomVal = topVal + BALL_DIAMETER;

    // IF moving would collide with top/bottom
    if (topVal + (ball.rise * ball.velocity) < 0) {
        ball.rise *= -1;
    } else if (topVal + (ball.rise * ball.velocity) > CONTAINER_HEIGHT - BALL_DIAMETER) {
        // TODO: lose a life / lose the game
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

function goToMenu() {
    window.location.assign("/menu");
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

