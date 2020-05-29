let ctx, canvas, squareSize, board, matchBoard, boardFrameCoords, sidebarWidth;
let canvasPadding = 3;
let squareLineWidth = 2;
let boardFrameWidth = 2;
let boardLineWidth = 2;
let colors = ["Crimson", "DodgerBlue", "LimeGreen", "Gold", "MediumSlateBlue"];
let activePiece = null;
let actionOccupied = false;
let boardSize = [6, 12]
let insertPosition = [Math.floor((boardSize[0]-1)/2), 0];
let popChainPointTable = [1, 8, 16, 32, 64, 128, 256, 512, 999];
let points = 0;
let nextPiece = generatePiece();
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


function setSizeVariables() {
    console.log("settings size variables");
    setCanvasSize();
    setSidebarWidth();
    setSquareSize();
    setBoardFrameCoords();
    ctx.font = (12 + canvas.height / 100) + "px Arial";
}


function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
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
    ctx.lineWidth = boardFrameWidth;
    ctx.strokeRect(
        boardFrameCoords.x,
        boardFrameCoords.y,
        board.length * squareSize,
        board[0].length * squareSize
    );
    ctx.lineWidth = boardLineWidth;
    ctx.strokeStyle = "lightgray";
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


function insertPiece(piece) {
    piece.a.pos = [insertPosition[0], insertPosition[1]];
    piece.b.pos = [insertPosition[0], insertPosition[1]+1];
    board[piece.a.pos[0]][piece.a.pos[1]] = piece.a;
    board[piece.b.pos[0]][piece.b.pos[1]] = piece.b;
    return piece;
}


function coordFromSquare(x, y) {
    return [
        boardFrameCoords.x + squareSize * x,
        boardFrameCoords.y + squareSize * y
        ];
}


function squareOfCanvasCoord(x, y) {
    x -= boardFrameCoords.x
    y -= boardFrameCoords.y
    x = Math.floor(x / squareSize);
    y = Math.floor(y / squareSize);
    return [x, y];
}


