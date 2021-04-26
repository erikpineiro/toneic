
export function create(data){

    console.log("button", data);

    let {text, callback = null} = data;

    let main = document.createElement("button");

    main.textContent = text;
    main.addEventListener("click", callback);

    main.addEventListener("touchstart", function(){
        main.classList.add("active");
    });
    main.addEventListener("touchend", function(){
        main.classList.remove("active");
    });

    return main;
}