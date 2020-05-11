run();

document.addEventListener('keydown', logKey);
function logKey(e) {
    if (e.repeat) {
        if (`${e.code}` === "ArrowRight") {
            pressedRight();
        }
        if (`${e.code}` === "ArrowLeft") {
            pressedLeft();
        }
        if (`${e.code}` === "ArrowDown") {
            pressedDown();
        }
    }
    else {
        if (`${e.code}` === "ArrowRight") {
            pressedRight();
        }
        if (`${e.code}` === "ArrowLeft") {
            pressedLeft();
        }
        if (`${e.code}` === "ArrowUp") {
            rotate(activePiece);
        }
    }
}