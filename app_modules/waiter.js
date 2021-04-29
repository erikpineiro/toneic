import { myError } from "./error.js";

const waiters = [];

export class Waiter {

    static hasHappened (what) {

        console.log("has happened:", what);

        for (let i = waiters.length - 1; i >= 0; i--) {

            let index = waiters[i].waitingFor.indexOf(what);
            if (index !== -1) {
                waiters[i].waitingFor.splice(index, 1);
                if (waiters[i].waitingFor.length === 0) {
                    console.log("waiter", waiters[i].name, "done");
                    waiters[i].callback();                    
                }
            }
            
            console.log(waiters[i]);

        }
    }

    constructor (data) {

        let {name, waitingFor, callback} = data;

        if (!name || waitingFor.length === 0 || !callback) {
            myError.throw();
        }

        this.name = name;
        this.waitingFor = waitingFor;
        this.callback = callback;

        waiters.push(this);
    }
}