import config from '../gameConfig.ts';

class Player {
    domEl: HTMLDivElement;
    maxPosition: number;
    minPosition: number;
    x: number[];
    y: number[];

    constructor(domEl: HTMLDivElement, left: number, top: number, maxPosition: number, minPosition = 0) {
        this.domEl = domEl;
        this.x = [left, left + config.BLOCK_WIDTH];
        this.y = [top, top + config.BLOCK_HEIGHT];
        this.maxPosition = maxPosition;
        this.minPosition = minPosition;
    }

    move(direction: 'LEFT' | 'RIGHT') {
        let newPos = this.x[0];

        if (direction === 'LEFT') {
            if (this.x[0] === this.minPosition) {
                return;
            }

            newPos -= config.MOVE_DISTANCE;
            this.x[0] = newPos > this.minPosition ? newPos : this.minPosition;
        } else if (direction === 'RIGHT') {
            if (this.x[0] === this.maxPosition) {
                return;
            }

            newPos += config.MOVE_DISTANCE;
            this.x[0] = newPos < this.maxPosition ? newPos : this.maxPosition;
        }

        window.requestAnimationFrame(() => {
            this.domEl.style.left = `${this.x[0]}px`;
        });
    }
}

export default Player;
