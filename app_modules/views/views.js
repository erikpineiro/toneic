import { myError } from "../error.js";
import * as State from "../state.js";


export function showView (data) {

    let { view } = data;
    let currentView = State.get().currentView;

    if (view === currentView) {
        myError.throw();
    }

    let element = document.querySelector(`#${view}`);
    let currentElement = document.querySelector(`#${currentView}`);

    element.style.zIndex = 1; // put it on top of all others

    currentElement.classList.add("disappear");

}

export * as Home from "./home.js";
export * as Toneic from "./toneic.js";
export * as Header from "./header.js";
