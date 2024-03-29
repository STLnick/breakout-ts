const MOVE_DISTANCE = 5;

class Player {
    domEl: HTMLDivElement;
    leftPosition: number;
    maxPosition: number;
    minPosition: number;

    constructor(domEl: HTMLDivElement, leftPosition: number, maxPosition: number, minPosition = 0) {
        this.domEl = domEl;
        this.leftPosition = leftPosition;
        this.maxPosition = maxPosition;
        this.minPosition = minPosition;
    }

    move(direction: 'LEFT' | 'RIGHT') {
        let newPos = this.leftPosition;

        if (direction === 'LEFT') {
            if (this.leftPosition === this.minPosition) {
                return;
            }

            newPos -= MOVE_DISTANCE;
            this.leftPosition = newPos > this.minPosition ? newPos : this.minPosition;
        } else if (direction === 'RIGHT') {
            if (this.leftPosition === this.maxPosition) {
                return;
            }

            newPos += MOVE_DISTANCE;
            this.leftPosition = newPos < this.maxPosition ? newPos : this.maxPosition;
        }

        window.requestAnimationFrame(() => {
            this.domEl.style.left = `${this.leftPosition}px`;
        });
    }

    moveTo(x: number) {
        //console.log('Player#moveTo() :: x', x);
        if (x < this.minPosition) {
            this.leftPosition = this.minPosition;
        } else if (x > this.maxPosition) {
            this.leftPosition = this.maxPosition;
        } else {
            this.leftPosition = x;
        }
        
        window.requestAnimationFrame(() => {
            this.domEl.style.left = `${this.leftPosition}px`;
        });
    }
}

export default Player;
