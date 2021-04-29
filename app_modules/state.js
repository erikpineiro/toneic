
export function get () {

    let _localState = localStorage.getItem("localState");
    if (!_localState) {
        _localState = {
            currentView: "home",
        };
        _localState = set(_localState);
    }
    
    return JSON.parse(_localState);

}

export function set (ls) {

    let _localState = localStorage.getItem("localState") || {};
    _localState = { ..._localState, ...ls };
    localStorage.setItem("localState", JSON.stringify(_localState));
    return _localState;

}