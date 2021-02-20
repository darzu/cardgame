import { renderGrid } from './render.js';

class State {
    grid: Grid
}

export type Cell = Enemy | Card | null;

export class Grid {
    height: number = 3
    width: number = 5
    columns: Cell[][] = repeat(repeat(null, this.width), this.height)

    get(pos: Position): Cell {
        return this.columns[pos.x][pos.y]
    }
}

class Position {
    x: number = 0
    y: number = 0

    public constructor(init?:Partial<Position>) {
        Object.assign(this, init);
    }
}

export class Card {
    cost: number = 0;

    activate(_pos: Position, _state: State): void {}
}

class PeaShooter extends Card {
    cost: number = 1;
    health = 1;

    activate(pos: Position, state: State): void {
        let col = state.grid.columns[pos.x];
        for (let y = pos.y + 1; y < col.length; y++) {
            let thing = col[y];
            if (thing instanceof Enemy) {
                thing.take_damage(1);
                break
            }
        }
    }
}

export class Enemy {
    health: number = 5;

    take_damage(damage: number) {
        this.health -= damage;
    }
}

class LittleThing {
    health = 5;

    take_damage(damage: number) {
        this.health -= damage;
    }
}

function startNextTurn() {
    doOnturn(grid);
    renderGrid(grid);
}

function doOnturn(g: Grid) {
    // TODO enumerate grid, call 'onturn'
}


const grid: Grid = new Grid();

function main() {
    console.log("Hello, world!")

    let mainEl = document.getElementById("main") as HTMLDivElement;
    renderGrid(grid);
    startNextTurn();
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
