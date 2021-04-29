"use strict";



const registerTree = {
    buttonData: {
        text: "Registrera dig"
    },
    branchData: {
        branches: [
            {
                inputData: {
                    label: "",
                    placeholder: "Användarnamn",
                    attributes: [
                        {
                            name: "type",
                            value: "text"
                        }
                    ]
                },
            },
            {
                inputData: {
                    label: "",
                    placeholder: "Lösenord",
                    attributes: [
                        {
                            name: "type",
                            value: "password"
                        }
                    ]
                },
            },
            {
                inputData: {
                    label: "",
                    placeholder: "email",
                    attributes: [
                        {
                            name: "type",
                            value: "email"
                        }
                    ]
                },
            },
            {
                buttonData: {
                    text: "Register",
                    callback: () => { console.log("register"); }
                }
            },
        ]
    }    
};
const loginRegisterTree = {
    buttonData: {
        text: "Login / Register"
    },
    branchData: {
        branches: [
            {
                inputData: {
                    label: "",
                    placeholder: "Användarnamn",
                    attributes: [
                        {type: "text"}
                    ]
                },
            },
            {
                inputData: {
                    label: "",
                    placeholder: "Lösenord",
                    attributes: [
                        {type: "password"}
                    ]
                },
            },
            {
                buttonData: {
                    text: "Login",
                    callback: () => { console.log("login"); }
                }
            },
            registerTree
        ]
    }
}


let bTree = ButtonTree.create(mainTree);
document.querySelector("body").append(bTree);
