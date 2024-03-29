/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */


// Test import of styles
import '@/styles/index.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'
import $ from 'jquery'

// Import bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css'

import TimeAgo from "javascript-time-ago";
// English.
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)
// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

/*
You can also import JavaScript plugins individually as needed to keep bundle sizes down:
import Alert from 'bootstrap/js/dist/alert'

// or, specify which plugins you need:
import { Tooltip, Toast, Popover } from 'bootstrap'
 */

import maplibregl from 'maplibre-gl'
import map from '@/js/map'
import {Service} from '@/js/services'
import {isMobileDevice} from "@/js/device";
import {getState, setState} from "@/js/state";
import {AntPathPaint, AntpathDashArraySequence} from "@/js/map_paint";
import {featureCollection} from "@turf/turf";

console.debug("state", getState());

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

let globalServices = [];

async function fetchServices() {
    return fetch("https://mb.tiles.catonmap.info/services").then((res) => {
        // console.log("res", res);
        return res.json();
    }).then((serviceSummaries) => {
        // console.log("data", serviceSummaries);
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
            // service.greet();
            service.appendHTML(map);
            service.addSourceToMap(map);
            // service.addLayerToMap(map);
            service.initFromState(map);
            globalServices.push(service);
        })
    }).catch((err) => {
        console.error("err", err);
    });
}

// Once the map is loaded, fetch the services and initialize the cats.
// We await the fetchServices to ensure that the services are fetched before
// the cats are initialized. This ensures that the cat's antpaths are
// layered on top of any service layers.
// Obviously this is not the ideal way to manage layer ordering (TODO).
map.once("load", async () => {
    await fetchServices();
    return initCats();
});

// antpathStopAnimation is used to prevent the animation from running before the style is loaded.
// This can happen when the map style is changed, causing the sources to get removed.
// So the on-select watcher will toggle this value to false, and the styledata event will toggle it back to true.
let antpathStopAnimation = false;

async function fetchLineStringsForCat(cat) {
    const timeStart = Math.floor(Date.now() / 1000) - 60 * 60 * 18; // T-18hours
    const timeEnd = Math.floor(Date.now() / 1000);
    const params = new URLSearchParams({
        uuids: cat.properties.UUID,
        tstart: timeStart,
        tend: timeEnd,
    });
    const target = new URL(`https://cattracks.cc/linestring?${params.toString()}`).toString();

    return fetch(target).then((res) => {
        return res.json();
    }).then((featureCollection) => {
        // FILTER AND SORT

        // Filter them to be at least 0.4 km and 2 minutes.
        featureCollection.features = featureCollection.features.filter(feature => {
            return feature.properties.MeasuredSimplifiedTraversedKilometers >= 0.4 &&
                feature.properties.Duration > 60 * 2;
        });

        // Sort them to be in order of time; latest first.
        featureCollection.features.sort(function (a, b) {
            return a.properties.Start < b.properties.Start ? 1 : -1;
        });

        // console.debug(cat.properties.UUID, "data", featureCollection);
        return featureCollection;
    }).then((featureCollection) => {

        // // Only antpath the first (latest) <limit>.
        // const limit = 2;
        // if (featureCollection.features.length > limit) {
        //     featureCollection.features = featureCollection.features.slice(0, limit);
        // }

        if (map.getSource(`linestrings-${cat.properties.UUID}`)) {
            map.getSource(`linestrings-${cat.properties.UUID}`).setData(featureCollection);
        } else {
            map.addSource(`linestrings-${cat.properties.UUID}`, {
                type: 'geojson',
                data: featureCollection,
            });

            // https://docs.mapbox.com/mapbox-gl-js/example/animate-ant-path/
            map.addLayer({
                'id': `linestrings-background-${cat.properties.UUID}`,
                'type': 'line',
                'source': `linestrings-${cat.properties.UUID}`,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': AntPathPaint.background,
            });
            map.addLayer({
                'id': `linestrings-dashed-${cat.properties.UUID}`,
                'type': 'line',
                'source': `linestrings-${cat.properties.UUID}`,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': AntPathPaint.dashed,
            });
        }
        return featureCollection;
    }).then(featureCollection => {
        let step = 0;

        function animateDashArray(timestamp) {
            // If the styles are not loaded (they have recently changed),
            // this function will short-circuit.
            // This approach DEPENDS ON the fact that the styledata event will
            // call fetchLatestCats, re-initializing the linestrings.
            if (antpathStopAnimation) {
                return;
            }

            // Update line-dasharray using the next value in AntpathDashArraySequence. The
            // divisor in the expression `timestamp / 50` controls the animation speed.
            const newStep = parseInt(
                (timestamp / 50) % AntpathDashArraySequence.length
            );

            if (newStep !== step) {
                map.setPaintProperty(
                    `linestrings-dashed-${cat.properties.UUID}`,
                    'line-dasharray',
                    AntpathDashArraySequence[step]
                );
                step = newStep;
            }

            // Request the next frame of the animation.
            requestAnimationFrame(animateDashArray);
        }

        // start the animation
        animateDashArray(42);
    }).catch((err) => {
        console.error("err fetching linestrings", err);
    });
}

