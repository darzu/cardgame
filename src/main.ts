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

function assert(cond: boolean, msg: string): void | never {
    if (!cond)
        throw msg;
}

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
    enemies: Enemy[]
    cardsInPlay: Card[]

    // deck
    drawPile: Card[]
    hand: Card[]
    discardPile: Card[]

    constructor(init: Partial<GameState>) {
        Object.assign(this, init);
    }

    enemiesInColumn(x: number, aboveY: number): Enemy[] {
        let col = {x, y: aboveY, height: 100, width: 1}
        let result = this.enemies.filter(e => overlaps(col, e));
        result.sort(byKey(e => e.y))
        return result;
    }

    cardsInBox(box: Box): Card[] {
        return this.cardsInPlay.filter(c => overlaps(box, c))
    }

    thingsInBox(box: Box): (Card | Enemy)[] {
        return [...this.cardsInPlay, ...this.enemies].filter(c => overlaps(box, c))
    }

    step() {
        this.enemies.forEach(e => e.activate(this));
        this.cardsInPlay.forEach(c => c.activate(this));
        // this.cards.forEach(e => e.activate(e, this));
        // this.grid.forEach(Enemy, (e, pos) => e.activate(pos, this))
        // this.grid.forEach(Card, (c, pos) => c.activate(pos, this))

        this.enemies = this.enemies.filter(e => e.health > 0)
        this.cardsInPlay = this.cardsInPlay.filter(c => c.health > 0)

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

        // draw
        // TODO: hand size?
        if (this.drawPile.length)
            this.hand.push(this.drawPile.pop()!)
        if (this.hand.length > 5)
            this.discardPile.push(this.hand.pop()!)
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
export type Position = {
    x: number
    y: number
}
type Box = Position & Size;

export class Card {
    health: number = 0;
    cost: number = 0;
    width: number = 1;
    height: number = 1;
    x: number;
    y: number;
    name: string = "card";

    activate(state: GameState) {}
    takeDmg(damage: number) {
        this.health -= damage;
    }
}

function mk<T>(t: new () => T, opts: Partial<T> = {}): T {
    return Object.assign(new t(), opts);
}

class PeaShooter extends Card {
    cost = 1;
    health = 10;
    name: string = "pshoot";

    activate(state: GameState): void {
        let enemies = state.enemiesInColumn(this.x, this.y + this.height);
        if (enemies.length > 0) {
            enemies[0].takeDmg(1)
        }
    }
}



export abstract class Enemy {
    health: number = 5;
    name: string = "enemy";
    width: number = 1;
    height: number = 1;
    x: number;
    y: number;

    activate(state: GameState): void {}
    takeDmg(damage: number) {
        this.health -= damage;
    }
}

class LittleThing extends Enemy {
    name: string = "lil";
    health = 5;

    activate(state: GameState): void {
        if (this.y > 0) {
            let thingsBelow = state.thingsInBox({...this, y: this.y - 1});
            if (thingsBelow.length == 0) {
                this.y -= 1;
            } else {
                thingsBelow.forEach(c => {
                    if (c instanceof Card)
                        c.takeDmg(1)
                });
            }
        }
    }
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
        hand: [],
        drawPile: [],
        discardPile: [],
        // grid
    });

    state.cardsInPlay.push(mk(PeaShooter, {x: 0, y: 1}))
    state.enemies.push(mk(LittleThing, {x: 0, y: 3}))
    state.enemies.push(mk(LittleThing, {x: 0, y: 4}))

    state.hand.push(mk(PeaShooter))
    state.hand.push(mk(PeaShooter))
    state.hand.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.drawPile.push(mk(PeaShooter))
    state.discardPile.push(mk(PeaShooter))
    state.discardPile.push(mk(PeaShooter))

    // state.cardsInPlay.push(Object.assign(new PeaShooter(), {x: 0, y: 1}))
    // state.enemies.push(Object.assign(new LittleThing(), {x: 0, y: 3}))
    // state.enemies.push(Object.assign(new LittleThing(), {x: 0, y: 4}))
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
