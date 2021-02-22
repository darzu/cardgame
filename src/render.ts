import { Card, Enemy, GameState, Position } from "./main.js";
import * as Mithril from './mithril.js'
const m = (window as any).m as Mithril.Static;

console.log("hello from render.ts");

let playAreaEl = document.getElementById("play-area") as HTMLDivElement;

type Attrs = { class: string, style: string, key: string }
type Vnode<A> = Mithril.Vnode<A>;

function mkHandCard(c: Card): Vnode<Attrs> {
    const v = m("div", { class: "hand-card", style: "", key: c.id, "data-key": c.id }, c.id);
    return v;
}
const place = ({ x, y }: Position) => `translate(${x}px, ${y}px)`;
const rot = (turn: number) => `rotate(${turn}turn)`;
const scaleX = (x: number) => `scaleX(${x})`;
function transform<A extends Attrs>(v: Vnode<A>, ...ops: string[]): Vnode<A> {
    v.attrs.style += "transform: " + ops.join(" ") + ";"
    return v;
}

function mkCardPile(cs: Card[], { x, y }: Position, faceDown = false) {
    const rotRange = 0.5;
    const rotStep = 0.05;
    // const rotStep = rotRange / cs.length;
    const vs = cs.map(mkHandCard)
        .map((c, i) => transform(c,
            place({ x: x + i * 2, y: y }),
            rot(rotStep * i),
            faceDown ? scaleX(-1) : ''
            // rot(-0.5*rotRange + rotStep * i)
        ))
    return vs;
}
function mkCardHand(cs: Card[], { x, y }: Position) {
    const curve = (x: number) => ((x - (cs.length - 1)*0.5) * 3)**2 - ((cs.length - 1)*0.5*3)**2

    const rotRange = 0.1;
    const rotStep = rotRange / (cs.length - 1);

    const vs = cs.map(mkHandCard)
        .map((c, i) => transform(c,
            place({ x: x + i * 64, y: y + curve(i) }),
            rot(-0.5*rotRange + rotStep * i)
        ))
    return vs;
}

function mkBoardCard(c: Card): Mithril.Vnode<Attrs & {card: Card}> {
    const v = m("div", { class: "board-card", style: "", key: c.id, "data-key": c.id, card: c }, c.id);
    return v;
}
function mkEnemy(e: Enemy): Mithril.Vnode<Attrs & {enemy: Enemy}> {
    const v = m("div", { class: "enemy", style: "", key: e.id, "data-key": e.id, enemy: e }, e.id);
    return v;
}

export function renderState(s: GameState) {
    // board
    const gridStart = {x: 24, y: 24}
    const gridSize = 68;
    const inPlayCards = s.cardsInPlay.map(mkBoardCard)
        .map((c, i) => transform(c,
            place({ x: gridStart.x + c.attrs.card.x * gridSize, y: gridStart.y + (s.height - c.attrs.card.y) * gridSize}),
        ))
    const enemies = s.enemies.map(mkEnemy)
        .map((c, i) => transform(c,
            place({ x: gridStart.x + c.attrs.enemy.x * gridSize, y: gridStart.y + (s.height - c.attrs.enemy.y) * gridSize}),
        ))
    
    // cards
    const pileWidth = 170;
    const drawPile = mkCardPile(s.drawPile, { x: 40, y: 420 }, true)
    const maxHandWidth = 5 * 64;
    const handWidth = s.hand.length * 64;
    const handPile = mkCardHand(s.hand, { x: pileWidth + maxHandWidth*0.5 - handWidth*0.5, y: 420 })
    const discardPile = mkCardPile(s.discardPile, { x: 170 + 5 * 64 + 70, y: 420 })
    const allDeckCards = [...drawPile, ...handPile, ...discardPile]

    // render
    const all = [...allDeckCards, ...inPlayCards, ...enemies];
    renderAll(all);
}

let _prevStyles: {[key: string]: string} = {}
function renderAll(vs: Vnode<any>[]) {
    // we want to have smooth CSS animations even with DOM re-ordering.
    // Mithril will ensure the DOM element stays the same during a re-order,
    // but CSS animations won't happen after a re-order. So we fix this by
    // doing a 2-phase update: 
    //      first we render the elements re-ordered but with their old style
    //      second we render the elements in the new order with their new style
    // TODO: we could optimize this to only double-render re-ordered items

    // render old styles in new order
    let pvs = vs
        .map(cloneV)
        .map(v => {
            const s = _prevStyles[v.key+""]
            if (s)
                v.attrs.style = s
            return v;
        })
    m.render(playAreaEl, pvs);

    setTimeout(() => {
        // render new styles in new order
        m.render(playAreaEl, vs);

        _prevStyles = vs
            .filter(v => v.key)
            .toDict(v => v.key+"", v => v.attrs.style)
    });
}

// helpers
function cloneV<A>(v: Vnode<A>): Vnode<A> {
    return m(v.tag as string, {...v.attrs}, Array.isArray(v.children) ? [...v.children] : v.children)
}

function removeChildren(n: Node) {
    while (n.firstChild) {
        n.removeChild(n.firstChild);
    }
}

function replaceChildren(el: Node, children: Node[]) {
    removeChildren(el);
    children.forEach((c) => el.appendChild(c));
}

// array helpers
Object.defineProperty(Array.prototype, 'toDict', {
    value: function<T, V>(key: (t: T) => string, val: (t: T) => V): {[key: string]: V} {
        const d: {[key: string]: V} = {};
        (this as unknown as T[]).forEach(t => d[key(t)] = val(t));
        return d;
    }
});
declare global {
    interface Array<T> {
        toDict<V>(key: (t: T) => string, val: (t: T) => V): {[key: string]: V};
    }
}