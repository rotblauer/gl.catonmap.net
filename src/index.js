/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */



// Test import of styles
import '@/styles/index.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'
import $ from 'jquery'

/*
You can also import JavaScript plugins individually as needed to keep bundle sizes down:
import Alert from 'bootstrap/js/dist/alert'

// or, specify which plugins you need:
import { Tooltip, Toast, Popover } from 'bootstrap'
 */

import map from '@/js/map'
import { Service } from '@/js/services'

let servicesEnabled = [/ia\./, /rye\./];
function isServiceEnabled(service) {
    if (/\+/.test(service.name)) {
        return false;
    }
    for (let s of servicesEnabled) {
        if (s.test(service.name)) {
            return true;
        }
    }
    return false;
}

fetch("https://mb.tiles.catonmap.info/services").
then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
    /*
    [{
        "imageType": "pbf",
        "name": "ia.level-23",
        "url": "https://mb.tiles.catonmap.info/services/ia.level-23",
    }, ...]
     */
    for (let service of data) {
        console.log("service", service);
        if (!isServiceEnabled(service)) {
            continue;
        }
        fetch(service.url).
        then((res) => {
            console.log("res", res);
            return res.json();
        }).then((data) => {
            console.log("data", data);
            const service = new Service(data);
            service.greet();
            service.appendHTML(map);
            service.addSourceToMap(map);
            // service.addLayerToMap(map);

        }).catch((err) => {
            console.error("err", err);
        });
    }
}).catch((err) => {
    console.error("err", err);
});

fetch("https://api.catonmap.info/lastknown").
then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
}).catch((err) => {
    console.error("err", err);
});

fetch(`https://api.catonmap.info/catsnaps?tstart=${Math.floor(Date.now() / 1000) - 60*60*24*30}`).
then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
    data.sort((a, b) => {
        return a.properties.UnixTime - b.properties.UnixTime;
    });
}).catch((err) => {
    console.error("err", err);
});


