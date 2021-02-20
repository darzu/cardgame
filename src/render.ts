import { Card, Cell, Enemy, Grid } from './main.js'

console.log("hello 2");

function drawCell(c: Cell, x: number, y: number) {
    let content = "";
    if (c instanceof Card)
        content = "card"
    else if (c instanceof Enemy)
        content = "enemy"
        
    return `<div class="battle-cell" style="background: #333A; grid-column: ${x+1}; grid-row: ${y+1};" >${content}</div>`
}

export function renderGrid(g: Grid) {
    // TODO splat to html
    console.log("renderGrid")
    for (let x = 0; x < g.width; x++) {
        for (let y = 0; y < g.height; y++) {
            const c = drawCell(g.columns[x][y], x, y)
        }
    }
}