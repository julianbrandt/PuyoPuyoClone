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