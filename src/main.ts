import { renderGrid } from './render.js';

class State {
    grid: Grid
    constructor(init: Partial<State>) {
        Object.assign(this, init);
    }

    step() {
        this.grid.forEach(Enemy, (e, pos) => e.activate(pos, this))
        this.grid.forEach(Card, (c, pos) => c.activate(pos, this))

        this.grid.forEach(Enemy, (e, pos) => {
            if (e.health <= 0) {
                this.grid.set(pos, null)
            }
        })

        this.grid.forEach(Card, (c, pos) => {
            if (c.health <= 0) {
                this.grid.set(pos, null)
            }
        })
    }
}

export type Cell = Enemy | Card | null;

export class Grid {
    height: number;
    width: number;
    columns: Cell[][];

    constructor(init: {height: number, width: number}) {
        Object.assign(this, init);
        this.columns = repeat(0, this.width).map(() => repeat(null, this.height));
    }

    get(pos: Position): Cell {
        return this.columns[pos.x][pos.y]
    }

    set(pos: Position, cell: Cell): void {
        this.columns[pos.x][pos.y] = cell
    }

    forEach<T extends Card | Enemy>(t: new (...args: any[]) => T, f: (c: T, pos: Position) => any) {
        this.columns.forEach((col, x) => {
            col.forEach((cell, y) => {
                if (cell instanceof t)
                    f(cell, {x, y})
            })
        });
    }
}

type Entity = Card | Enemy;

interface Position {
    x: number
    y: number
}

export class Card {
    pos: null
    cost: number = 0;
    health: number = 0;
    name: string = "card";

    activate(_pos: Position, _state: State): void {}
}


class PeaShooter extends Card {
    cost = 1;
    health = 10;
    name: string = "pshoot";

    activate(pos: Position, state: State): void {
        let col = state.grid.columns[pos.x];
        for (let y = pos.y + 1; y < col.length; y++) {
            let thing = col[y];
            if (thing instanceof Enemy) {
                thing.take_damage(1);
                return
            }
        }
    }
}

export class Enemy {
    health: number = 5;
    name: string = "enemy";

    activate(pos: Position, state: State): void {}
    take_damage(damage: number) {
        this.health -= damage;
    }
}

class LittleThing extends Enemy {
    name: string = "lil";
    health = 5;
}

function startNextTurn(state: State) {
    state.step();
    renderGrid(state.grid);
}

function main() {
    console.log("Hello, world!")

    const grid: Grid = new Grid({width: 3, height: 5});
    const state = new State({
        grid
    });

    state.grid.columns[0][1] = new PeaShooter();
    state.grid.columns[0][3] = new LittleThing();
    state.grid.columns[0][4] = new LittleThing();
    
    let mainEl = document.getElementById("main") as HTMLDivElement;
    renderGrid(grid);
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
