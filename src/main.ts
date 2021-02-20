
class Position {
    x: number = 0
    y: number = 0
}

class Card {
    cost: number = 0;
    position: Position | null = null;

    bar(): boolean {
        return true;
    }

    baz = function(): number {
        return 0
    }
}

class Enemy {

}

class Grid {
    height: number = 3
    width: number = 5
    rows: (Card | Enemy | null)[][] = repeat(repeat(null, this.width), this.height)
}
class PeaShooter extends Card {
    cost: number = 1;
    health = 1;

    onturn(mypos: Position, grid: Grid) {
        for (let y = mypos.y - 1; y >= 0; y--) {
            let thing = grid.rows[y][mypos.x];
            if (thing) {
                thing.damage(1);
                break
            }
        }
    }
}


function main() {
    console.log("Hello, world!")

    let mainEl = document.getElementById("main") as HTMLDivElement;
    

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