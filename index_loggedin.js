"use strict";

import * as test from "./app_modules/test1.js";
test.test("erik");


import * as ButtonTree from "./app_modules/components/buttonTree.js";


const tree2Branch = {
    buttonData: {
        text: "Tree2Branch"
    },
    branchData: {
        branches: [
            {
                buttonData: {
                    text: "button1",
                    callback: () => { console.log("one"); }
                }
            },
            {
                buttonData: {
                    text: "button2",
                    callback: () => { console.log("two"); }
                }
            }
        ]
    }    
};
const mainTree = {
    buttonData: {
        text: "mainTree"
    },
    branchData: {
        branches: [
            tree2Branch,
            {
                buttonData: {
                    text: "button3",
                    callback: () => { console.log("three"); }
                }
            }
        ]
    }
}


let bTree = ButtonTree.create(mainTree);
document.querySelector("body").append(bTree);