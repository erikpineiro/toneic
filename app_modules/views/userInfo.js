import apiBridge from "../apiBridge.js";
import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";
import { showCover, hideCover } from "./views.js";


export function init (userInfo) {

    userInfo.innerHTML = `
        <img class="imageTop">
        <div class="message"></div>
    `;


    userInfo.click({
        callback: () => {
            let timeoutID = userInfo.dataset.timeout_id;
            timeoutID && clearTimeout(timeoutID);
            hideCover({cover: "userInfo"});
        }
    });
}

export function showUserInfo (data) {

    let { imageTop, innerHTML = "" } = data;
    let userInfo = document.querySelector("#userInfo");
    
    // image
    if (imageTop) {
        userInfo.querySelector(".imageTop").setAttribute("src", imageTop);
    } else {
        userInfo.querySelector(".imageTop").style.display = "none";
    }

    // message
    userInfo.querySelector(".message").innerHTML = innerHTML;

    // show
    showCover({cover: "userInfo"});

    // hide automatically (will hide sooner if clicked)
    userInfo.dataset.timeout_id = setTimeout(() => {
        hideCover({cover: "userInfo"});
    }, 4000);    

}