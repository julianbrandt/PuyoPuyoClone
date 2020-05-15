run();

document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup);
function keydown(e) {
    if (e.repeat) {
        if (`${e.code}` === "ArrowRight") {
            pressedRight();
        }
        if (`${e.code}` === "ArrowLeft") {
            pressedLeft();
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
        if (`${e.code}` === "ArrowDown") {
            pressedDown();
        }
    }
}

function keyup(e) {
    if (`${e.code}` === "ArrowDown") {
        liftedDown();
    }
}