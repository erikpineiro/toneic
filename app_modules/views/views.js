import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";

// export function showView (data) {

//     let { view } = data;
//     let currentView = State.get().currentView;

//     if (view === currentView) {
//         myError.throw();
//     }

//     let element = document.querySelector(`#${view}`);
//     let currentElement = document.querySelector(`#${currentView}`);

//     element.style.zIndex = 1; // put it on top of all others

//     currentElement.classList.add("disappear");

// }

export function showCover (data) {
    let { cover } = data;
    let element = document.querySelector(`#${cover}`);
    element.classList.remove("off");
    element.classList.add("on");
}

export function hideCover (data) {
    let { cover } = data;
    let element = document.querySelector(`#${cover}`);    
    element.classList.add("off");

    let transitionTime = parseFloat(getComputedStyle(element).getPropertyValue("--transitionTime"));
    setTimeout(() => {
        element.classList.remove("on");
    }, transitionTime * 1000);

}

SubPub.subscribe({
    event: "event::view",
    listener: function(detail){
        let { view } = detail;
        let currentView = State.local.currentView;

        if (view === currentView) {
            myError.throw();
        }
    
        let element = document.querySelector(`#${view}`);
        let currentElement = document.querySelector(`#${currentView}`);
    
        element.style.zIndex = 1; // put it on top of all others
    
        currentElement.classList.add("off");        
    }
});
SubPub.subscribe({
    event: "event::cover:show",
    listener: function (detail) {
        let { cover } = detail;
        let element = document.querySelector(`#${cover}`);
        element.classList.remove("off");
        element.classList.add("on");
    }
});
SubPub.subscribe({
    event: "event::cover:hide",
    listener: function (detail) {
        let { cover } = detail;
        let element = document.querySelector(`#${cover}`);    
        element.classList.add("off");
        element.addEventListener("transitionend", () => { element.classList.remove("on"); });
        
    }
});


export * as Home from "./home.js";
export * as Toneic from "./toneic.js";
export * as Header from "./header.js";
export * as Menu from "./menu.js";
export * as LoginRegisterJoin from "./loginRegisterJoin.js";
export * as UserInfo from "./userInfo.js";
