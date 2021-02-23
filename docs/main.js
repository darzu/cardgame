import { initRenderer, playAreaEl, renderState } from './render.js';
console.log("hello from main.ts");
function assert(cond, msg) {
    if (!cond)
        throw msg;
}
function overlaps(a, b) {
    return (a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y);
}
console.log(overlaps({
    x: 1, y: 1, width: 1, height: 2
}, {
    x: 1, y: 2, width: 1, height: 1
}));
function byKey(f) {
    return (a, b) => f(a) - f(b);
}
export class GameState {
    constructor(init) {
        Object.assign(this, init);
    }
    enemiesInColumn(x, aboveY) {
        let col = { x, y: aboveY, height: 100, width: 1 };
        let result = this.enemies.filter(e => overlaps(col, e));
        result.sort(byKey(e => e.y));
        return result;
    }
    cardsInBox(box) {
        return this.cardsInPlay.filter(c => overlaps(box, c));
    }
    thingsInBox(box) {
        return [...this.cardsInPlay, ...this.enemies].filter(c => overlaps(box, c));
    }
    step() {
        this.enemies.forEach(e => e.activate(this));
        this.cardsInPlay.forEach(c => c.activate(this));
        // this.cards.forEach(e => e.activate(e, this));
        // this.grid.forEach(Enemy, (e, pos) => e.activate(pos, this))
        // this.grid.forEach(Card, (c, pos) => c.activate(pos, this))
        this.enemies = this.enemies.filter(e => e.health > 0);
        this.cardsInPlay = this.cardsInPlay.filter(c => c.health > 0);
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
        // unselect
        this.selected = undefined;
        // draw
        // TODO: hand size?
        if (this.drawPile.length)
            this.hand.unshift(this.drawPile.pop());
        while (this.hand.length > 5)
            this.discardPile.push(this.hand.pop());
    }
}
let _NEXT_ID = 1;
export function getNextId() {
    return _NEXT_ID++;
}
export class Card {
    constructor() {
        this.health = 0;
        this.cost = 0;
        this.width = 1;
        this.height = 1;
        this.name = "card";
        this.id = getNextId();
    }
    activate(state) { }
    takeDmg(damage) {
        this.health -= damage;
    }
}
function mk(t, opts = {}) {
    return Object.assign(new t(), opts);
}
class PeaShooter extends Card {
    constructor() {
        super(...arguments);
        this.cost = 1;
        this.health = 10;
        this.name = "pshoot";
    }
    activate(state) {
        let enemies = state.enemiesInColumn(this.x, this.y + this.height);
        if (enemies.length > 0) {
            enemies[0].takeDmg(1);
        }
    }
}
export class Enemy {
    constructor() {
        this.health = 5;
        this.name = "enemy";
        this.width = 1;
        this.height = 1;
        this.id = getNextId();
    }
    activate(state) { }
    takeDmg(damage) {
        this.health -= damage;
    }
}
class LittleThing extends Enemy {
    constructor() {
        super(...arguments);
        this.name = "lil";
        this.health = 5;
    }
    activate(state) {
        if (this.y > 0) {
            let thingsBelow = state.thingsInBox({ ...this, y: this.y - 1 });
            if (thingsBelow.length == 0) {
                this.y -= 1;
            }
            else {
                thingsBelow.forEach(c => {
                    if (c instanceof Card)
                        c.takeDmg(1);
                });
            }
        }
    }
}
function startNextTurn(state) {
    state.step();
    renderState(state);
}
const state = new GameState({
    width: 3,
    height: 5,
    enemies: [],
    cardsInPlay: [],
    hand: [],
    drawPile: [],
    discardPile: [],
});
function main() {
    console.log("Hello, world!");
    initRenderer(state);
    state.cardsInPlay.push(mk(PeaShooter, { x: 0, y: 1 }));
    state.enemies.push(mk(LittleThing, { x: 0, y: 3 }));
    state.enemies.push(mk(LittleThing, { x: 0, y: 4 }));
    state.hand.push(mk(PeaShooter));
    state.hand.push(mk(PeaShooter));
    state.hand.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.drawPile.push(mk(PeaShooter));
    state.discardPile.push(mk(PeaShooter));
    state.discardPile.push(mk(PeaShooter));
    renderState(state);
    function endTurnClick() {
        startNextTurn(state);
    }
    window.endTurnClick = endTurnClick;
    playAreaEl.onclick = function () {
        // deselect
        state.selected = undefined;
        renderState(state);
    };
}
document.addEventListener("DOMContentLoaded", () => main(), false);
function repeat(x, n) {
    let r = [];
    for (let i = 0; i < n; i++) {
        r[i] = x;
    }
    return r;
}
// function repeat(n: number): number[] {
//     let r: number[] = []
//     for (let i = 0; i < n; i++) {
//         r[i] = i
//     }
//     return r
// }
export function onCardClick(c) {
    console.log("card clicked: " + c.id);
    // remove from hand
    // state.hand = state.hand.filter(h => h.id !== c.id)
    // // place on board
    // c.x = 3
    // c.y = 3
    // state.cardsInPlay.push(c)
    if (state.selected === c)
        state.selected = undefined;
    else
        state.selected = c;
    renderState(state);
}
export function onGridClick({ x, y }) {
    console.log(`click: (${x}, ${y})`);
    if (state.selected) {
        // remove from hand
        state.hand = state.hand.filter(h => h.id !== state.selected.id);
        // place on board
        state.selected.x = x;
        state.selected.y = y;
        state.cardsInPlay.push(state.selected);
        state.selected = undefined;
        renderState(state);
    }
}
