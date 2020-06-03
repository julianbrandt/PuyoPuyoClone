function hideMenu() {
    let menus = document.getElementsByClassName("menu");
    for (let i = 0; i < menus.length; i++) {
        menus[i].style.zIndex = "-1";
    }
}

function showMenu() {
    let menus = document.getElementsByClassName("menu");
    for (let i = 0; i < menus.length; i++) {
        menus[i].style.zIndex = "1";
    }
}

function startSinglePlayer() {
    hideMenu();
    run();
}