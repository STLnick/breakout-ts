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
