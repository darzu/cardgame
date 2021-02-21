import { Card, Enemy, GameState, Position } from "./main.js";
import * as Mithril from './mithril.js'
const m = (window as any).m as Mithril.Static;

console.log("hello 2");

let playAreaEl = document.getElementById("play-area") as HTMLDivElement;
// let battleGridEl = document.getElementById("battle-grid") as HTMLDivElement;
// let handGridEl = document.getElementById("hand-grid") as HTMLDivElement;
// let drawPileEl = document.getElementById("draw-pile") as HTMLDivElement;
// let discardPileEl = document.getElementById("discard-pile") as HTMLDivElement;

// function drawEnt(c: Card | Enemy, height: number) {
//     let content = "";
//     if (c instanceof Card) content = `${c.name} h${c.health}`;
//     else if (c instanceof Enemy) content = `${c.name} h${c.health}`;

//     const n = document.createElement("div");
//     n.classList.add("battle-cell");
//     n.style.background = "#333A";
//     n.style.gridColumn = (c.x + 1).toString();
//     n.style.gridRow = (height - c.y + 1).toString();
//     n.innerText = content;
//     return n;
// }

// function renderDeckCardBack(c: Card): HTMLDivElement {
//     let content = "back";

//     const n = document.createElement("div");
//     n.classList.add("card-cell");
//     n.style.background = "#333A";
//     n.innerText = content;
//     return n;
// }

// function renderDeckCard(c: Card): HTMLDivElement {
//     let content = "i'm a card";

//     const n = document.createElement("div");
//     n.classList.add("card-cell");
//     n.style.background = "#333A";
//     n.innerText = content;
//     return n;
// }

// function renderHand(h: Card[]) {
//     handGridEl.style.gridTemplateRows = `repeat(${1}, 114px)`;
//     handGridEl.style.gridTemplateColumns = `repeat(${5}, 64px)`;

//     const es = h.map(renderDeckCard).map((n, i) => {
//         n.style.gridColumn = (i + 1).toString();
//         n.style.gridRow = "1";
//         return n;
//     });

//     replaceChildren(handGridEl, es);
// }

// function renderDrawPile(h: Card[]) {
//     const es = h.map(renderDeckCardBack).map((n, i) => {
//         n.style.gridColumn = (i + 1).toString();
//         n.style.gridRow = "1";
//         return n;
//     });

//     replaceChildren(drawPileEl, es);
// }

// function renderDiscardPile(h: Card[]) {
//     const es = h.map(renderDeckCard).map((n, i) => {
//         n.style.gridColumn = (i + 1).toString();
//         n.style.gridRow = "1";
//         return n;
//     });

//     replaceChildren(discardPileEl, es);
// }

type Attrs = {class: string, style: string}
type Vnode = Mithril.Vnode<Attrs, any>;

function mkHandCard(c: Card): Vnode {
    const v = m("div", {class: "hand-card", style: ""}, c.name);
    return v;
}
function translate(v: Vnode, {x, y}: Position): Vnode {
    v.attrs.style = `transform: translate(${x}px, ${y}px)`;
    return v;
}

function mkCardPile(cs: Card[], {x, y}: Position) {
    const vs = cs.map(mkHandCard)
        .map((c, i) => translate(c, {x: x + i * 12, y: y}))
    return vs;
}
function mkCardHand(cs: Card[], {x, y}: Position) {
    const vs = cs.map(mkHandCard)
        .map((c, i) => translate(c, {x: x + i * 64, y: y}))
    return vs;
}

export function renderState(s: GameState) {
    // grid
    // removeChildren(battleGridEl);
    // battleGridEl.style.gridTemplateRows = `repeat(${s.height}, 64px)`;
    // battleGridEl.style.gridTemplateColumns = `repeat(${s.width}, 64px)`;

    // const es = [...s.enemies, ...s.cardsInPlay].map((e) => drawEnt(e, s.height));
    // es.forEach((e) => battleGridEl.appendChild(e));

    // // hand
    // renderHand(s.hand);

    // // draw pile
    // renderDrawPile(s.drawPile);

    // // discard pile
    // renderDiscardPile(s.discardPile);

    // // mithril ?
    
    // // ((window as any).m as Mithril).render(document.body, "hello world");   
    // // diffhtml ?
    // // m.render(document.body, "hello world");    
    // // let r = m("div", "foo")

    // const cs = s.hand
    //     .map(mkHandCard)
    //     .map((c, i) => translate(c, {x: i * 24, y: 64 * turn}))
    const drawPile = mkCardPile(s.drawPile, {x: 24, y: 24})
    const handPile = mkCardHand(s.hand, {x: 64, y: 148})
    const discardPile = mkCardPile(s.discardPile, {x: 424, y: 24})
    const allCards = [...drawPile, ...handPile, ...discardPile]
    m.render(playAreaEl, allCards);
}

// helpers
function removeChildren(n: Node) {
    while (n.firstChild) {
        n.removeChild(n.firstChild);
    }
}

function replaceChildren(el: Node, children: Node[]) {
    removeChildren(el);
    children.forEach((c) => el.appendChild(c));
}