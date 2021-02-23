import { Card, Enemy, GameState, getNextId, onCardClick, onGridClick, Position, Size } from "./main.js";
import * as Mithril from './mithril.js'
const m = (window as any).m as Mithril.Static;

console.log("hello from render.ts");

export const playAreaEl = document.getElementById("play-area") as HTMLDivElement;

interface Transform {
    scaleX?: number,
    scaleY?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    turn?: number,
}
interface Renderable {
    tag: string,
    class?: string,
    style?: string,
    transform?: Transform,
    key?: number,
    onclick?: (e: MouseEvent) => void,
    content?: string | Renderable[],
}

function mkDeckCard(c: Card): Renderable {
    const v: Renderable = {
        tag: "div", class: "hand-card", transform: {
            width: cardSize.width,
            height: cardSize.height,
        }, style: ``, key: c.id,
        content: [
            {tag: "div", content: c.id+""}
        ]
    }
    return v;
}

// TODO: TransformBuilder
const placeStr = ({ x, y }: Position) => `translate(${x}px, ${y}px)`;
const rotStr = (turn: number) => `rotate(${turn}turn)`;
const scaleXStr = (x: number) => `scaleX(${x})`;
const place = (r: Transform, { x, y }: Position) => {
    return {
        ...r,
        x, y
    }
}
const rot = (r: Transform, turn: number) => {
    return {
        ...r,
        turn
    }
}
const scaleX = (r: Transform, scaleX: number) => {
    return {
        ...r,
        scaleX: (r?.scaleX || 1.0) * scaleX
    }
}
const scaleY = (r: Transform, scaleY: number) => {
    return {
        ...r,
        scaleY: (r?.scaleY || 1.0) * scaleY
    }
}
const scale = (r: Transform, x: number, y: number) => {
    return scaleY(scaleX(r, x), y)
}

function transformToStr(t?: Transform): string {
    let s = ""
    if (t?.width)
        s += ` width: ${t?.width}px; `
    if (t?.height)
        s += ` height: ${t?.height}px; `
    let st = ""
    {
        if (t?.x)
            st += ` translateX(${t?.x}px) `
        if (t?.y)
            st += ` translateY(${t?.y}px) `
        if (t?.turn)
            st += ` rotate(${t?.turn}turn) `
        if (t?.scaleX)
            st += ` scaleX(${t?.scaleX}) `
        if (t?.scaleY)
            st += ` scaleY(${t?.scaleY}) `
    }
    if (st)
        s += ` transform: ${st};`
    return s;
}

let _randRots: {[id: number]: number} = {}
let getRandRot = (id: number, turnRange: number) => {
    const idx = id + turnRange;
    if (!id)
        return Math.random() - 0.5
    if (!_randRots[idx])
        _randRots[idx] = (Math.random() - 0.5) * turnRange
    return _randRots[idx]
}

function mkCardPile(cs: Card[], { x, y }: Position, faceDown = false, rotRange = 1.0) {
    const rotStep = 0.05;
    // const rotStep = rotRange / cs.length;
    const vs = cs.map(mkDeckCard)
        .map((c, i) => {
            c.transform = place(c.transform!, { x: x + i * 2 - (cs.length - 1) * 0.5 * 2 - cardSize.width * 0.5, y: y });
            c.transform = rot(c.transform, getRandRot(c.key || 0, rotRange));
            // rot(rotStep * i),
            if (faceDown)
                c.transform = scaleX(c.transform, -1.0);
            // rot(-0.5*rotRange + rotStep * i)
            return c;
        })
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
        .map((c, i) => {
            c.transform = place(c.transform!, { x: x + i * (cardSize.width + 4), y: y + curve(i) });
            if (cs.length > 1)
                c.transform = rot(c.transform, -0.5*rotRange + rotStep * i);
            c.transform = scale(c.transform, 1.5, 1.5);
            return c
        })
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
        onclick: (e) => {
            e.stopPropagation()
            onGridClick({x, y})
        },
        content: [
            {tag: "div", content: ""}
        ],
        transform: place({}, toGridPx({x, y})),
    }
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


function getPlayAreaBox(): Size & Position {
    return playAreaEl.getBoundingClientRect();
}

let gridBox: Size & Position;
let gridRowColCount: Size;
let centerX: number;
let playAreaBox: Size & Position;
const cardSize = {width: 120 * 0.7, height: 220 * 0.7};
let cardsY: number;
export function initRenderer(s: GameState) {
    playAreaBox = getPlayAreaBox()

    centerX = playAreaBox.width * 0.5;

    // determine grid placement
    gridRowColCount = {width: s.width, height: s.height};
    const width = (gridSize + gridPad) * s.width
    const height = (gridSize + gridPad) * s.height
    gridBox = {x: centerX - width * 0.5, y: 24, width, height}

    getGridSquares(gridRowColCount);

    // hand placement
    cardsY = gridBox.y + gridBox.height + cardSize.height + 4;
}

const gridPad = 2;
function toGridPx({x, y}: Position): Position {
    return { x: gridBox.x + x * (gridSize + gridPad), y: gridBox.y + (gridRowColCount.height - 1 - y) * (gridSize + gridPad)}
}

const gridSize = 68;
export function renderState(s: GameState) {
    // -- BOARD
    // player cards
    const inPlayCards = s.cardsInPlay.map(mkBoardCard)
        .map((c, i) => {
            const ent = s.cardsInPlay[i]
            c.transform = place(c.transform!, toGridPx(ent));
            return c
        })

    /// enemies
    const enemies = s.enemies.map(mkEnemy)
        .map((c, i) => {
            const ent = s.enemies[i]
            c.transform = place(c.transform!, toGridPx(ent));
            return c
        })
    
    // -- DECK
    // draw pile
    const drawPile = mkCardPile(s.drawPile, { x: cardSize.height * 0.6, y: cardsY }, true, 0.1)

    // hand
    const handWidth = s.hand.length * (cardSize.width + 4);
    const handPile = mkCardHand(s.hand, { x: centerX - handWidth*0.5, y: cardsY })
    // selected card
    handPile.filter(c => c.key === s.selected?.id)
        .forEach(c => {
            c.class += " selected"
        })
    // highlight grid
    let grid: Renderable[] = []
    if (s.selected)
        grid = getGridSquares(s)

    // discard pile
    const discardPile = mkCardPile(s.discardPile, { x: playAreaBox.width - cardSize.height * 0.6, y: cardsY }, false, 1.0)

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
    
    const style = v.style + " " + transformToStr(v.transform);
    // console.dir(v)
    // console.dir(children)

    return m(v.tag, {class: v.class, style, key: v.key, onclick: v.onclick}, children)
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