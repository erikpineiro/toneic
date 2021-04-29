import * as Button from "./button.js";
import * as ButtonTree from "./buttonTree.js";

export function create(data){

    let { localState } = data;

    let main = document.createElement("div");
    main.id = "mainButtonsHome";


    main.append(ButtonTree.create({ which: "veckansTree", localState }));
    main.append(Button.create({ text: "Arkiv", callback: null, classes: ["mainButton"] }));
    main.append(Button.create({ text: "Ligor", callback: null, classes: ["mainButton"] }));

    return main;
}