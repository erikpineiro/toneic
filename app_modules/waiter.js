import { myError } from "./error.js";
import { SubPub } from "./subpub.js";

// Waiter triggers an event when some things have happened

const waiters = [];

export class Waiter {

    static hasHappened (thing) {

        console.log("has happened:", thing);

        for (let i = waiters.length - 1; i >= 0; i--) {
            console.log(waiters[i].waitingForThings);
            let index = waiters[i].waitingForThings.indexOf(thing);
            if (index !== -1) {
                waiters[i].waitingForThings.splice(index, 1);
                if (waiters[i].waitingForThings.length === 0) {
                    SubPub.publish({ event: waiters[i].event });
                }
            }
        }
    }

    constructor (data) {

        let {event, waitingForThings} = data;

        if (!event || waitingForThings.length === 0) {
            myError.throw();
        }

        this.event = event;
        this.waitingForThings = waitingForThings;

        waiters.push(this);
    }
}