let catMarkers = [];

async function fetchLastCats() {
    $(`.catstatus-container`).empty();
    $(`.spinner-border`).show();
    return fetch("https://api.catonmap.info/lastknown").then((res) => {
        // console.log("res", res);
        return res.json();
    }).then((data) => {

        catMarkers.forEach((marker) => {
            marker.remove();
        });
        catMarkers = [];

        // console.log("data", data);

        // Push the statuses (originally in an object) into an array and sort them by time.
        let statuses = [];
        for (const [catName, status] of Object.entries(data)) {
            statuses.push(status);
        }

        statuses.sort((a, b) => {
            return b.properties.UnixTime - a.properties.UnixTime;
        })
        $(`.spinner-border`).hide();
        for (const status of statuses) {

            // LineStrings (async)
            fetchLineStringsForCat(status).then((lines) => {
                // console.log("lines", lines);
            }).catch((err) => {
                console.error("err", err);
            });

            // Markers
            // console.debug("status", status, "data", data);
            let $marker = $(`<div>`);
            $marker.addClass("cat-marker");
            $marker.css("background-image", `url(/assets/cat-icon.png)`);
            $marker.css("background-size", "contain");
            $marker.css("width", `30px`);
            $marker.css("height", `30px`);

            // add marker to map
            let marker = new maplibregl.Marker({element: $marker[0]})
                .setLngLat(status.geometry.coordinates);

            marker.addTo(map);
            catMarkers.push(marker);

            // Status Cards
            let cardBorder = "";
            if (/^rye/.test(status.properties.Name.toLowerCase())) {
                cardBorder = "text-bg-primary";
            } else if (/moto/.test(status.properties.Name.toLowerCase())) {
                cardBorder = "text-bg-danger";
            }
            let $card = $(`
                <div class="row justify-content-end mb-2">
                    <div class="d-flex px-0">
                        <div class="card ${cardBorder} px-2 cat-tracker-card border-0">
                            <div class="card-body p-1">
                                 <img src="/assets/cat-icon.png" alt="" height="16px" width="16px" style="display: inline; margin-bottom: 4px;">
                                <small>${status.properties.Name} - ${status.properties.Activity} - <span class="text-white">${timeAgo.format(new Date(status.properties.UnixTime * 1000), 'mini')}</span></small>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            $(`.catstatus-container`).each(function () {
                let $clone = $card.clone();
                $clone.on("click", () => {
                    map.flyTo({
                        center: status.geometry.coordinates,
                        // zoom: 13,
                        speed: 1.5,
                    })
                });
                $(this).append($clone);
            })

        }

    }).catch((err) => {
        console.error("err", err);
    });
}

function updateCatStatusRefreshProgressBar(percentRemaining) {
    $(`#catstatus-refetch-timer`).attr("aria-valuenow", `${percentRemaining}`);
    $(`#catstatus-refetch-timer > .progress-bar`).css("width", `${percentRemaining}%`);
}

// initCats is a small wrapper around fetchCats which
// enable the antpath animation, fetches the cats, and
// sets up recurring polling for new cat statuses.
async function initCats() {
    // Toggle the global variable allowing the antpath animation to run.
    antpathStopAnimation = false;
    // ... and refetch the cats (and their linestrings) to resume
    // with fresh cats and fresh linestrings antpaths.
    return fetchLastCats().then(() => {
        $(`#catstatus-refetch-timer`).removeClass("d-none");
        const refreshInterval = 60*1000;
        let refetchCountdownRemaining = refreshInterval;

        setInterval(() => {
            refetchCountdownRemaining -= 1000;
            let percentRemaining = Math.floor(refetchCountdownRemaining / (refreshInterval) * 100);
            updateCatStatusRefreshProgressBar(percentRemaining);
        }, 1000);
        setInterval(() => {
            fetchLastCats();
            refetchCountdownRemaining = refreshInterval;
            updateCatStatusRefreshProgressBar(100);
        }, 1000 * 60);
    });
}

// fetchLastCats();

function getSnapsLastOpened() {
    const defaultDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let lastOpened = localStorage.getItem("snaps-last-opened");
    if (lastOpened === null) {
        lastOpened = defaultDate.toISOString();
        localStorage.setItem("snaps-last-opened", lastOpened);
        $(`#snaps-notification`).removeClass("d-none");
    }
    return new Date(lastOpened);
}

function setSnapsLastOpened() {
    localStorage.setItem("snaps-last-opened", new Date().toISOString());
    $(`#snaps-notification`).addClass("d-none");
}

$(`#snaps-view-button`).on("click", setSnapsLastOpened);

async function fetchSnaps() {
    return fetch(`https://api.catonmap.info/catsnaps?tstart=${Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30}`).then((res) => {
        // console.log("res", res);
        return res.json();
    }).then((data) => {
        // console.log("data", data);
        data = data.filter((d) => {
            return typeof d.properties.imgS3 !== "undefined";
        })
        data.sort((a, b) => {
            return b.properties.UnixTime - a.properties.UnixTime;
        });

        let popupsOnMap = [];

        const snapsLastOpened = getSnapsLastOpened();

        data.forEach((snap) => {
            const s3URL = `https://s3.us-east-2.amazonaws.com/${snap.properties.imgS3}`;
            const snapTime = new Date(snap.properties.Time);
            const localTimeStr = snapTime.toLocaleString();

            if (snapTime > snapsLastOpened) {
                $(`#snaps-notification`).removeClass("d-none");
            }

            // We'll reuse the card for both the drawer-list view
            // and the map popup.
            let $cardImg = $("<img>").attr("src", s3URL).addClass("card-img-top");
            let $card = $(`
            <div class="card mb-2">
                <div class="card-body">
                  <div class="row justify-content-between">
                    <div class="col">
                        <p class="card-text text-start">
                            <span>${snap.properties.Name}</span>
                        </p>
                    </div>
                    <div class="col">
                        <p class="card-text text-end">
                            <span class="text-end">${localTimeStr}</span>
                        </p>
                    </div>
                  </div>
    
    
                </div>
            </div>
        `)
            $card.prepend($cardImg);

            // Popup
            //
            // Tweak the card content style for the popup.
            let $popupContent = $card.clone().removeClass("mb-2").addClass("m-0");
            // Add a link to the image source in the popup.
            $popupContent.find("img").wrap($("<a>").attr("href", s3URL).attr("target", "_blank"));
            const popup = new maplibregl.Popup({
                closeOnClick: true,
                closeButton: false,
            })
                .setLngLat(snap.geometry.coordinates)
                .setHTML($popupContent[0].outerHTML);

            // Now we can assign the handler to the card image destined for the list view
            // and add the card to the list.
            // We don't want to assign the listener to the popup card image
            // because clicking is supposed to open the popup.
            $cardImg.on("click", () => {
                if (!popup.isOpen()) popup.addTo(map);
                if (isMobileDevice()) {
                    let myOffCanvas = document.getElementById("offcanvasNavbarSnaps");
                    let openedCanvas = bootstrap.Offcanvas.getInstance(myOffCanvas);
                    openedCanvas.hide();
                }
                map.flyTo({
                    center: [snap.geometry.coordinates[0], snap.geometry.coordinates[1]],
                    zoom: 15,
                    speed: 1.5,
                })
            });

            // Finally append the card to the list.
            let $listElement = $(`<li class="nav-item"></li>`);
            $listElement.append($card);
            $("#catsnaps-list").append($listElement);

            // Markers

            // create a DOM element for the marker
            let $marker = $(`<div>`);
            $marker.addClass("snap-marker");
            $marker.css("background-image", `url(${s3URL})`);
            $marker.css("background-size", "contain");
            $marker.css("width", `30px`);
            $marker.css("height", `30px`);
            if (!getState().snapmarkers) $marker.css("display", "none");

            // add marker to map
            let marker = new maplibregl.Marker({element: $marker[0]})
                .setLngLat(snap.geometry.coordinates)
                .setPopup(popup);

            marker.addTo(map);


            // marker.on('click', () => {
            //     console.debug("popup.isOpen()", popup.isOpen());
            //     if (!popup.isOpen()) popup.addTo(map);
            //     // popup.addTo(map);
            // });

        });
    }).catch((err) => {
        console.error("err", err);
    });
}

map.once("load", fetchSnaps);

function addCatsnapMarkerToggleControl() {
    let $toggle = $(`
        <div id="catsnap-marker-toggle" class="maplibregl-ctrl maplibregl-ctrl-group">
            <button class="maplibregl-ctrl-icon btn" title="Toggle Cat Snap Markers">
                <i class="bi-camera-fill"></i>
            </button>
        </div>
    `);

    if (getState().snapmarkers) $toggle.find("button").addClass("bg-success").find("i").addClass("text-white");

    $toggle.on("click", () => {
        const newMarkerState = getState().snapmarkers ? null : true; // delete the param if false
        setState("snapmarkers", newMarkerState);
        if (newMarkerState) {
            $toggle.find("button").addClass("bg-success").find("i").addClass("text-white");
        } else {
            $toggle.find("button").removeClass("bg-success").find("i").removeClass("text-white");
        }

        let markers = document.getElementsByClassName("snap-marker");
        for (let marker of markers) {
            marker.style.display = newMarkerState ? "block" : "none";
        }
    });
    $(`.maplibregl-ctrl-top-right`).append($toggle[0]);
    // map.addControl({
    //     position: 'top-right',
    //     element: $toggle[0]
    // });
}


function addCatTrackerToggleControl() {
    // d-none d-xs-block d-sm-block d-md-block
    let $ctrl = $(`
        <div id="cattracker-toggle" class="maplibregl-ctrl maplibregl-ctrl-group">
            <button type="button" class="maplibregl-ctrl-icon btn" data-bs-toggle="modal" data-bs-target="#exampleModal" title="Show Cat Tracker">
                🐈
            </button>
        </div>
    `);
    $(`.maplibregl-ctrl-top-right`).append($ctrl[0]);
}

map.once("load", () => {
    addCatsnapMarkerToggleControl();
    if (isMobileDevice()) addCatTrackerToggleControl();
});

// Update the select option to whatever style is stateful.
document.getElementById('mapstyle-select').value = getState().style;


// > Unlike a mapping library like Leaflet, Mapbox GL JS doesn't have a concept of "basemap" vs "other layers."
// All layers are part of the same entity: the style. So you need to keep some state of the data layer
// around and call its source/addLayer on each change.
// https://stackoverflow.com/questions/36168658/mapbox-gl-setstyle-removes-layers
$(`.mapstyles-select`).on("change", (e) => {
    const style = e.target.value;

    // Toggle the antpathStopAnimation to true,
    // causing the antpath animation to stop.
    antpathStopAnimation = true;

    // https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#setstyle
    map.setStyle(style, {
        // https://maplibre.org/maplibre-gl-js/docs/API/types/StyleSwapOptions/
        diff: false,
    });
    setState("style", style);

    // Hide the offcanvas if it's open on mobile.
    // Users want to see the new map they just selected.
    if (isMobileDevice()) {
        let myOffCanvas = document.getElementById("offcanvasNavbarServices");
        let openedCanvas = bootstrap.Offcanvas.getInstance(myOffCanvas);
        openedCanvas.hide();
    }

    // HACKY shit... ?
    // https://github.com/mapbox/mapbox-gl-js/issues/4006
    // https://github.com/mapbox/mapbox-gl-js/issues/8660
    // When you call map.setStyle, it destroys everything.
    // So we have to reload all the service layers from scratch.
    // See comment above.

    map.once("styledata", () => {
        globalServices.forEach((service) => {
            service.addSourceToMap(map);
            service.initFromState(map);
        })

        // Toggle the global variable allowing the antpath animation to run.
        antpathStopAnimation = false;
        // ... and refetch the cats (and their linestrings) to resume
        // with fresh cats and fresh linestrings antpaths.
        fetchLastCats();
    });
});

