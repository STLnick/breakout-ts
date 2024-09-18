import Player from "./classes/Player.ts";
import { BLOCK_HEIGHT, BLOCK_WIDTH } from "./constants.ts";

export function checkXInPlayerRange(player: Player, leftVal: number, rightVal: number): boolean {
    return checkXInRange(
        leftVal,
        rightVal,
        player.leftPosition,
        player.leftPosition + BLOCK_WIDTH,
    );
}

export function checkYInPlayerRange(player: Player, topVal: number, bottomVal: number): boolean {
    const playerTop = parseFloat(getComputedStyle(player.domEl).top);
    const playerBottom = playerTop + BLOCK_HEIGHT;
    
    return checkYInRange(topVal, bottomVal, playerTop, playerBottom);
}

export function checkXInRange(l1: number, r1: number, l2: number, r2: number) {
    if (l1 >= l2 && l1 <= r2) {
        return true;
    }

    if (r1 >= l2 && r1 <= r2) {
        return true;
    }

    return false;
}


export function checkYInRange(t1: number, b1: number, t2: number, b2: number) {
    if (b1 >= t2 && b1 <= b2) {
        return true;
    }

    if (t1 >= t2 && t1 <= b2) {
        return true;
    }

    return false;
}

export const getRandomNumberBetween = (min: number, max: number) => {
    if (min > max) {
        console.error(`Min: ${min} - Max: ${max}`)
        throw new Error('`min` argument must be less than `max` argument');
    }

    if (min === max) {
        return min;
    }

    const calc = () => Math.random() * (max - min) + min;

    let val;
    do {
        val = calc();
    } while (val === 0);

    return val;
}
