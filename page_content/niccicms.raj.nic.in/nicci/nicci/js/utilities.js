const dragging = ($id) => {
    const $mover = document.getElementById($id);
    const $grabzone = $mover.querySelector(".dragme");

    let dragStartX = 0;
    let dragStartY = 0;

    $grabzone.onmousedown = (event) => {
        $mover.draggable = true;
        $mover.classList.add("dragging");
    };
    $mover.ondragstart = (event) => {
        dragStartX = event.clientX;
        dragStartY = event.clientY;
    };
    $mover.ondragend = (event) => {
        if (event.target.id !== $mover.id) {
            event.preventDefault();
            return false;
        }
        $mover.style.left = $mover.offsetLeft - (dragStartX - event.clientX) + "px";
        $mover.style.top = $mover.offsetTop - (dragStartY - event.clientY) + "px";

        $mover.draggable = false;
        $mover.classList.remove("dragging");
    };
};

dragging("phone-wrapper");

function maxchat() {

    var x = document.getElementById("app");
    if (x.clientHeight == "550") {
        var x = document.querySelectorAll(".expndchat");
        x[0].style.setProperty("top", "18px", "important");
        x[0].style.setProperty("left", "5px", "important");
        x[0].style.setProperty("height", "687px", "important");
        x[0].style.setProperty("width", "482px", "important");

        var x = document.querySelectorAll(".popupdiv");
        x[0].style.setProperty("height", "706px", "important");
        x[0].style.setProperty("width", "492px", "important");

        var x = document.querySelectorAll(".nicci_mvbtn1");
        x[0].style.setProperty("top", "0px", "important");
        x[0].style.setProperty("right", "192px", "important");

        var x = document.querySelectorAll(".bg-light1");
        x[0].style.setProperty("grid-template-columns", "432px 0px 37px", "important");

        var x = document.querySelectorAll(".toggleicon");
        x[0].style.setProperty("display", "block", "important");

        var x = document.querySelectorAll(".mtoggleicon");
        x[0].style.setProperty("display", "none", "important");

      
        var x = document.querySelectorAll(".nicci-rating-star-block");
        x[0].style.setProperty("height", "89%", "important");
    } else {
        var x = document.querySelectorAll(".expndchat");
        x[0].style.setProperty("top", "49px", "important");
        x[0].style.setProperty("left", "6px", "important");
        x[0].style.setProperty("height", "550px", "important");
        x[0].style.setProperty("width", "343px", "important");

        var x = document.querySelectorAll(".popupdiv");
        x[0].style.setProperty("height", "600px", "important");
        x[0].style.setProperty("width", "370px", "important");

        var x = document.querySelectorAll(".nicci_mvbtn1");
        x[0].style.setProperty("top", "31px", "important");
        x[0].style.setProperty("right", "146px", "important")

        var x = document.querySelectorAll(".bg-light1");
        x[0].style.setProperty("grid-template-columns", "292px 0px 37px", "important");
        var x = document.querySelectorAll(".toggleicon");
        x[0].style.setProperty("display", "none", "important");

        var x = document.querySelectorAll(".mtoggleicon");
        x[0].style.setProperty("display", "block", "important");

        var x = document.querySelectorAll(".nicci-rating-star-block");
        x[0].style.setProperty("height", "86%", "important");
        
    }
}
function minchat() {
    var x = document.querySelectorAll(".expndchat");
    x[0].style.setProperty("top", "49px", "important");
    x[0].style.setProperty("left", "6px", "important");
    x[0].style.setProperty("height", "550px", "important");
    x[0].style.setProperty("width", "343px", "important");

    var x = document.querySelectorAll(".popupdiv");
    x[0].style.setProperty("height", "600px", "important");
    x[0].style.setProperty("width", "370px", "important");

    var x = document.querySelectorAll(".nicci_mvbtn1");
    x[0].style.setProperty("top", "31px", "important");
    x[0].style.setProperty("right", "135px", "important");

    var x = document.querySelectorAll(".bg-light1");
    x[0].style.setProperty("grid-template-columns", "292px 0px 37px", "important");


    var x = document.querySelectorAll(".toggleicon");
    x[0].style.setProperty("display", "none", "important");

    var x = document.querySelectorAll(".mtoggleicon");
    x[0].style.setProperty("display", "block", "important");

    var x = document.querySelectorAll(".nicci-rating-star-block");
    x[0].style.setProperty("height", "86%", "important");
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
        var x = document.querySelectorAll(".toggleicon");
        x[0].style.setProperty("display", "none", "important");
        var x = document.querySelectorAll(".mtoggleicon");
        x[0].style.setProperty("display", "none", "important");
        var x = document.querySelectorAll(".dragme");
        x[0].style.setProperty("display", "none", "important");
    }
}

