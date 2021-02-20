/// <reference path="./render.ts" />

console.log("hello world");
class Position {
    x: number
    y: number

    method() {

    }

    public constructor(init?:Partial<Position>) {
        Object.assign(this, init);
    }
}
class Grid {
    height: number = 3
    width: number = 5
    rows: (Card | Enemy | null)[][] = repeat(repeat(null, this.width), this.height)
}

class State {
    grid: Grid
}

class Card {
    cost: number = 0;
    position: Position | null = null;

    activate(pos: Position, state: State) {

    }
}

class Enemy {
    health: number = 0;

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

class PeaShooter extends Card {
    cost: number = 1;
    health = 1;

    myfun(mypos: Position, grid: Grid) {
        for (let y = mypos.y - 1; y >= 0; y--) {
            let thing = grid.rows[y][mypos.x];
            if (thing instanceof Enemy) {
                thing.take_damage(1);
                break
            }
        }
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