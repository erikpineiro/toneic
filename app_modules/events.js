import { myError } from "./error.js";



const listeners = {};


// ------ Sebbes kod, lite modifierad -------

export function subscribe(data) {
    let {event, listener} = data;
    if ( !event || !listener ) { myError.throw(); }

    if (listeners[event] === undefined) {
        listeners[event] = [listener];
    } else {
        listeners[event] = [...listeners[event], listener];
    }
}

export function publish(data) {

    let { event, detail } = data;
    if ( !event ) { myError.throw(); }

    if (listeners[event] === undefined) {
        console.log(`Event [${event}] has no listeners`);
        return;
    }

    listeners[event].forEach((listener) => {

        // If the listener is a function we'll invoke it with detail
        if (typeof listener === 'function') {
            // TODO: catch errors?
            listener(detail);
        } else {
            // Otherwise we'll dispatch a CustomEvent
            listener.dispatchEvent(new CustomEvent(event, { detail }));
        }
    });
}

export function unsubscribe(data) {
    let {event, listener} = data;
    // If no one is listening we'll do nothing
    if (listeners[event] === undefined) {
        return;
    }

    // Otherwise we'll filter out the listener from the array of listeners
    listeners[event] = listeners[event].filter((currentListener) => {
        // If they're unsubscribing a listener which is a function, we'll compare
        // the function names
        if (typeof currentListener === 'function') {
            return currentListener.name !== listener.name;
        }

        // HTML elements can be compared normally
        return currentListener !== listener;
    });
}



// Make our HTML elements be able to subscribe to events
HTMLElement.prototype.subscribe = function (data) {
    let { event, callback } = data;
    subscribe({ event, listener: this });
    this.addEventListener(event, callback);
};
  
// Make our HTML elements be able to unsubscribe from events
HTMLElement.prototype.unsubscribe = function (event) {
    unsubscribe(event, this);
};
  
// Make our HTML elements be able to publish events
HTMLElement.prototype.publish = function (data) {
    PubSub.publish(data);
};
  