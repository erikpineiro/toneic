import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";

import { LRJ } from "./loginRegisterJoin.js";
import { Home } from "./home.js";
import { Toneic } from "./toneic.js";
import { Header } from "./header.js";
import { Menu } from "./menu.js";
import { UserInfo } from "./userInfo.js";


export const View = {
    LRJ,
    Home,
    Toneic,
    Header,
    Menu,
    UserInfo,
    
    showView: function (data) {

        console.log("Show View: ", data);

        let { view } = data;
        let currentView = State.local.currentView;
    
        if (view === currentView) {
            myError.throw();
        }
    
        if ( view === "toneic" ) { Toneic.startSynch(); }
        if (currentView === "toneic") { Toneic.stopSynch(); }
    
        let element = document.querySelector(`#${view}`);
        let currentElement = document.querySelector(`#${currentView}`);
    
        element.style.zIndex = 1; // put it on top of all others
    
        currentElement.classList.add("off");
    
    },

    showCover: function (data) {
        let { cover } = data;
        let element = document.querySelector(`#${cover}`);
        element.classList.remove("off");
        element.classList.add("on");
    },
    
    hideCover: function (data) {
        let { cover } = data;
        let element = document.querySelector(`#${cover}`);    
        element.classList.add("off");
    
        let transitionTime = parseFloat(getComputedStyle(element).getPropertyValue("--transitionTime"));
        setTimeout(() => {
            element.classList.remove("on");
        }, transitionTime * 1000);
    }
};


SubPub.subscribe({
    event: "event::cover:show",
    listener: function (detail) {
        let { cover } = detail;
        let element = document.querySelector(`#${cover}`);
        element.classList.remove("off");
        element.classList.add("on");
    }
});


