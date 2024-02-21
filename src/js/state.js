
// state is the global state of persisted app parameters.
// It is not exported.
let state = {};
const LOCALSTORAGE_STATE_KEY = "state";

// stateChangedSinceGet is a boolean that is set to true when the state is changed.
// Its an optimization for caching the state.
// Keep in mind that every time the map is moved the state will get set,
// so this won't actually save tons of time across a session,
// but should improve startup time.
let stateChangedSinceGet = true;

const defaults = {
    zoom: 11,
    pitch: 0,
    bearing: 0,
    lat: 44.97, // 38.613651383524335, // 32,i
    lng: -93.2, // -90.25388717651369,
    style: "https://api.maptiler.com/maps/streets-v2/style.json?key=XrsT3wNTcIE6gABWxyV5",
    snapmarkers: true,

    // layer-<uid>-<layerType>, were <uid> is the unique id (derived as the last path item of the URL) of the layer
    // and <layerType> is the type of layer.
    "layer-edge-catcolor": true,
    "layer-devop-catcolor": true,
    "layer-rye.level-23-density": true,
    "layer-ia.level-23-density": true,
};

window.localStorage.removeItem("data");
export function getState() {
    // Simple caching.
    if (!stateChangedSinceGet) {
        return state;
    }
    stateChangedSinceGet = false;

    // State is stored in the URL hash and local storage.
    // The URL hash is the primary source of truth, in order
    // to allow for sharing of links.

    // Read stateful data from localstorage and URL hash.
    var localStore = {};
    try {
        var d = window.localStorage.getItem(LOCALSTORAGE_STATE_KEY);
        if (d !== "" && typeof(d) !== "undefined" && d !== null) {
            localStore = JSON.parse(d);
        }
    } catch (err) {}

    var fragmentParams = new URLSearchParams(new URL(window.location.href).hash.replace('#', ''));

    // Merge the URL hash and local storage into the state.
    // The URL hash takes precedence, and is assigned last.
    Object.assign(state, localStore);
    for (let [k, v] of fragmentParams) {
        state[k] = v;
    }

    // If there was no state in the URL hash or local storage, set and use the defaults.
    if (Object.keys(state).length === 0 || state["window"] /* state[window] is a migration from the old to new */) {
        state = defaults;
    }

    return state;
}

export function setState(k, v) {
    stateChangedSinceGet = true;

    // If an object is passed in the key position
    // then it is assumed to be a complete state object.
    if (typeof k === "object") {
        let href = new URL(window.location.href)
        href.hash = new URLSearchParams(k).toString();
        window.history.replaceState(k, "---", href);
        window.localStorage.setItem(LOCALSTORAGE_STATE_KEY, JSON.stringify(k));
        state = k;
        return state;
    }

    // If the value (v) is null, handle that as a deletion.
    if (v === null) {
        delete state[k];
    } else {
        // Otherwise assign to state.
        state[k] = v;
    }

    var windowHistoryState = window.history.state || {};
    windowHistoryState[k] = v; // ?

    let href = new URL(window.location.href)
    href.hash = new URLSearchParams(state).toString();
    window.history.replaceState(windowHistoryState, "---", href);
    window.localStorage.setItem(LOCALSTORAGE_STATE_KEY, JSON.stringify(state));

    return state;
}
