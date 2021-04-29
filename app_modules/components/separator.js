
export function create(data){

    let {dir, size}  = data;

    let main = document.createElement("div");
    
    if (dir === "v") {
        main.style.height = size;
    }

    return main;
}