function coordOnActivePiece(x, y) {
    let square = squareOfCanvasCoord(x, y);
    return (square[0] === activePiece.a.pos[0] && square[1] === activePiece.a.pos[1] ||
        square[0] === activePiece.b.pos[0] && square[1] === activePiece.b.pos[1]);
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


function movePiece(piece, direction) {
    board[piece.a.pos[0]][piece.a.pos[1]] = 0;
    board[piece.b.pos[0]][piece.b.pos[1]] = 0;
    switch (direction) {
        case "left":
            piece.a.pos[0] = piece.a.pos[0] - 1;
            piece.b.pos[0] = piece.b.pos[0] - 1;
            break;
        case "right":
            piece.a.pos[0] = piece.a.pos[0] + 1;
            piece.b.pos[0] = piece.b.pos[0] + 1;
            break;
        case "down":
            piece.a.pos[1] = piece.a.pos[1] + 1;
            piece.b.pos[1] = piece.b.pos[1] + 1;
            break;
    }
    board[piece.a.pos[0]][piece.a.pos[1]] = piece.a;
    board[piece.b.pos[0]][piece.b.pos[1]] = piece.b;
    return piece;
}


function closer(piece, direction) {
    switch (direction) {
        case "left":
            if (piece.a.pos[0] <= piece.b.pos[0]) return piece.a;
            else return piece.b;
        case "right":
            if (piece.a.pos[0] >= piece.b.pos[0]) return piece.a;
            else return piece.b;
        case "up":
            if (piece.a.pos[1] <= piece.b.pos[1]) return piece.a;
            else return piece.b
        case "down":
            if (piece.a.pos[1] >= piece.b.pos[1]) return piece.a;
            else return piece.b;
    }
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


function emptyInDirection(piece, direction) {
    switch (direction) {
        case "down":
            if (
                piece.direction === "horizontal" &&
                piece.a.pos[1] < boardSize[1] &&
                board[piece.a.pos[0]][piece.a.pos[1] + 1] === 0 &&
                board[piece.b.pos[0]][piece.b.pos[1] + 1] === 0
            ) return true;
            else {
                return (
                    piece.direction === "vertical" &&
                    closer(piece, "down").pos[1] < boardSize[1] &&
                    board[closer(piece, "down").pos[0]][closer(piece, "down").pos[1] + 1] === 0
                );
            }
        case "right":
            if (
                piece.direction === "horizontal" &&
                closer(piece, "right").pos[0] + 1 < boardSize[0] &&
                board[closer(piece, "right").pos[0] + 1][closer(piece, "right").pos[1]] === 0
            ) return true;
            else
                return (
                    piece.direction === "vertical" &&
                    piece.a.pos[0] + 1 < boardSize[0] &&
                    board[piece.a.pos[0] + 1][piece.a.pos[1]] === 0 &&
                    board[piece.b.pos[0] + 1][piece.b.pos[1]] === 0
                );
        case "left":
            if (
                piece.direction === "horizontal" &&
                closer(piece, "left").pos[0] > 0 &&
                board[closer(piece, "left").pos[0] - 1][closer(piece, "left").pos[1]] === 0
            ) return true;
            else
                return (
                    piece.direction === "vertical" &&
                    piece.a.pos[0] > 0 &&
                    board[piece.a.pos[0] - 1][piece.a.pos[1]] === 0 &&
                    board[piece.b.pos[0] - 1][piece.b.pos[1]] === 0
                );

    }
}


function emptyInDirectionSingle(piece, direction) {
    switch (direction) {
        case "up":
            return piece.pos[1] > 0;
        case "down":
            return (
                piece.pos[1] + 1 < boardSize[1] &&
                board[piece.pos[0]][piece.pos[1] + 1] === 0
            );
        case "right":
            return (
                piece.pos[0] + 1 < boardSize[0] &&
                board[piece.pos[0] + 1][piece.pos[1]] === 0
            );
        case "left":
            return (
                piece.pos[0] - 1 > 0 &&
                board[piece.pos[0] - 1][piece.pos[1]] === 0
            );
    }
}


function attemptMovePiece(piece, direction) {
    if (emptyInDirection(piece, direction)) {
        return movePiece(piece, direction);
    }
    else {
        return piece;
    }
}


function rotate(piece) {
    board[piece.a.pos[0]][piece.a.pos[1]] = 0;
    board[piece.b.pos[0]][piece.b.pos[1]] = 0;
    if (piece.direction === "vertical") {
        if (piece.a.pos[1] < piece.b.pos[1]) {
            if (emptyInDirection(piece, "right")) {
                piece.a.pos[0] = piece.a.pos[0] + 1;
                piece.a.pos[1] = piece.a.pos[1] + 1;
                piece.direction = "horizontal";
            }
            else {
                if (emptyInDirectionSingle(piece.a, "right")) {
                    piece.a.pos[0] = piece.a.pos[0] + 1;
                    piece.b.pos[1] = piece.b.pos[1] - 1;
                    piece.direction = "horizontal";
                }
                else if (emptyInDirectionSingle(piece.a, "left")) {
                    piece.b.pos[0] = piece.b.pos[0] - 1;
                    piece.b.pos[1] = piece.b.pos[1] - 1;
                    piece.direction = "horizontal";
                }
            }
        }
        else {
            if (emptyInDirection(piece, "left")) {
                if (emptyInDirection(piece, "down")) {
                    piece.a.pos[0] = piece.a.pos[0] - 1;
                    piece.a.pos[1] = piece.a.pos[1] - 1;
                    piece.direction = "horizontal";
                }
                else {
                    piece.a.pos[0] = piece.a.pos[0] - 1;
                    piece.b.pos[1] = piece.b.pos[1] + 1;
                    piece.direction = "horizontal";
                }
            }
            else {
                if (emptyInDirectionSingle(piece.b, "left")) {
                    piece.a.pos[0] = piece.a.pos[0] - 1;
                    piece.a.pos[1] = piece.a.pos[1] - 1;
                    piece.direction = "horizontal";
                }
                else if (emptyInDirectionSingle(piece.a, "right")) {
                    piece.b.pos[0] = piece.b.pos[0] + 1;
                    piece.b.pos[1] = piece.b.pos[1] + 1;
                    piece.direction = "horizontal";
                }
                else if (emptyInDirectionSingle(piece.b, "right")) {
                    piece.b.pos[0] = piece.b.pos[0] + 1;
                    piece.a.pos[1] = piece.a.pos[1] - 1;
                    piece.direction = "horizontal";
                }
            }
        }
    }
    else {
        if (piece.a.pos[0] < piece.b.pos[0]) {
            if (emptyInDirectionSingle(piece.b, "up")) {
                piece.a.pos[0] = piece.a.pos[0] + 1;
                piece.a.pos[1] = piece.a.pos[1] - 1;
                piece.direction = "vertical";
            }
            else if (emptyInDirectionSingle(piece.b, "down")) {
                piece.a.pos[0] = piece.a.pos[0] + 1;
                piece.b.pos[1] = piece.b.pos[1] + 1;
                piece.direction = "vertical";
            }
            else if (emptyInDirectionSingle(piece.a, "down")) {
                piece.b.pos[0] = piece.b.pos[0] - 1;
                piece.b.pos[1] = piece.b.pos[1] + 1;
                piece.direction = "vertical";
            }
        }
        else {
            if (emptyInDirectionSingle(piece.b, "down")) {
                piece.a.pos[0] = piece.a.pos[0] - 1;
                piece.a.pos[1] = piece.a.pos[1] + 1;
                piece.direction = "vertical";
            }
            else if (emptyInDirectionSingle(piece.b, "up")) {
                piece.a.pos[0] = piece.a.pos[0] - 1;
                piece.b.pos[1] = piece.b.pos[1] - 1;
                piece.direction = "vertical";
            }
        }
    }
    board[piece.a.pos[0]][piece.a.pos[1]] = piece.a;
    board[piece.b.pos[0]][piece.b.pos[1]] = piece.b;

    return piece;
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


function commitToBoard(piece) {
    board[piece.a.pos[0]][piece.a.pos[1]] = piece.a.color;
    board[piece.b.pos[0]][piece.b.pos[1]] = piece.b.color;
}


function insideBoard(coords) {
    return !(coords[0] < 0 || coords[0] > boardSize[0]-1 || coords[1] < 0 || coords[1] > boardSize[1]-1);
}


function checkNeighbors(origin, value) {
    let matches = [];
    matches.push(origin);
    matchBoard[origin[0]][origin[1]] = 1;
    if (insideBoard([origin[0]-1, origin[1]]) && matchBoard[origin[0]-1][origin[1]] === 0) {
        if (board[origin[0]-1][origin[1]] === value) {
            checkNeighbors([origin[0]-1, origin[1]], value, matchBoard).forEach(e => matches.push(e));
        }
    }
    if (insideBoard([origin[0]+1, origin[1]]) && matchBoard[origin[0]+1][origin[1]] === 0) {
        if (board[origin[0]+1][origin[1]] === value) {
            (checkNeighbors([origin[0]+1, origin[1]], value, matchBoard)).forEach(e => matches.push(e));
        }
    }
    if (insideBoard([origin[0], origin[1]-1]) && matchBoard[origin[0]][origin[1]-1] === 0) {
        if (board[origin[0]][origin[1]-1] === value) {
            (checkNeighbors([origin[0], origin[1]-1], value, matchBoard)).forEach(e => matches.push(e));
        }
    }
    if (insideBoard([origin[0], origin[1]+1]) && matchBoard[origin[0]][origin[1]+1] === 0) {
        if (board[origin[0]][origin[1]+1] === value) {
            (checkNeighbors([origin[0], origin[1]+1], value, matchBoard)).forEach(e => matches.push(e));
        }
    }
    return matches;
}


function findMatches() {
    matchBoard = createBoard();
    let matches = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === 0) {
                matchBoard[i][j] = 1;
            }
        }
    }
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (matchBoard[i][j] === 0) {
                let match = checkNeighbors([i, j], board[i][j], matchBoard);
                for (let k = 0; k < match.length; k++) {
                    matchBoard[match[k][0]][match[k][1]] = 1;
                }
                if (match.length >= 4) {
                    for (let k = 0; k < match.length; k++) {
                        matches.push(match[k]);
                    }
                }
            }
        }
    }
    return matches;
}


