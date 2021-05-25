import { View } from "./views.js";


export const UserInfo = {

    init: function (userInfo) {

        userInfo.innerHTML = `
            <img class="imageTop">
            <div class="message"></div>
        `;
    
    
        userInfo.click({
            callback: () => {
                let timeoutID = userInfo.dataset.timeout_id;
                timeoutID && clearTimeout(timeoutID);
                View.hideCover({cover: "userInfo"});
            }
        });
    },

    showUserInfo: function (data) {

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
        View.showCover({cover: "userInfo"});
    
        // hide automatically (will hide sooner if clicked)
        userInfo.dataset.timeout_id = setTimeout(() => {
            View.hideCover({cover: "userInfo"});
        }, 4000);    
    
    }


};

// export function init (userInfo) {

//     userInfo.innerHTML = `
//         <img class="imageTop">
//         <div class="message"></div>
//     `;


//     userInfo.click({
//         callback: () => {
//             let timeoutID = userInfo.dataset.timeout_id;
//             timeoutID && clearTimeout(timeoutID);
//             View.hideCover({cover: "userInfo"});
//         }
//     });
// }

// export function showUserInfo (data) {

//     let { imageTop, innerHTML = "" } = data;
//     let userInfo = document.querySelector("#userInfo");
    
//     // image
//     if (imageTop) {
//         userInfo.querySelector(".imageTop").setAttribute("src", imageTop);
//     } else {
//         userInfo.querySelector(".imageTop").style.display = "none";
//     }

//     // message
//     userInfo.querySelector(".message").innerHTML = innerHTML;

//     // show
//     View.showCover({cover: "userInfo"});

//     // hide automatically (will hide sooner if clicked)
//     userInfo.dataset.timeout_id = setTimeout(() => {
//         View.hideCover({cover: "userInfo"});
//     }, 4000);    

// }