import Player from "./classes/Player.ts";
import { BLOCK_HEIGHT, BLOCK_WIDTH } from "./constants.ts";

export function checkXInPlayerRange(player: Player, leftVal: number, rightVal: number): boolean {
    const xInPlayerRange = (rightVal >= player.leftPosition && rightVal <= player.leftPosition + BLOCK_WIDTH)
        || (leftVal >= player.leftPosition && leftVal <= player.leftPosition + BLOCK_WIDTH);

    return xInPlayerRange;
}

export function checkYInPlayerRange(player: Player, topVal: number, bottomVal: number): boolean {
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
