import { Card, Enemy, GameState, getNextId, onCardClick, Position, Size } from "./main.js";
import * as Mithril from './mithril.js'
const m = (window as any).m as Mithril.Static;

console.log("hello from render.ts");

export const playAreaEl = document.getElementById("play-area") as HTMLDivElement;

interface Renderable {
    tag: string,
    class?: string,
    style?: string,
    key?: number,
    onclick?: (e: MouseEvent) => void,
    content?: string | Renderable[],
}

function mkDeckCard(c: Card): Renderable {
    const v: Renderable = {
        tag: "div", class: "hand-card", style: "", key: c.id,
        content: [
            {tag: "div", content: c.id+""}
        ]
    }
    return v;
}

// TODO: TransformBuilder
const place = ({ x, y }: Position) => `translate(${x}px, ${y}px)`;
const rot = (turn: number) => `rotate(${turn}turn)`;
const scaleX = (x: number) => `scaleX(${x})`;
function transform(v: Renderable, ...ops: string[]): Renderable {
    v.style = (v.style || "") + "transform: " + ops.join(" ") + ";"
    return v;
}

let _randRots: {[id: number]: number} = {}
let getRandRot = (id: number) => {
    if (!id)
        return Math.random() - 0.5
    if (!_randRots[id])
        _randRots[id] = Math.random() - 0.5
    return _randRots[id]
}

function mkCardPile(cs: Card[], { x, y }: Position, faceDown = false) {
    const rotRange = 0.5;
    const rotStep = 0.05;
    // const rotStep = rotRange / cs.length;
    const vs = cs.map(mkDeckCard)
        .map((c, i) => transform(c,
            place({ x: x + i * 2, y: y }),
            rot(getRandRot(c.key || 0)),
            // rot(rotStep * i),
            faceDown ? scaleX(-1) : ''
            // rot(-0.5*rotRange + rotStep * i)
        ))
    return vs;
}
function mkCardHand(cs: Card[], { x, y }: Position) {
    const curve = (x: number) => ((x - (cs.length - 1)*0.5) * 3)**2 - ((cs.length - 1)*0.5*3)**2

    const rotRange = 0.1;
    const rotStep = rotRange / (cs.length - 1);

    const vs = cs.map(mkDeckCard)
        .map((c, i) => {
            c.class += " in-hand";
            c.onclick = (e) => {
                e.stopPropagation()
                onCardClick(cs[i])
            };
            return c;
        })
        .map((c, i) => transform(c,
            place({ x: x + i * 64, y: y + curve(i) }),
            cs.length > 1 ? rot(-0.5*rotRange + rotStep * i) : ''
        ))
    return vs;
}

function mkBoardCard(c: Card): Renderable{
    const v: Renderable = {
        tag: "div", 
        class: "board-card", 
        style: "", 
        key: c.id, 
        content: c.id+"",
    }
    return v;
}
function mkEnemy(e: Enemy): Renderable {
    const v: Renderable = {
        tag: "div", 
        class: "enemy", 
        style: "", 
        key: e.id,
        content: e.id+"",
    };
    return v;
}

function mkGridSquare({x, y}: Position): Renderable{
    let v: Renderable = {
        tag: "div",
        class: "grid-square",
        style: "",
        key: getNextId(),
    }
    v = transform(v, 
        place({x: gridStart.x + gridSize * x, y: gridStart.y + gridSize * y})
    )
    return v
}

let _gridSquares: Renderable[];
function getGridSquares({width, height}: Size): Renderable [] {
    if (!_gridSquares) {
        _gridSquares = []
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                _gridSquares.push(mkGridSquare({x, y}))
            }
        }
    }
    return _gridSquares
}

export function initRenderer(s: Size) {
    getGridSquares(s);
}

const gridStart = {x: 24, y: 24}
const gridSize = 68;
export function renderState(s: GameState) {
    // -- BOARD

    // player cards
    const inPlayCards = s.cardsInPlay.map(mkBoardCard)
        .map((c, i) => {
            const ent = s.cardsInPlay[i]
            return transform(c,
                place({ x: gridStart.x + ent.x * gridSize, y: gridStart.y + (s.height - ent.y) * gridSize}),
            )
        })

    /// enemies
    const enemies = s.enemies.map(mkEnemy)
        .map((c, i) => {
            const ent = s.enemies[i]
            return transform(c,
                place({ x: gridStart.x + ent.x * gridSize, y: gridStart.y + (s.height - ent.y) * gridSize}),
            )
        })
    
    // -- DECK
    const pileWidth = 170;
    
    // draw pile
    const drawPile = mkCardPile(s.drawPile, { x: 40, y: 420 }, true)

    // hand
    const maxHandWidth = 5 * 64;
    const handWidth = s.hand.length * 64;
    const handPile = mkCardHand(s.hand, { x: pileWidth + maxHandWidth*0.5 - handWidth*0.5, y: 420 })
    // selected card
    handPile.filter(c => c.key === s.selected?.id)
        .forEach(c => c.class += " selected")
    // highlight grid
    let grid: Renderable[] = []
    if (s.selected)
        grid = getGridSquares(s)

    // discard pile
    const discardPile = mkCardPile(s.discardPile, { x: 170 + 5 * 64 + 70, y: 420 })

    // all
    const allDeckCards = [...drawPile, ...handPile, ...discardPile]

    // render
    const all = [...allDeckCards, ...grid, ...inPlayCards, ...enemies];
    renderAll(all);
}

function mkVnode(v: Renderable): Mithril.Vnode<any> | string {
    if (typeof v === "string")
        return v;
    const children = Array.isArray(v.content)
        ? v.content.map(mkVnode)
        : v.content || ""
    // console.dir(v)
    // console.dir(children)

    return m(v.tag, {class: v.class, style: v.style, key: v.key, onclick: v.onclick}, children)
}

function renderAll(vs: Renderable[]) {
    vs = vs.sort((a, b) => (a.key as number) - (b.key as number));
    const rs = vs.map(mkVnode)
    m.render(playAreaEl, rs);
}

// helpers
function cloneV<A>(v: Mithril.Vnode<A>): Mithril.Vnode<A> {
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