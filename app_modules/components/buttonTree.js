import * as Button from "./button.js";

function getTreeData (data) {

    let { which, localState } = data;



    const TREES = {

        lagTree: {
            buttonData: {
                text: "I lag"
            },
            branchData: {
                branches: lagTreeBranchData(),
            }
        },

        veckansTree: {
            buttonData: {
                text: `Lös veckans Toneic`
            },
            branchData: {
                branches: [
                    {
                        buttonData: {
                            text: "Gör det på egen hand",
                            callback: () => { console.log("på egen hand"); }
                        }
                    },
                    {
                        which: "lagTree",
                        localState
                    }
                ]
            }    
        }
    }

    return { ...TREES[which] };

    function lagTreeBranchData(){
        let branchData = [];
        let textOtherTeam = "Lös den med ett registrerat lag";
        if (localState.lastPlayedWith) {
            textOtherTeam = "Lös den med ett annat registrerat lag";
            branchData.push(
                {
                    buttonData: {
                        text: `Tävla med ${localState.lastPlayedWith}`,
                        callback: () => { console.log("Tävla med last played"); }
                    }
                });
        };
        branchData.push(
            {
                buttonData: {
                    text: textOtherTeam,
                    callback: () => { console.log("Tävla med other team"); }
                }
        });
        branchData.push(
            {
                buttonData: {
                    text: "Registrera ett nytt lag",
                    callback: () => { console.log("Registrera lag"); }
                }
        });
        return branchData;
    }
    
}


export function create(data){

    let { which } = data;
    let treeData = getTreeData(data);

    let main = document.createElement("div");
    main.id = which;

    main.classList.add("buttonTree");
    if (data.treeRoot === undefined) {
        main.classList.add("treeRoot");
    }

    main.append(branchesCreate(treeData));
    main.prepend(mainButtonCreate(treeData));

    return main;


    function mainButtonCreate(data) {

        let { buttonData } = data;
    
        let _main = Button.create({
            ...buttonData,
            classes: ["mainButton"],
            callback: mainButtonClick
        });

        return _main;
    
    }
    function mainButtonClick(){

        let branches = main.querySelector(`.branches`);
        let mainButton = main.querySelector(".mainButton");
        branches.classList.toggle("open");
        mainButton.classList.toggle("open");
        main.classList.toggle("open");
    
    }
    function branchesCreate(data){

        console.log("branches", data);
    
        let { branchData } = data;
    
        let _main = document.createElement("div");
        _main.classList.add("branches");
    
        branchData.branches.forEach(branch => {
    
            console.log("one branch", branch);
    
            let {buttonData, which} = branch;
    
            if (which) {
                _main.append(create({...branch, treeRoot: "done"}));
            } else {
                _main.append(Button.create(buttonData));
            }
        });
    
        return _main;
    }

}

