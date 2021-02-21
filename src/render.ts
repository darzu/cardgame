import { Card, Enemy, GameState } from './main.js'

console.log("hello 2");

let battleGrid = document.getElementById("battle-grid") as HTMLDivElement;

function removeChildren(n: Node) {
    while (n.firstChild) {
        n.removeChild(n.firstChild)
    }
}

function drawEnt(c: Card | Enemy, height: number) {
    let content = "";
    if (c instanceof Card)
        content = `${c.name} h${c.health}`
    else if (c instanceof Enemy)
        content = `${c.name} h${c.health}`
        
    const n = document.createElement("div");
    n.classList.add("battle-cell")
    n.style.background = "#333A"
    n.style.gridColumn = (c.x + 1).toString()
    n.style.gridRow = (height - c.y + 1).toString()
    n.innerText = content;
    return n;
}

export function renderState(s: GameState) {
    // TODO splat to html
    console.log("renderState")

    // console.dir({s})

    removeChildren(battleGrid)
    battleGrid.style.gridTemplateRows = `repeat(${s.height}, 64px)`
    battleGrid.style.gridTemplateColumns = `repeat(${s.width}, 64px)`

    const es = [...s.enemies, ...s.cardsInPlay].map(e => drawEnt(e, s.height))
    es.forEach(e => battleGrid.appendChild(e))

    // for (let x = 0; x < g.width; x++) {
    //     for (let y = 0; y < g.height; y++) {
    //         const c = drawCell(g.columns[x][y], x, g.height - 1 - y)
    //         battleGrid.appendChild(c)
    //     }
    // }
}