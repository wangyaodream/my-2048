// Constant
CANVAS_SIZE = 600;
CANVAS_BACKGROUD_COLOR = "333333";
BLOCK_SIZE = 130;
GAME_SIZE = 4;
PADDING_SIZE = (CANVAS_SIZE - GAME_SIZE * BLOCK_SIZE) / 5

BLOCK_PLACEHOLDER_COLOR = "555555";
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

    shiftBlock(arr, reverse = false) {
        let head = 0;
        let tail = 1;
        let incr = 1;
        if (reverse == true) {
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }

        while (tail >= 0 && tail < arr.length) {
            if (arr[tail] == null) {
                tail += incr;
            } else {
                if (arr[head] == null) {
                    arr[head] = arr[tail];
                    arr[tail] = null;
                    tail += incr; 
                } else if (arr[head] == arr[tail]) {
                    // 进行撞击并增加值
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    head += incr;
                    tail += incr;
                } else {
                    head += incr;
                    if (head == tail) {
                        tail += incr;
                    }
                }
            }
        }
    }

    // command in ["left", "right", "up", "down"]
    advance(command) {
        let reverse = (command == "right" || command == "down");
        if (command == "left" || command == "right") {
            // 如果是左和右直接调用shiftBlock
            for (let i = 0; i < GAME_SIZE; i++) {
                this.shiftBlock(this.data[i], reverse);
            }
        } else if (command == "up" || command == "down") {

            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j]);
                }
                this.shiftBlock(tmp, reverse);
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i];
                }
            }

        }

        // 每次操作完成时应该生成一个新的block
        this.generateNewBlock();

    }
}

// Tests
class Test {
    static compareArray(arr1, arr2) {
        if (arr1.length != arr2,this.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }

        return true;
    }

    static test_shiftBlock() {
        let gameTest = new Game()
        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[null, null, null, null], [null, null, null, null]],
            [[4, 8, 8, null], [4, 16, null, null]],
        ]
        let errorFlag = false;

        for (let test of testCases) {
            for (let reverse of [true, false]) {
                let input = test[0].slice();
                let result = test[1].slice();
                if (reverse == true) {
                    input.reverse();
                    result.reverse();
                }

                gameTest.shiftBlock(input, reverse);
                if (!Test.compareArray(input, result)) {
                    errorFlag = true;
                    console.log("ERROR");
                    console.log(reverse);
                    console.log(input, result);
                }
            }
        }

        if (!errorFlag) {
            console.log("Pass!");
        }

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

    gridToPosition(i, j) {
        let top = i * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;
        let left = j * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;

        return [top, left]
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
        let position = this.gridToPosition(row, col);
        block.style.width = BLOCK_SIZE;
        block.style.height = BLOCK_SIZE;
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = position[0];
        block.style.left = position[1];
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR);
        span.appendChild(text);
        block.appendChild(span);

        // 将文本内容剧中
        span.style.position = "absolute";
        span.style.top = (BLOCK_SIZE - span.offsetHeight) / 2;
        span.style.left = (BLOCK_SIZE - span.offsetWidth) / 2;
    }
}

// Controller
var container = document.getElementById("game-container");
var game = new Game();
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    if (event.key == "ArrowLeft") {
        game.advance("left");
    } else if (event.key == "ArrowRight") {
        game.advance("right");
    } else if (event.key == "ArrowUp") {
        game.advance("up");
    } else {
        game.advance("down");
    }
    view.drawGame();
}
