import { myError } from "./error.js";
import * as Events from "./events.js";

// Waiter triggers an event when some things have happened

const waiters = [];

export class Waiter {

    static hasHappened (thing) {

        console.log("has happened:", thing);

        for (let i = waiters.length - 1; i >= 0; i--) {
            let index = waiters[i].waitingForThings.indexOf(thing);
            if (index !== -1) {
                waiters[i].waitingForThings.splice(index, 1);
                if (waiters[i].waitingForThings.length === 0) {
                    Events.publish({ event: waiters[i].event });
                }
            }
        }
    }

    constructor (data) {

        let {event, waitingForThings} = data;

        console.log(data);

        if (!event || waitingForThings.length === 0) {
            myError.throw();
        }

        this.event = event;
        this.waitingForThings = waitingForThings;

        waiters.push(this);
    }
}