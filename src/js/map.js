/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */
// Test import of a JavaScript module
import { geocoder } from '@/js/geocoder'

import { MaplibreExportControl, Size, PageOrientation, Format, DPI} from "@watergis/maplibre-gl-export";
import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';

import MaplibreInspect from 'maplibre-gl-inspect';
import 'maplibre-gl-inspect/dist/maplibre-gl-inspect.css';

// import MapboxDraw from "@mapbox/mapbox-gl-draw";
// import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import maplibregl from 'maplibre-gl'

import { getState, setState } from "@/js/state";
import {isMobileDevice} from "@/js/device";

export function initMap() {

    let initialState = getState();
    const map = new maplibregl.Map({
        container: 'map', // container id
        style: initialState.style || 'https://api.maptiler.com/maps/streets/style.json?key=XrsT3wNTcIE6gABWxyV5',
        center: [initialState.lng, initialState.lat], // starting position
        zoom: initialState.zoom, // starting zoom
        pitch: initialState.pitch,
        bearing: initialState.bearing,
        maxPitch: 80,
        minZoom: 1,
        maxZoom: 18,
    });

// Add zoom and rotation controls to the map.
// Geocoder does the search feature.
    geocoder.addToMap(map);

// Navigation control is a standard maplibre control, which comes with the map by default.
// Zoom +/-, compass, and ~~fullscreen~~.
    const mapCtrl = new maplibregl.NavigationControl({showCompass: true, showZoom: true, visualizePitch: true});
    map.addControl(mapCtrl);

    if (!isMobileDevice()) {
// Export control lets you print the map to PNG, JPEG, PDF, or SVG.
        map.addControl(new MaplibreExportControl({
            PageSize: Size.A4,
            PageOrientation: PageOrientation.Landscape,
            Format: Format.PNG,
            DPI: DPI[96],
            Crosshair: false,
            PrintableArea: true
        }), 'top-right');

// Inspect is a 'developer tool' that lets you inspect the map's features.
// Unfortunately it doesn't work out of the box to inspect the cattracks.
        map.addControl(new MaplibreInspect({
            popup: new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false
            })
        }));
    }



// Draw lets you draw geojson shapes on the map.
// var Draw = new MapboxDraw();
// map.addControl(Draw, 'top-left');

// map.addControl(new maplibregl.TerrainControl({
//     source: "terrain"
// }));
// const mapHash = new maplibregl.Hash();
// mapHash.addTo(map);

    map.on('moveend' , () => {
        setState('lat', map.getCenter().lat.toFixed(6));
        setState('lng', map.getCenter().lng.toFixed(6));
        setState('zoom', map.getZoom().toFixed(1));
        // setState('style', map.getStyle());
        setState('pitch', map.getPitch().toFixed(0));
        setState('bearing', map.getBearing().toFixed(0));
    });

    map.on('zoomend', () => {
        setState('zoom', map.getZoom().toFixed(1));
    });

    map.on('load', () => {
    });

    return map;
}
