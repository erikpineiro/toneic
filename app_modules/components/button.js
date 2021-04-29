
export function create(data){

    console.log("button", data);

    let {text, callback = null, classes = null}  = data;

    let main = document.createElement("button");
    classes && main.classList.add(classes.join(","));

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