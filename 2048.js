// Constant
CANVAS_SIZE = 600;
CANVAS_BACKGROUD_COLOR = "333333";
GAME_SIZE = 4;

BLOCK_SIZE = 150;
BLOCK_PLACEHOLDER_COLOR = "555555";
BLOCK_PADDING = 10;
BLOCK_BACKGROUND_COLOR = "664455";

// Global Utility Functions
randInt = function(a, b) {
    return a + Math.floor(Math.random() * (b + 1 - a));
}

randChoice = function(arr) {
    return arr[randInt(0, arr.length - 1)];
}

// Model
class Game {
    constructor() {
        this.data = [];
        this.initializeData();
    }

    initializeData() {
        this.data = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                tmp.push(null);
            }
            this.data.push(tmp);
        }

        this.generateNewBlock();
        this.generateNewBlock();
    }

    generateNewBlock() {
        let possiblePositions = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.data[i][j] == null) {
                    // 记录下所有可生成的坐标
                    possiblePositions.push([i, j]);
                }
            }
        }

        let position = randChoice(possiblePositions);
        // console.log(position);
        this.data[position[0]][position[1]] = 2;
    }
}

// View
class View {
    constructor(game, container) {
        this.game = game
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUD_COLOR;
        this.container.style.position = "relative";
        this.container.style.display = "inline-block";
    }

    drawGame() {
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                if (this.game.data[i][j]) {
                this.drawBlock(i, j, this.game.data[i][j]);
                }
            }
        }
    }

    drawBackgroundBlock(row, col, color) {
        let block = document.createElement("div");
        block.style.width = BLOCK_SIZE - BLOCK_PADDING * 2;
        block.style.height = BLOCK_SIZE - BLOCK_PADDING * 2;
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = row * (BLOCK_SIZE) + (BLOCK_PADDING / 2);
        block.style.left = col * (BLOCK_SIZE) + (BLOCK_PADDING / 2);
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR);
        span.appendChild(text);
        span.style.fontSize = 80;
        span.style.textAlign = "center";
        block.appendChild(span);
        block.style.textAlign = "center";
        
    }
}

// Controller
var container = document.getElementById("game-container");
var game = new Game();
var view = new View(game, container);
view.drawGame();
