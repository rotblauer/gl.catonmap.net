/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */
// Test import of a JavaScript module
import { geocoder } from '@/js/geocoder'

import { MaplibreExportControl, Size, PageOrientation, Format, DPI} from "@watergis/maplibre-gl-export";
import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css';

import MaplibreInspect from 'maplibre-gl-inspect';
import 'maplibre-gl-inspect/dist/maplibre-gl-inspect.css';

import maplibregl from 'maplibre-gl'

import { getState, setState } from "@/js/state";

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
geocoder.addToMap(map);
map.addControl(new maplibregl.NavigationControl());
map.addControl(new MaplibreExportControl({
    PageSize: Size.A4,
    PageOrientation: PageOrientation.Landscape,
    Format: Format.PNG,
    DPI: DPI[96],
    Crosshair: false,
    PrintableArea: true
}), 'top-right');
map.addControl(new MaplibreInspect({
    popup: new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    })
}));
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
    // map.addSource('cattracks-rye', {
    //     type: 'vector',
    //     tiles: [
    //         // `https://mb.tiles.catonmap.info/services/ia.level-23/tiles/{z}/{x}/{y}.pbf`,
    //         `https://mb.tiles.catonmap.info/services/rye.level-23/tiles/{z}/{x}/{y}.pbf`
    //     ],
    //     minzoom: 3,
    //     maxzoom: 18
    // });
    //
    // map.addLayer({
    //     'id': 'cattracks-activites-rye',
    //     'type': 'circle',
    //     'source':  'cattracks-rye',
    //     'source-layer': 'rye.level-23',
    //     'paint': paint_density,
    // });

    // map.addSource('cattracks-ia', {
    //     type: 'vector',
    //     tiles: [
    //         `https://mb.tiles.catonmap.info/services/ia.level-23/tiles/{z}/{x}/{y}.pbf`,
    //         // `https://mb.tiles.catonmap.info/services/rye.level-23/tiles/{z}/{x}/{y}.pbf`
    //     ],
    //     minzoom: 3,
    //     maxzoom: 18
    // });
    //
    // map.addLayer({
    //     'id': 'cattracks-activites-ia',
    //     'type': 'circle',
    //     'source':  'cattracks-ia',
    //     'source-layer': 'ia.level-23',
    //     'paint': paint_catcolor_for('ia'),
    //     // 'paint': paint_activity,
    // });

    // let snapsStart = Math.floor(Date.now() / 1000) - 60*60*24*30; // start time in unix seconds of T-1month
    // map.addSource('catsnaps', {
    //     type: 'geojson',
    //     url: `https://api.catonmap.info/catsnaps?tstart=${snapsStart}`,
    //     minzoom: 3,
    //     maxzoom: 18
    // });
    //
    // mapp.addLayer({
    //     'id': 'catsnaps',
    //     'type': 'circle',
    //     'source':  'catsnaps',
    //
    // });


// map.addSource( sourceName, {
//     type: 'vector',
//     tiles: [`http://localhost:3001/services/${tileService}/tiles/{z}/{x}/{y}.pbf`],
//     minzoom: 3,
//     maxzoom: 18
// });

})

export default map
