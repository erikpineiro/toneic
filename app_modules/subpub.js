import { myError } from "./error.js";



// ------ Sebbes kod, lite modifierad -------


// const listeners = {};

export const SubPub = {
    
    listeners: {},

    subscribe: function (data) {
        let {event, listener} = data;
        if ( !event || !listener ) { myError.throw(); }
    
        if (this.listeners[event] === undefined) {
            this.listeners[event] = [listener];
        } else {
            this.listeners[event] = [...this.listeners[event], listener];
        }
    
    },

    publish: function (data) {
        let { event, detail } = data;
        if ( !event ) { myError.throw(); }
    
        console.log("Event Published: " + event);
    
        if (this.listeners[event] === undefined) {
            console.log(`Event [${event}] has no listeners`);
            return;
        }
    
        this.listeners[event].forEach((listener) => {
    
            // If the listener is a function we'll invoke it with detail
            if (typeof listener === 'function') {
                // TODO: catch errors?
                listener(detail);
            } else {
                // Otherwise we'll dispatch a CustomEvent
                listener.dispatchEvent(new CustomEvent(event, { detail }));
            }
        });
    },

    unsubscribe: function (data) {
        let {event, listener} = data;
        // If no one is listening we'll do nothing
        if (this.listeners[event] === undefined) {
            return;
        }
    
        // Otherwise we'll filter out the listener from the array of listeners
        this.listeners[event] = this.listeners[event].filter((currentListener) => {
            // If they're unsubscribing a listener which is a function, we'll compare
            // the function names
            if (typeof currentListener === 'function') {
                return currentListener.name !== listener.name;
            }
    
            // HTML elements can be compared normally
            return currentListener !== listener;
        });
    }

}

// export function subscribe(data) {
//     let {event, listener} = data;
//     if ( !event || !listener ) { myError.throw(); }

//     if (listeners[event] === undefined) {
//         listeners[event] = [listener];
//     } else {
//         listeners[event] = [...listeners[event], listener];
//     }

// }

// export function publish(data) {

    
//     let { event, detail } = data;
//     if ( !event ) { myError.throw(); }

//     console.log("Event Published: " + event);

//     if (listeners[event] === undefined) {
//         console.log(`Event [${event}] has no listeners`);
//         return;
//     }

//     listeners[event].forEach((listener) => {

//         // If the listener is a function we'll invoke it with detail
//         if (typeof listener === 'function') {
//             // TODO: catch errors?
//             listener(detail);
//         } else {
//             // Otherwise we'll dispatch a CustomEvent
//             listener.dispatchEvent(new CustomEvent(event, { detail }));
//         }
//     });
// }

// export function unsubscribe(data) {
//     let {event, listener} = data;
//     // If no one is listening we'll do nothing
//     if (listeners[event] === undefined) {
//         return;
//     }

//     // Otherwise we'll filter out the listener from the array of listeners
//     listeners[event] = listeners[event].filter((currentListener) => {
//         // If they're unsubscribing a listener which is a function, we'll compare
//         // the function names
//         if (typeof currentListener === 'function') {
//             return currentListener.name !== listener.name;
//         }

//         // HTML elements can be compared normally
//         return currentListener !== listener;
//     });
// }



// Make our HTML elements be able to subscribe to events
HTMLElement.prototype.subscribe = function (data) {
    let { event, callback } = data;
    SubPub.subscribe({ event, listener: this });
    this.addEventListener(event, callback);
};
  
// Make our HTML elements be able to unsubscribe from events
HTMLElement.prototype.unsubscribe = function (event) {
    SubPub.unsubscribe(event, this);
};
  
// Make our HTML elements be able to publish events
HTMLElement.prototype.publish = function (data) {
    SubPub.publish(data);
};
  