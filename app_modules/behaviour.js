
export function clickable (data) {

    let { element, callback } = data;

    element.addEventListener("click", callback);

    element.addEventListener("touchstart", function(){
        element.classList.add("active");
    });
    element.addEventListener("touchend", function(){
        element.classList.remove("active");
    });
}

export function mainTreeButton (data) {

    let { button } = data;

    clickable({
        element: button,
        callback: () => {
            button.parentElement.classList.toggle("open");
            button.classList.toggle("open");
            button.parentElement.querySelector(".branches").classList.toggle("open");
        }
    });

}