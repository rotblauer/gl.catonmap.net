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
import {Service} from '@/js/services'

let servicesWhitelistURLs = [/ia\./, /rye\./, /edge/, /devop/];

function isServiceEnabled(serviceSummary) {
    if (/\+/.test(serviceSummary.url)) {
        return false;
    }
    for (let s of servicesWhitelistURLs) {
        if (s.test(serviceSummary.url)) {
            return true;
        }
    }
    return false;
}

fetch("https://mb.tiles.catonmap.info/services").then((res) => {
    console.log("res", res);
    return res.json();
}).then((serviceSummaries) => {
    console.log("data", serviceSummaries);
    /*
    [{
        "imageType": "pbf",
        "name": "ia.level-23",
        "url": "https://mb.tiles.catonmap.info/services/ia.level-23",
    }, ...]
     */
    serviceSummaries = serviceSummaries.filter((serviceSummary) => {
        return isServiceEnabled(serviceSummary);
    });

    return Promise.all(serviceSummaries.map(ss => fetch(ss.url))).then(responses =>
        Promise.all(responses.map(res => res.json()))
    )
}).then((services) => {
    services.sort((a, b) => {
        const serviceA = new Service(a);
        const serviceB = new Service(b);
        return serviceB.tilestats.layers[0].count - serviceA.tilestats.layers[0].count;
    })
    services.forEach((service) => {
        service = new Service(service);
        service.greet();
        service.appendHTML(map);
        service.addSourceToMap(map);
        // service.addLayerToMap(map);
    })
}).catch((err) => {
    console.error("err", err);
});

fetch("https://api.catonmap.info/lastknown").then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
}).catch((err) => {
    console.error("err", err);
});

fetch(`https://api.catonmap.info/catsnaps?tstart=${Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30}`).then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
    data = data.filter((d) => {
        return typeof d.properties.imgS3 !== "undefined";
    })
    data.sort((a, b) => {
        return b.properties.UnixTime - a.properties.UnixTime;
    });
    data.forEach((d) => {
        let $cardImg = $("<img>").
            attr("src", `https://s3.us-east-2.amazonaws.com/${d.properties.imgS3}`).
            addClass("card-img-top");
        let $listElement = $(`
            <li class="nav-item">
                <div class="card mb-2">
<!--                    <img src="https://placekitten.com/g/300/201" class="card-img-top" alt="...">-->
                    <div class="card-body">
                      <div class="row justify-content-between">
                        <div class="col">
                            <p class="card-text text-start">
                                <span>${d.properties.Name}</span>
                            </p>
                        </div>
                        <div class="col">
                            <p class="card-text text-end">
                                <span class="text-end">${new Date(d.properties.Time).toLocaleString()}</span>
                            </p>
                        </div>
                      </div>


                    </div>
                </div>
            </li>
        `);
        $listElement.find(".card").prepend($cardImg);
        $("#catsnaps-list").append($listElement);

    });
}).catch((err) => {
    console.error("err", err);
});


