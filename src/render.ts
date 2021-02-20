import { Card, Cell, Enemy, Grid } from './main.js'

console.log("hello 2");

let battleGrid = document.getElementById("battle-grid") as HTMLDivElement;

function removeChildren(n: Node) {
    while (n.firstChild) {
        n.removeChild(n.firstChild)
    }
}

function drawCell(c: Cell, x: number, y: number) {
    let content = "";
    if (c instanceof Card)
        content = "card"
    else if (c instanceof Enemy)
        content = "enemy"
        
    const n = document.createElement("div");
    n.classList.add("battle-cell")
    n.style.background = "#333A"
    n.style.gridColumn = (x + 1).toString()
    n.style.gridRow = (y + 1).toString()
    n.innerText = content;
    return n;
}

export function renderGrid(g: Grid) {
    // TODO splat to html
    console.log("renderGrid")

    removeChildren(battleGrid)

    for (let x = 0; x < g.width; x++) {
        for (let y = 0; y < g.height; y++) {
            const c = drawCell(g.columns[x][y], x, y)
            battleGrid.appendChild(c)
        }
    }
}