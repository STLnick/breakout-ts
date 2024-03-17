import Player from "./classes/Player.ts";
import {
    BLOCK_HEIGHT,
    BLOCK_WIDTH,
    BLOCK_PADDING,
    CONTAINER_HEIGHT,
    CONTAINER_WIDTH,
    COLUMNS,
    ROWS,
    LAYOUT_WIDTH,
} from "./constants.ts";
import { BlockData, GameBall } from "./types.ts";
import { getRandomNumberBetween } from "./utils.ts";


export const fragments = {
    base: `
        <a id="menu-link" class="font-20" href="/">Home</a>
        
        <h1 id="game-title" class="font-normal">Breakout</h1>
        
        <div class="game-container-wrapper">
            <div class="game-container"></div>
            
            <h3 class="game-msg">Good luck!</h3>
            
            <div class="game-buttons flex flex-col align-center">
                <button id="start-game-btn" class="btn primary dark-text">Start</button>
            </div>
        </div>
        
        <div class="game-footer"></div>
    `,
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
            block = document.createElement("div");
            block.classList.add("layout-block", `layout-block--row-${i}`);
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

    return {
        blocks,
        leftMostX: initialLeft,
        rightMostX: initialLeft + (COLUMNS * (BLOCK_PADDING + BLOCK_WIDTH)),
        lowestY: ROWS * (BLOCK_HEIGHT + BLOCK_PADDING),
    };
}

function setupGameBall(container: HTMLDivElement) {
    const ball = {
        element: document.createElement("div"),
        rise: getRandomNumberBetween(-1, 1),
        run: getRandomNumberBetween(-1, 1),
        velocity: getRandomNumberBetween(7, 10),
    };

    ball.element.classList.add("breakout-ball");
    ball.element.style.left = `${CONTAINER_WIDTH / 2}px`;
    ball.element.style.top = `${CONTAINER_HEIGHT / 2}px`;

    container.appendChild(ball.element);

    return ball;
}

 
function setupPlayer(container: HTMLDivElement) {
    const start = (CONTAINER_WIDTH / 2) - (BLOCK_WIDTH / 2);
    const playerBlock = document.createElement("div");

    playerBlock.classList.add("player-block");
    playerBlock.style.height = `${BLOCK_HEIGHT}px`;
    playerBlock.style.width = `${BLOCK_WIDTH}px`;
    playerBlock.style.left = `${start}px`;

    container.appendChild(playerBlock);

    const player = new Player(
        playerBlock,
        start,
        CONTAINER_WIDTH - BLOCK_WIDTH,
    );

    const containerLeft = container.getBoundingClientRect().left;
    window.addEventListener("mousemove", function(evt) {
        player.moveTo(evt.clientX - containerLeft);
    });

    return player;
}


export function layoutGame(): { ball: GameBall, blockData: BlockData, player: Player } {
    const container = document.querySelector<HTMLDivElement>(".game-container")!;
    const player = setupPlayer(container);
    const blockData = layoutBlocks(container);
    const ball = setupGameBall(container);

    return {
        ball,
        blockData,
        player,
    };
}

