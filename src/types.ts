export type GameState = "menu" | "in_progress" | "lost" | "won";
export const GAME_STATES = Object.freeze({
    menu: <GameState>"menu",
    in_progress: <GameState>"in_progress",
    lost: <GameState>"lost",
    won: <GameState>"won",
    quit: <GameState>"quit",
});

export interface GameBall {
    element: HTMLDivElement;
    rise: number;
    run: number;
    velocity: number;
}

export interface BlockData {
    blocks: (HTMLDivElement|null)[];
    leftMostX: number;
    rightMostX: number;
    lowestY: number;
};

