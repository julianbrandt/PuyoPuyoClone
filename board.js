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