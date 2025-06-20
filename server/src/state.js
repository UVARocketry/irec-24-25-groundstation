import { broadcastState, getReader } from "./index.js";
import { AddedData } from "../../common/AddedData.js";
import { LogItem } from "../../common/LogItem.js";

/* @type {LogItem} */
var startingState = null;
/* @type {object} */
var currentState = new LogItem();
var launchTime = 0;

var addedData = new AddedData();

/** @type {string} */
var currentEvent = "offline";

/** @type {NodeJS.Timeout?} */
var connectionTimeout = null;

/** @return {string} */
export function getEvent() {
	return currentEvent;
}

export function resetInternalState() {
	clearStartingState();
	clearConnected();
	currentState = new LogItem();
}

/**
 * @param item {string}
 * @param c {boolean}
 */
export function setConnected(item, c) {
	var i = 0;
	for (; i < addedData.connected.length; i++) {
		if (addedData.connected[i][0] === item) {
			addedData.connected[i][1] = c;
			break;
		}
	}
	if (i === addedData.connected.length) {
		addedData.connected.push([item, c]);
	}
	broadcastState();
}

export function clearConnected() {
	addedData.connected = [];
}

/**
 * @template {keyof AddedData} K
 * @param {K} k
 * @param {AddedData[K]} v
 */
export function setAdd(k, v) {
	if (addedData[k] !== v) {
		addedData[k] = v;
		broadcastState();
	}
}

/**
 * @param e {string}
 */
export function setEvent(e) {
	currentEvent = e;
	if (e == "MotorBurn") {
		launchNow();
	}
}

/** @return {Object} */
export function getState() {
	for (const k in addedData) {
		currentState[k] = addedData[k];
	}
	currentState.startState = startingState;
	currentState.readerName = getReader().getName();
	// currentState.rocketConnected = rocketConnected;
	// currentState.readerConnected = readerConnected;
	currentState.timeSinceLaunch = currentState.i_timestamp - launchTime;
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

export function clearStartingState() {
	startingState = null;
}

/**
 * @param {boolean} v
 */
export function setReaderConnected(v) {
	if (v !== addedData.readerConnected) {
		setAdd("readerConnected", v);
		broadcastState();
	}
}

/**
 * @param {boolean} v
 */
export function setRocketConnected(v) {
	if (connectionTimeout !== null && v) {
		clearTimeout(connectionTimeout);
		connectionTimeout = null;
	}
	if (v) {
		connectionTimeout = setTimeout(() => {
			connectionTimeout = null;
			console.log("yo no");
			setRocketConnected(false);
		}, 1000);
	}
	if (v !== addedData.rocketConnected) {
		setAdd("rocketConnected", v);
		broadcastState();
	}
}

export function launchNow() {
	// if (startingState !== null) {
	launchTime = currentState.i_timestamp ?? startingState?.i_timestamp ?? 0;
	// }
}
