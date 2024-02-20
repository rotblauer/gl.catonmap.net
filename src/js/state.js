
let state = {};

window.localStorage.removeItem("data");
export function getState() {
    var fragmentParams = new URLSearchParams(new URL(window.location.href).hash.replace('#', ''));

    // var uriParam = URI(window.location.href).fragment(true);
    // var windowHistory = window.history;
    var localStore = {};

    try {
        var d = window.localStorage.getItem("state");
        if (d !== "" && typeof(d) !== "undefined" && d !== null) {
            localStore = JSON.parse(d);
        }
    } catch (err) {}

    Object.assign(state, localStore);
    for (let [k, v] of fragmentParams) {
        state[k] = v;
    }

    let defaults = {
        zoom: state["zoom"] || 12,
        pitch: state["pitch"] || 0,
        bearing: state["bearing"] || 0,
        lat: state["lat"] || 44.987854003, // 38.613651383524335, // 32,i
        lng: state["lng"] || -93.25876617, // -90.25388717651369,
        style: state["style"] || "https://api.maptiler.com/maps/streets-v2/style.json?key=XrsT3wNTcIE6gABWxyV5",
        snapmarkers: true,
        // layer-edge-catcolor=true&layer-devop-catcolor=true&layer-rye.level-23-density=true&layer-ia.level-23-activity=true
        "layer-edge-catcolor": true,
        "layer-devop-catcolor": true,
        "layer-rye.level-23-density": true,
        "layer-ia.level-23-density": true,
    };

    // state[window] is a migration from the old to new
    if (Object.keys(state).length === 0 || state["window"]) {
        state = defaults;
    }

    return state;
}

export function setState(k, v) {
    if (typeof k === "object") {
        let href = new URL(window.location.href)
        href.hash = new URLSearchParams(k).toString();
        window.history.replaceState(k, "---", href);
        window.localStorage.setItem("state", JSON.stringify(k));
        state = k;
        return state;
    }

    state[k] = v;
    if (v === null) {
        delete state[k];
    }

    var windowHistoryState = window.history.state || {};
    windowHistoryState[k] = v;

    let href = new URL(window.location.href)
    href.hash = new URLSearchParams(state).toString();
    window.history.replaceState(windowHistoryState, "---", href);
    window.localStorage.setItem("state", JSON.stringify(state));

    return state;
}
