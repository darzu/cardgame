import { getNextId, onCardClick, onGridClick } from "./main.js";
const m = window.m;
console.log("hello from render.ts");
export const playAreaEl = document.getElementById("play-area");
function mkDeckCard(c) {
    const v = {
        tag: "div", class: "hand-card", transform: {
            width: cardSize.width,
            height: cardSize.height,
        }, style: ``, key: c.id,
        content: [
            { tag: "div", content: c.id + "" }
        ]
    };
    return v;
}
const place = (r, { x, y }) => {
    return {
        ...r,
        x, y
    };
};
const rot = (r, turn) => {
    return {
        ...r,
        turn
    };
};
const scaleX = (r, scaleX) => {
    return {
        ...r,
        scaleX: (r?.scaleX || 1.0) * scaleX
    };
};
const scaleY = (r, scaleY) => {
    return {
        ...r,
        scaleY: (r?.scaleY || 1.0) * scaleY
    };
};
const scale = (r, x, y) => {
    return scaleY(scaleX(r, x), y);
};
function transformToStr(t) {
    let s = "";
    if (t?.width)
        s += ` width: ${t?.width}px; `;
    if (t?.height)
        s += ` height: ${t?.height}px; `;
    if (t?.zIndex)
        s += ` z-index: ${t?.zIndex}; `;
    let st = "";
    {
        if (t?.x)
            st += ` translateX(${t?.x}px) `;
        if (t?.y)
            st += ` translateY(${t?.y}px) `;
        if (t?.turn)
            st += ` rotate(${t?.turn}turn) `;
        if (t?.scaleX)
            st += ` scaleX(${t?.scaleX}) `;
        if (t?.scaleY)
            st += ` scaleY(${t?.scaleY}) `;
    }
    if (st)
        s += ` transform: ${st};`;
    return s;
}
let _randRots = {};
let getRandRot = (id, turnRange) => {
    const idx = id + turnRange;
    if (!id)
        return Math.random() - 0.5;
    if (!_randRots[idx])
        _randRots[idx] = (Math.random() - 0.5) * turnRange;
    return _randRots[idx];
};
function mkCardPile(cs, { x, y }, faceDown = false, rotRange = 1.0) {
    const rotStep = 0.05;
    // const rotStep = rotRange / cs.length;
    const vs = cs.map(mkDeckCard)
        .map((c, i) => {
        c.transform = place(c.transform, { x: x + i * 2 - (cs.length - 1) * 0.5 * 2 - cardSize.width * 0.5, y: y });
        c.transform = rot(c.transform, getRandRot(c.key || 0, rotRange));
        // rot(rotStep * i),
        if (faceDown)
            c.transform = scaleX(c.transform, -1.0);
        c.transform.zIndex = i;
        // rot(-0.5*rotRange + rotStep * i)
        return c;
    });
    return vs;
}
function mkCardHand(cs, { x, y }) {
    const curve = (x) => ((x - (cs.length - 1) * 0.5) * 3) ** 2 - ((cs.length - 1) * 0.5 * 3) ** 2;
    const rotRange = 0.1;
    const rotStep = rotRange / (cs.length - 1);
    const vs = cs.map(mkDeckCard)
        .map((c, i) => {
        c.class += " in-hand";
        c.onclick = (e) => {
            e.stopPropagation();
            onCardClick(cs[i]);
        };
        return c;
    })
        .map((c, i) => {
        c.transform = place(c.transform, { x: x + i * (cardSize.width + 4), y: y + curve(i) });
        if (cs.length > 1)
            c.transform = rot(c.transform, -0.5 * rotRange + rotStep * i);
        c.transform = scale(c.transform, 1.5, 1.5);
        c.transform.zIndex = i;
        return c;
    });
    return vs;
}
function mkBoardCard(c) {
    const v = {
        tag: "div",
        class: "board-card",
        style: "",
        key: c.id,
        content: c.id + "",
    };
    return v;
}
function mkEnemy(e) {
    const v = {
        tag: "div",
        class: "enemy",
        style: "",
        key: e.id,
        content: e.id + "",
    };
    return v;
}
function mkGridSquare({ x, y }) {
    let v = {
        tag: "div",
        class: "grid-square",
        style: "",
        key: getNextId(),
        onclick: (e) => {
            e.stopPropagation();
            onGridClick({ x, y });
        },
        content: [
            { tag: "div", content: "" }
        ],
        transform: place({}, toGridPx({ x, y })),
    };
    return v;
}
let _gridSquares;
function getGridSquares({ width, height }) {
    if (!_gridSquares) {
        _gridSquares = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                _gridSquares.push(mkGridSquare({ x, y }));
            }
        }
    }
    return _gridSquares;
}
function getPlayAreaBox() {
    return playAreaEl.getBoundingClientRect();
}
let gridBox;
let gridRowColCount;
let centerX;
let playAreaBox;
const cardSize = { width: 120 * 0.7, height: 220 * 0.7 };
let cardsY;
export function initRenderer(s) {
    playAreaBox = getPlayAreaBox();
    centerX = playAreaBox.width * 0.5;
    // determine grid placement
    gridRowColCount = { width: s.width, height: s.height };
    const width = (gridSize + gridPad) * s.width;
    const height = (gridSize + gridPad) * s.height;
    gridBox = { x: centerX - width * 0.5, y: 24, width, height };
    getGridSquares(gridRowColCount);
    // hand placement
    cardsY = gridBox.y + gridBox.height + cardSize.height + 4;
}
const gridPad = 2;
function toGridPx({ x, y }) {
    return { x: gridBox.x + x * (gridSize + gridPad), y: gridBox.y + (gridRowColCount.height - 1 - y) * (gridSize + gridPad) };
}
const gridSize = 68;
export function renderState(s) {
    // -- BOARD
    // player cards
    const inPlayCards = s.cardsInPlay.map(mkBoardCard)
        .map((c, i) => {
        const ent = s.cardsInPlay[i];
        c.transform = place(c.transform, toGridPx(ent));
        return c;
    });
    /// enemies
    const enemies = s.enemies.map(mkEnemy)
        .map((c, i) => {
        const ent = s.enemies[i];
        c.transform = place(c.transform, toGridPx(ent));
        return c;
    });
    // -- DECK
    // draw pile
    const drawPile = mkCardPile(s.drawPile, { x: cardSize.height * 0.6, y: cardsY }, true, 0.1);
    // hand
    const handWidth = s.hand.length * (cardSize.width + 4);
    const handPile = mkCardHand(s.hand, { x: centerX - handWidth * 0.5, y: cardsY });
    // selected card
    handPile.filter(c => c.key === s.selected?.id)
        .forEach(c => {
        c.class += " selected";
    });
    // highlight grid
    let grid = [];
    if (s.selected)
        grid = getGridSquares(s);
    // discard pile
    const discardPile = mkCardPile(s.discardPile, { x: playAreaBox.width - cardSize.height * 0.6, y: cardsY }, false, 1.0);
    // all
    const allDeckCards = [...drawPile, ...handPile, ...discardPile];
    // render
    const all = [...allDeckCards, ...grid, ...inPlayCards, ...enemies];
    renderAll(all);
}
function mkVnode(v) {
    if (typeof v === "string")
        return v;
    const children = Array.isArray(v.content)
        ? v.content.map(mkVnode)
        : v.content || "";
    const style = v.style + " " + transformToStr(v.transform);
    // console.dir(v)
    // console.dir(children)
    return m(v.tag, { class: v.class, style, key: v.key, onclick: v.onclick }, children);
}
function renderAll(vs) {
    vs = vs.sort((a, b) => a.key - b.key);
    const rs = vs.map(mkVnode);
    m.render(playAreaEl, rs);
}
// helpers
function cloneV(v) {
    return m(v.tag, { ...v.attrs }, Array.isArray(v.children) ? [...v.children] : v.children);
}
function removeChildren(n) {
    while (n.firstChild) {
        n.removeChild(n.firstChild);
    }
}
function replaceChildren(el, children) {
    removeChildren(el);
    children.forEach((c) => el.appendChild(c));
}
// array helpers
Object.defineProperty(Array.prototype, 'toDict', {
    value: function (key, val) {
        const d = {};
        this.forEach(t => d[key(t)] = val(t));
        return d;
    }
});
