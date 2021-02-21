import { renderState } from './render.js';


// function isIn(xy: Position, box: Box): boolean {
//     if (xy.x < box.x || box.x + box.width <= xy.x)
//         return false;
//     if (xy.y < box.y || box.y + box.height <= xy.y)
//         return false;
//     return true;
// }

// function assert(b: boolean) {
//     throw
// }

function overlaps(a: Box, b: Box): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
}

console.log(overlaps({
    x: 1, y: 1, width: 1, height: 2
}, {
    x: 1, y: 2, width: 1, height: 1
}))


function byKey<T>(f: (t: T) => number): (a: T, b: T) => number {
    return (a, b) => f(a) - f(b)
}

export class GameState {
    width: number
    height: number
    enemies: WithPlayState<Enemy>[]
    cardsInPlay: WithPlayState<Card>[]
    // grid: Grid
    constructor(init: Partial<GameState>) {
        Object.assign(this, init);
    }

    enemiesInColumn(x: number, aboveY: number): WithPlayState<Enemy>[] {
        let col = {x, y: aboveY, height: 100, width: 1}
        let result = this.enemies.filter(e => overlaps(col, {...e.state, ...e.thing}));
        result.sort(byKey(e => e.state.y))
        return result;
    }

    step() {
        this.enemies.forEach(e => e.thing.activate(e.state, this));
        this.cardsInPlay.forEach(c => c.thing.activate(c.state, this));
        // this.cards.forEach(e => e.activate(e, this));
        // this.grid.forEach(Enemy, (e, pos) => e.activate(pos, this))
        // this.grid.forEach(Card, (c, pos) => c.activate(pos, this))

        this.enemies = this.enemies.filter(e => e.thing.health > 0)
        this.cardsInPlay = this.cardsInPlay.filter(c => c.thing.health > 0)

        // this.grid.forEach(Enemy, (e, pos) => {
        //     if (e.health <= 0) {
        //         this.grid.set(pos, null)
        //     }
        // })

        // this.grid.forEach(Card, (c, pos) => {
        //     if (c.health <= 0) {
        //         this.grid.set(pos, null)
        //     }
        // })
    }
}

// export type Cell = Enemy | Card | null;

// export class Grid {
//     height: number;
//     width: number;
//     columns: Cell[][];

//     constructor(init: {height: number, width: number}) {
//         Object.assign(this, init);
//         this.columns = repeat(0, this.width).map(() => repeat(null, this.height));
//     }

//     get(pos: Position): Cell {
//         return this.columns[pos.x][pos.y]
//     }

//     set(pos: Position, cell: Cell): void {
//         this.columns[pos.x][pos.y] = cell
//     }

//     forEach<T extends Card | Enemy>(t: new (...args: any[]) => T, f: (c: T, pos: Position) => any) {
//         this.columns.forEach((col, x) => {
//             col.forEach((cell, y) => {
//                 if (cell instanceof t)
//                     f(cell, {x, y})
//             })
//         });
//     }
// }

export interface Size {
    width: number,
    height: number
}
export interface Position {
    x: number
    y: number
}
type Box = Position & Size;

export interface PlayState extends Position {
    x: number,
    y: number,
}

type WithPlayState<T> = {
    thing: T,
    state: PlayState,
}

export abstract class Card {
    health: number = 0;
    cost: number = 0;
    width: number = 1;
    height: number = 1;
    name: string = "card";

    activate(play: PlayState, _state: GameState) {}
}

class PeaShooter extends Card {
    cost = 1;
    health = 10;
    name: string = "pshoot";

    activate(p: PlayState, state: GameState): void {
        let enemies = state.enemiesInColumn(p.x, p.y + this.height);
        if (enemies.length > 0) {
            enemies[0].thing.take_damage(1)
        }
    }
}



export class Enemy {
    health: number = 5;
    name: string = "enemy";
    width: number = 1;
    height: number = 1;

    activate(pos: Position, state: GameState): void {}
    take_damage(damage: number) {
        this.health -= damage;
    }
}

class LittleThing extends Enemy {
    name: string = "lil";
    health = 5;
}

function startNextTurn(state: GameState) {
    state.step();
    renderState(state);
}

function main() {
    console.log("Hello, world!")

    // const grid: Grid = new Grid({width: 3, height: 5});
    const state = new GameState({
        width: 3,
        height: 5,
        enemies: [],
        cardsInPlay: [],
        // grid
    });

    state.cardsInPlay.push({thing: new PeaShooter(), state: {x: 0, y: 1}})
    state.enemies.push({thing: new LittleThing(), state: {x: 0, y: 3}})
    state.enemies.push({thing: new LittleThing(), state: {x: 0, y: 4}})
    // state.grid.columns[0][1] = new PeaShooter();
    // state.grid.columns[0][3] = new LittleThing();
    // state.grid.columns[0][4] = new LittleThing();
    
    let mainEl = document.getElementById("main") as HTMLDivElement;
    renderState(state);
    // startNextTurn(state);

    function endTurnClick() {
        startNextTurn(state);
    }
    (window as any).endTurnClick = endTurnClick
}

document.addEventListener("DOMContentLoaded", () => main(), false);

function repeat<X>(x: X, n: number): X[] {
    let r: X[] = []
    for (let i = 0; i < n; i++) {
        r[i] = x
    }
    return r
}
// function repeat(n: number): number[] {
//     let r: number[] = []
//     for (let i = 0; i < n; i++) {
//         r[i] = i
//     }
//     return r
// }
