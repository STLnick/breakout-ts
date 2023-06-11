import './style.css';

const BLOCK_HEIGHT = 15;
const BLOCK_WIDTH = 75;
const BLOCK_PADDING = 16;

const CONTAINER_PADDING = 16;
const CONTAINER_WIDTH = 750;

const COLUMNS = 5;
const ROWS = 3;
const LAYOUT_WIDTH = (BLOCK_WIDTH * COLUMNS) + (BLOCK_PADDING * (COLUMNS - 1));

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
            block.classList.add(`layout-block--row-${i}--col-${j}`);
            block.style.position = 'absolute';
            block.style.height = `${BLOCK_HEIGHT}px`;
            block.style.width = `${BLOCK_WIDTH}px`;
            block.style.left = `${leftStart}px`;
            block.style.top = `${topStart}px`;

            container.appendChild(block);

            leftStart += BLOCK_PADDING + BLOCK_WIDTH;
        }
    }
}

function layoutPlayer(container: HTMLDivElement) {
    const start = (CONTAINER_WIDTH / 2) - (BLOCK_WIDTH / 2);
    const player = document.createElement('div');

    player.classList.add('player-block');
    player.style.position = 'absolute';
    player.style.height = `${BLOCK_HEIGHT}px`;
    player.style.width = `${BLOCK_WIDTH}px`;
    player.style.left = `${start}px`;
    player.style.bottom = '1rem';

    container.appendChild(player);
}

function layoutGame(attempts: number) {
    const container = document.querySelector<HTMLDivElement>('.game-container');

    if (container === null) {
        if (attempts > 3) {
            console.error(`Container: ${container}, Attempts: ${attempts}`);
            throw new Error('Error finding Game Container - unable to layout game');
        }
        // Try to layout again in 75ms
        setTimeout(() => { layoutGame(attempts + 1) }, 75);
        return;
    }

    layoutPlayer(container);
    layoutBlocks(container);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1 id="game-title">Breakout Game</h1>
    <div class="game-container">
        <!-- Starting Blocks -->
        <!-- (Space) -->
        <!-- Player -->
    </div>
`;

layoutGame(0);
