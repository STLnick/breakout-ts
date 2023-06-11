import './style.css'
import {setupCounter} from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1 id="game-title">Breakout Game</h1>
    <div class="game-container">
      <!-- TODO -->
    </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);
