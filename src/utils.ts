export const getRandomNumberBetween = (min: number, max: number) => {
    if (min > max) {
        console.error(`Min: ${min} - Max: ${max}`)
        throw new Error('`min` argument must be less than `max` argument');
    }

    return min === max ? min : Math.random() * (max - min) + min;
}
