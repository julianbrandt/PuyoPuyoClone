init();

document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup);
document.addEventListener('resize', setSizeVariables);
canvas.ontouchstart = function (e) {touchstart(e)};
canvas.ontouchend = function (e) {touchend(e)};
canvas.ontouchmove = function (e) {touchmove(e)};


run();
