
export function create(data){

    console.log("input", data);

    let {label, placeholder, attributes = []} = data;

    let main = document.createElement("div");
    main.classList.add("input");

    main.innerHTML = `
        <label>
        <input>
    `;

    attributes.forEach( attr => {
        main.querySelector("input").setAttribute(attr.name, attr.value);
    });


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

