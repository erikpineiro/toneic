import * as Button from "./button.js";
import * as ButtonTree from "./buttonTree.js";

export function create(data){

    console.log("branches", data);

    let { branches = [] } = data;

    let main = document.createElement("div");
    main.classList.add("branches");

    branches.forEach(branch => {

        console.log("one branch", branch);

        let {buttonData = null, branchData = null} = branch;

        if (branchData !== null) {
            main.append(ButtonTree.create(branch));
        } else {
            main.append(Button.create(branch.buttonData));
        }
    });

    return main;
}

export function toggle(main){
    return () => { 
        main.classList.toggle("open");
    }
}