let ctx, canvas, squareSize, board, matchBoard, boardFrameCoords, sidebarWidth;
let boardSize, popChainPointTable, insertPosition, colors, nextPiece;
let canvasPadding = 3;
let squareLineWidth = 2;
let boardFrameWidth = 2;
let boardLineWidth = 2;
let activePiece = null;
let actionOccupied = false;
let points = 0;
let movingDown = false;
let touchedActivePiece = false;
let touchMoved = false;


function setCanvasSize() {
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
}


function setSidebarWidth() {
    sidebarWidth = canvas.width / boardSize[0] * 1.1;
}


function setSquareSize() {
    let widthWithoutSidebar = canvas.width - sidebarWidth;
    if ((widthWithoutSidebar / boardSize[0]) * boardSize[1] > canvas.height - canvasPadding * 2) {
        squareSize = (canvas.height - canvasPadding * 2) / boardSize[1];
    }
    else {
        squareSize = widthWithoutSidebar / boardSize[0];
    }
}


function setBoardFrameCoords() {
    boardFrameCoords = {
        x: (canvas.width - (boardSize[0] * squareSize + sidebarWidth))/2,
        y: (canvas.height - boardSize[1] * squareSize + canvasPadding)/2
    };
}


function setGameVariables(
        _boardSize=[6, 12],
        _insertPosition=null,
        _popChainPointTable=[1, 8, 16, 32, 64, 128, 256, 512, 999],
        _colors=["Crimson", "DodgerBlue", "LimeGreen", "Gold", "MediumSlateBlue"]
    ) {
    boardSize = _boardSize;
    if (_insertPosition === null) insertPosition = [Math.floor((_boardSize[0]-1)/2), 0];
    else insertPosition = _insertPosition;
    popChainPointTable = _popChainPointTable;
    colors = _colors;
    nextPiece = generatePiece();
}


function setSizeVariables() {
    setCanvasSize();
    setSidebarWidth();
    setSquareSize();
    setBoardFrameCoords();
    ctx.font = (12 + canvas.height / 100) + "px Arial";
}


function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    setGameVariables();
    setSizeVariables();
    board = createBoard();
}


function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.lineWidth = squareLineWidth;
    ctx.fillRect(x, y, squareSize, squareSize);
}


function createBoard() {
    let board = []
    for (let i = 0; i < boardSize[0]; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize[1]; j++) {
            board[i][j] = 0;
        }
    }
    return board;
}


function drawPointCount(x, y) {
    ctx.fillStyle = "black";
    ctx.fillText("Pts: " + points,x, y);
}


function drawNextPiece(x, y) {
    ctx.fillStyle = "black";
    ctx.fillText("Next",x, y);
    drawSquare(x, y + 10, nextPiece.a.color);
    drawSquare(x, y + 10 + squareSize, nextPiece.b.color);
}


function drawSidebar() {
    let x = boardFrameCoords.x + boardSize[0] * squareSize + 10;
    let y = boardFrameCoords.y + 30;
    drawPointCount(x, y);
    drawNextPiece(x, y + 40);
}


function drawBoardFrame() {
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = boardFrameWidth;
    ctx.strokeRect(
        boardFrameCoords.x,
        boardFrameCoords.y,
        board.length * squareSize,
        board[0].length * squareSize
    );
    ctx.lineWidth = boardLineWidth;
    ctx.beginPath();
    for (let i = 1; i < board.length; i++) {
        let x = boardFrameCoords.x + squareSize * i;
        let startY = boardFrameCoords.y;
        let endY = boardFrameCoords.y + squareSize * board[0].length;
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let i = 1; i < board[0].length; i++) {
        let startX = boardFrameCoords.x;
        let endX = boardFrameCoords.x + squareSize * board.length;
        let y = boardFrameCoords.y + squareSize * i;
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();
}


function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}


function generatePiece() {
    let piece = {
        a: {
            piece: null,
            color: randomColor(),
            pos: [null, null],
        },
        b: {
            piece: null,
            color: randomColor(),
            pos: [null, null]
        },
        direction: "vertical",
        rotating: false
    };
    piece.a.piece = piece;
    piece.b.piece = piece;
    return piece;
}


function drawBoard(matches) {
    ctx.lineWidth = 0;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSidebar();
    drawBoardFrame();
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] !== 0) {
                if (typeof board[i][j] === "string") {
                    let coords = coordFromSquare(i, j);
                    drawSquare(coords[0], coords[1], board[i][j]);
                }
                else {
                    let coords = coordFromSquare(i, j);
                    let offSet = [0, 0];
                    let piece = board[i][j].piece;
                    if (piece.a === board[i][j]) {
                        if (piece.rotating) {
                            let offSetQualifier = postRotationOffsets(piece);
                            offSet = [offSetQualifier[0] * squareSize, offSetQualifier[1] * squareSize];
                            piece.rotating = false;
                        }
                    }
                    drawSquare(coords[0] + offSet[0], coords[1] + offSet[1], board[i][j].color)
                }
            }
        }
    }
    for (let i = 0; i < matches.length; i++) {
        let coords = coordFromSquare(matches[i][0], matches[i][1]);
        drawSquare(coords[0], coords[1], "black");
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function pressedLeft() {
    if (activePiece !== null) {
        attemptMovePiece(activePiece, "left");
    }
}


function pressedRight() {
    if (activePiece !== null) {
        attemptMovePiece(activePiece, "right");
    }
}


function pressedDown() {
    movingDown = true;
}


function liftedDown() {
    movingDown = false;
}


function postRotationOffsets(piece) {
    if (piece.direction === "vertical") {
        if (piece.a.pos[1] < piece.b.pos[1]) {
            return [-0.707, 0.293];
        }
        else {
            return [0.293, -0.707];
        }
    }
    else {
        if (piece.a.pos[0] < piece.b.pos[0]) {
            return [0.293, 0.293];
        }
        else {
            return [-0.707, -0.707];
        }
    }
}


function pointSound(effectNum) {
    let sfx = new Audio("sounds/pop" + effectNum + ".wav");
    sfx.volume = 0.3;
    sfx.play();
}


function soundByPoints(chain) {
    pointSound(Math.min(7, chain+1));
}


function calculatePoints(pops, popChain) {
    if (popChain > popChainPointTable.length-1) {
        popChain = popChainPointTable.length-1;
    }
    return pops * 10 * popChainPointTable[popChain];
}


function formatPointIncrement(pops, popChain) {
    return pops * 10 + "x" + popChainPointTable[popChain];
}