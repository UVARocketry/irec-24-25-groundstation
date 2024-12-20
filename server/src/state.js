var startingState = null;
var currentState = {};

/** @type {string} */
var currentEvent = "offline";

/** @return {string} */
export function getEvent() {
    return currentEvent;
}

/**
 * @param e {string}
 */
export function setEvent(e) {
    currentEvent = e;
}

/** @return {Object} */
export function getState() {
    currentState.startState = startingState;
    return currentState;
}

/**
 * @param s {Object} */
export function setState(s) {
    currentState = s;
    if (startingState == null) {
        startingState = { ...s };
    }
}
