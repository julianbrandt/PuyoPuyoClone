let advancedShown = false;

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


function toggleAdvancedSettings() {
    if (!advancedShown) {
        let elem = document.getElementsByTagName("template")[0].content.cloneNode(true);
        document.getElementById("menu").prepend(elem);
    }
    else {
        let elems = document.getElementsByClassName("advanced");
        while (elems.length > 0) {
            elems[0].parentElement.removeChild(elems[0]);
        }
    }
    advancedShown = !advancedShown;
}