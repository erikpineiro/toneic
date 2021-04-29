import { myError } from "./error.js";



const listeners = [];

export function addListener (data) {

    let { eventName, payload, callback } = data;

    if ( !eventName || !callback ) {
        myError.throw();
    }

    listeners.push(data);

}

export function dispatchEvent (data) {

    let { eventName, dispatchData } = data;

    listeners
        .filter( l => l.eventName === eventName )
        .forEach( listener => {

            let payload = listener.payload
            listener.callback({ payload, dispatchData });

        });

}
