// Constant
CANVAS_SIZE = 600;
CANVAS_BACKGROUD_COLOR = "D4DFE6";
BLOCK_SIZE = 130;
GAME_SIZE = 4;
PADDING_SIZE = (CANVAS_SIZE - GAME_SIZE * BLOCK_SIZE) / 5

BLOCK_PLACEHOLDER_COLOR = "C4CFD6";
BLOCK_BACKGROUND_COLOR = "CADBE9";
BLOCK_FONT_COLOR = "444444";

FRAME_PRE_SECOND = 30;
AINMATION_TIME = 0.5;

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
        let moves = [];

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
                    moves.push([tail, head]);
                    tail += incr; 
                } else if (arr[head] == arr[tail]) {
                    // 进行撞击并增加值
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    moves.push([tail, head]);
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

        return moves;
    }

    // command in ["left", "right", "up", "down"]
    advance(command) {
        let reverse = (command == "right" || command == "down");
        let moves = [];
        if (command == "left" || command == "right") {
            // 如果是左和右直接调用shiftBlock
            for (let i = 0; i < GAME_SIZE; i++) {
                let rowMove = this.shiftBlock(this.data[i], reverse);
                for (let move of rowMove) {
                    moves.push([[i, move[0]], [i, move[1]]])
                }
            }
        } else if (command == "up" || command == "down") {

            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j]);
                }
                let colMove = this.shiftBlock(tmp, reverse);
                for (let move of colMove) {
                    moves.push([[move[0], j], [move[1], j]]);
                }
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i];
                }
            }

        }

        if (moves.length != 0) {
            // 每次操作完成时应该生成一个新的block
            this.generateNewBlock();
        }

        return moves;

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
        this.game = game;
        this.blocks = [];
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUD_COLOR;
        this.container.style.position = "relative";
        this.container.style.display = "inline-block";
        this.container.style.borderRadius = "5px";
        this.container.style.color = BLOCK_FONT_COLOR;
        this.container.zIndex = 1;
    }

    gridToPosition(i, j) {
        let top = i * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;
        let left = j * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;

        return [top, left]
    }

    animate(moves) {
        this.doFrame(moves, 0, AINMATION_TIME);
    }

    doFrame(moves, currTime, totalTime) {
        if (currTime < totalTime) {
            // 画动画
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PRE_SECOND, totalTime)
            }, 1 / FRAME_PRE_SECOND * 1000)

            for (let move of moves) {
                // move -> [[x1, y1], [x2, y2]]
                let block = this.blocks[move[0][0]][move[0][1]];

                let origin = this.gridToPosition(move[0][0], move[0][1]);
                let destination = this.gridToPosition(move[1][0], move[1][1])
                let currPosition = [
                    origin[0] + currTime / totalTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totalTime * (destination[1] - origin[1])
                ]

                block.style.top = currPosition[0];
                block.style.left = currPosition[1];
            }
        } else {
            this.drawGame();
        }
    }

    drawGame() {
        // 擦除上次游戏的node
        this.container.innerHTML = "";
        this.blocks = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                let block = [];
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                if (this.game.data[i][j]) {
                    block = this.drawBlock(i, j, this.game.data[i][j]);
                }
                tmp.push(block);
            }

            this.blocks.push(tmp);
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
        block.style.borderRadius = "5px";
        this.container.zIndex = 3;
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR);
        span.appendChild(text);
        block.appendChild(span);
        block.style.zIndex = 5;

        // 将文本内容剧中
        span.style.position = "absolute";
        span.style.top = (BLOCK_SIZE - span.offsetHeight) / 2;
        span.style.left = (BLOCK_SIZE - span.offsetWidth) / 2;

        return block;
    }
}

// Controller
var container = document.getElementById("game-container");
var game = new Game();
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    let moves = null;
    if (event.key == "ArrowLeft") {
        moves = game.advance("left");
    } else if (event.key == "ArrowRight") {
        moves = game.advance("right");
    } else if (event.key == "ArrowUp") {
        moves = game.advance("up");
    } else if (event.key == "ArrowDown") {
        moves = game.advance("down");
    }
    if (moves.length > 0) {
        view.animate(moves);
    }
    // view.drawGame();
}