function popMatches(matches) {
    for (let i = 0; i < matches.length; i++) {
        board[matches[i][0]][matches[i][1]] = 0;
    }
    return matches.length;
}


function updateBoard() {
    for (let i = 0; i < boardSize[0]; i++) {
        let running = true;
        while (running) {
            let firstEmpty = null;
            for (let j = boardSize[1]-1; j >= 0; j--) {
                if (board[i][j] === 0 && firstEmpty === null) {
                    if (j === 0) {
                        running = false;
                        break;
                    }
                    firstEmpty = j;
                }
                else if (board[i][j] !== 0 && firstEmpty !== null) {
                    board[i][firstEmpty] = board[i][j];
                    board[i][j] = 0;
                    break;
                }
                else if (j === 0) {
                    running = false;
                    break;
                }
            }
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
    if (popChain > 8) {
        popChain = 8;
    }
    return pops * 10 * popChainPointTable[popChain];
}


function formatPointIncrement(pops, popChain) {
    return pops * 10 + "x" + popChainPointTable[popChain];
}


async function run() {
    let i = 0;
    let moveTick = 0;
    let currentMatches = [];
    let collapsingMatches = false;
    let popPoints = 0;
    let popChain = 0;
    let fps = 30;
    let speedUpTick = fps - 1;

    function collapseMatches() {
        let pops = popMatches(currentMatches);
        points += calculatePoints(pops, popChain);
        formatPointIncrement();
        soundByPoints(popChain);
        popChain++;
        currentMatches = [];
        updateBoard();
        let newMatches = findMatches();
        for (let i = 0; i < newMatches.length; i++) {
            currentMatches.push(newMatches[i]);
        }
        if (currentMatches.length === 0)
        {
            collapsingMatches = false;
            if (speedUpTick > 1) {
                speedUpTick = Math.max(speedUpTick * 0.9, 1);
            }
        }
        moveTick = 0;
    }


    function moveDown() {
        if (activePiece !== null) {
            if (emptyInDirection(activePiece, "down")) {
                activePiece = attemptMovePiece(activePiece, "down");
            }
            else {
                commitToBoard(activePiece);
                updateBoard();
                let newMatches = findMatches();
                for (let i = 0; i < newMatches.length; i++) {
                    currentMatches.push(newMatches[i]);
                }
                activePiece = null;
                actionOccupied = null;
                i = 0;
            }
        }
    }


    function perSecondLoop() {
        if (!actionOccupied) {
            if (currentMatches.length > 0) {
                collapsingMatches = true;
            }
            else if (board[insertPosition[0]][insertPosition[1]] === 0 && board[insertPosition[0]][insertPosition[1]+1] === 0) {
                activePiece = insertPiece(nextPiece);
                moveTick = 0;
                nextPiece = generatePiece();
                popPoints = 0;
                popChain = 0;
                actionOccupied = true;
                touchedActivePiece = false;
                touchMoved = false;
                i = 0;
            }
            else {
                return false;
            }
        }
        return true;
    }


    while(1) {
        drawBoard(currentMatches);
        if (i === 0)  {
            if (!board[insertPosition[0]].slice(1, board[0].length-1).includes(0)) {
                console.log("quitting");
                break;
            }
            perSecondLoop();
        }

        if (i === 15) {
            if (collapsingMatches) {
                collapseMatches();
            }
        }

        if (movingDown && activePiece !== null) {
            moveDown();
            points += 1;
        }

        moveTick++;
        if (moveTick === Math.floor(speedUpTick)) {
            moveDown();
            moveTick = 0;
        }
        i++;
        if (i >= fps) i = 0;

        await sleep(33);
    }
}