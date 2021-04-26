import * as Button from "./button.js";
import * as Branches from "./branches.js";

export function create(data){

    console.log("buttonTree", data);


    let {buttonData, branchData} = data;

    let main = document.createElement("div");
    main.classList.add("buttonTree");

    let branches_component = Branches.create(branchData);
    let mainButton_component = Button.create({...buttonData, callback: Branches.toggle(branches_component)});

    main.append(mainButton_component);
    main.append(branches_component);

    return main;

}

