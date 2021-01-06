

class Marble {
    constructor(x, y, radius, color = undefined) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    set(color) {
        this.color = color
    }

    invisible() {
        return this.color == undefined
    }

    render() {
        if (this.invisible()) return

        push()
        fill(this.color)
        ellipse(this.x, this.y, this.radius, this.radius)
        pop()
    }
}

class Cell {
    constructor(x, y, length) {
        this.x = x
        this.y = y
        this.length = length
        this.background = 'white'
        this.marble = new Marble(this.x, this.y, .6 * this.length)
    }

    clear() {
        this.marble = new Marble(this.x, this.y, .6 * this.length)
        console.log(`{${this.x / 80}, ${this.y / 80}} has been cleared`)
    }

    render() {
        this.mouseEvents()
        push()
        fill(this.background)
        rect(this.x, this.y, this.length, this.length)
        pop()
        this.marble.render()
    }

    set(color) {
        this.marble.set(color)
    }

    color() {
        return this.marble.color;
    }

    equipped() {
        return this.color() != undefined
    }

    mouseEvents() {
        if (this.x - this.length / 2 < mouseX && mouseX < this.x + this.length / 2 &&
            this.y - this.length / 2 < mouseY && mouseY < this.y + this.length / 2) {
            this.background = 'gray'

            if (mouseIsPressed) {
                game.putMarble(Math.floor(this.x / this.length), Math.floor(this.y / this.length))
            }
        } else {
            this.background = 'white'
        }
    }
}


class Game {
    constructor() {
        this.turn = 0
        this.initGrid()
        this.running = true
        this.playerA = 'red'
        this.playerB = 'blue'
        this.panic = false
    }

    initGrid() {
        let offset = 80;

        this.grid = Array.from(Array(5), () => new Array(5))
        for(let i = 0; i < 5; i++) {
            for(let j = 0; j < 5; j++) {
                this.grid[i][j] = new Cell(i * offset + offset / 2, j * offset + offset / 2, offset)
            }
        }
    }

    run() {
        if (this.running) {
            this.render()
            this.panicky()
        } else {
            push()
            fill(this.turn & 1 ? this.playerA : this.playerB)
            rect(200, 200, 400, 400)
            pop()
        }
    }

    panicky() {
        if (this.panic && this.turn % 5 == 0) return

        if (this.turn % 5 == 0) {
            this.panic = true
            this.removeRandomWay()
        } else {
            this.panic = false
        }
    }

    render() {
        for(let i = 0; i < 5; i++) {
            for(let j = 0; j < 5; j++) {
                this.grid[i][j].render()
            }
        }
    }

    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @return {Cell}
     */
    getCell(i, j) {
        return this.grid[i][j]
    }

    putMarble(i, j) {
        if (! this.running) return
        if (this.grid[i][j].equipped()) return

        this.grid[i][j].set(this.turn & 1 ? this.playerB : this.playerA)
        this.turn++

        if (this.check(i, j)) return this.over(this.turn & 1 ? this.playerA : this.playerB)
    }

    over(player) {
        this.running = false
        console.log(`Gameover, ${player} won the game!`)
    }

    removeRandomWay() {
        let i = Math.floor(Math.random() * 5) % 5
        let x = Math.floor(Math.random() * 3) % 3 - 1
        let y = x == 0 ? (Math.random() > 1 ? -1 : 1) : (Math.floor(Math.random() * 3) % 3 - 1)
        let j

        if (i == 0 || i == 4) {
            j = Math.floor(Math.random() * 5) % 5
        } else {
            j = Math.random() > 1 ? 0 : 4
        }

        this.clearTheWay(i % 5, j % 5, x, y)
    }

    clearTheCell(i, j) {
        this.grid[i][j].clear()
    }

    clearTheWay(i, j, x, y) {
        while(0 <= i && i < 5 && 0 <= j && j < 5) {
            this.clearTheCell(i, j)
            i += x
            j += y
        }
    }

    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @param {Number} _i 
     * @param {Number} _j 
     * @return {Boolean}
     */
    areSame(i, j, _i, _j) {
        return this.getCell(i, j).color() == this.getCell(_i, _j).color()
    }

    check(i, j) {
        // y-axis
        if (
            i-2 >= 0 && this.areSame(i, j, i-1, j) && this.areSame(i, j, i-2, j)
        ) return true

        if (
            i-1 >= 0 && i+1 < 5 && this.areSame(i, j, i-1, j) && this.areSame(i, j, i+1, j)
        ) return true

        if (
            i+2 < 5 && this.areSame(i, j, i+1, j) && this.areSame(i, j, i+2, j)
        ) return true


        // x-axis
        if (
            j-2 >= 0 && this.areSame(i, j, i, j-1) && this.areSame(i, j, i, j-2)
        ) return true

        if (
            j-1 >= 0 && j+1 < 5 && this.areSame(i, j, i, j-1) && this.areSame(i, j, i, j+1)
        ) return true

        if (
            j+2 < 5 && this.areSame(i, j, i, j+1) && this.areSame(i, j, i, j+2)
        ) return true

        // /
        if (
            i-2 >= 0 && j+2 < 5 && this.areSame(i, j, i-2, j+2) && this.areSame(i, j, i-1, j+1)
        ) return true

        if (
            i-1 >= 0 && j+1 < 5 && i+1 < 5 && j-1 >= 0 && this.areSame(i, j, i-1, j+1) && this.areSame(i, j, i+1, j-1)
        ) return true

        if (
            i+2 < 5 && j-2 >= 0 && this.areSame(i, j, i+2, j-2) && this.areSame(i, j, i+1, j-1)
        ) return true

        // \
        if (
            i-2 >=0 && j-2 >= 0 && this.areSame(i, j, i-2, j-2) && this.areSame(i, j, i-1, j-1)
        ) return true

        if (
            i-1 >= 0 && j-1 >= 0 && i+1 < 5 && j+1 < 5 && this.areSame(i, j, i-1, j-1) && this.areSame(i, j, i+1, j+1)
        ) return true

        if (
            i+2 < 5 && j+2 < 5 && this.areSame(i, j, i+2, j+2) && this.areSame(i, j, i+1, j+1)
        ) return true
    }
}

let game = new Game();

function setup() {
    ellipseMode(CENTER)
    rectMode(CENTER)
    createCanvas(400, 400)
}
  
function draw() {
    background('white')
    game.run()
}