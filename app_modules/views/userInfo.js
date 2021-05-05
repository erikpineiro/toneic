import apiBridge from "../apiBridge.js";
import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";


export function init (userInfo) {

    userInfo.innerHTML = `
        <img class="imageTop">
        <div class="message"></div>
    `;

    let timeoutID = null;

    userInfo.click({
        callback: () => {
            timeoutID && clearTimeout(timeoutID);
            SubPub.publish({
                event: "event::cover:hide",
                detail: { cover: "userInfo" }
            });
        }
    });

    SubPub.subscribe({
        event: "event::cover:show",
        listener: (detail) => {
            let { cover, imageTop, innerHTML = "" } = detail;

            console.log(cover);
            if (cover !== "userInfo") return;

            if (imageTop) {
                userInfo.querySelector(".imageTop").setAttribute("src", imageTop);
            } else {
                userInfo.querySelector(".imageTop").style.display = "none";
            }

            userInfo.querySelector(".message").innerHTML = innerHTML;

            timeoutID = setTimeout(() => {
                SubPub.publish({
                    event: "event::cover:hide",
                    detail: { cover: "userInfo" }
                });
            }, 4000);
        }
    });
}

export function showUserInfo (data) {

    let { imageTop, innerHTML = "" } = detail;
    
    if (imageTop) {
        userInfo.querySelector(".imageTop").setAttribute("src", imageTop);
    } else {
        userInfo.querySelector(".imageTop").style.display = "none";
    }

    userInfo.querySelector(".message").innerHTML = innerHTML;


    View.showCover({cover: "userInfo"});


}