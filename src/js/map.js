/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */

// Test import of a JavaScript module
import { geocoder } from '@/js/geocoder'
import maplibregl from 'maplibre-gl'

const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [-93, 45], // starting position
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
geocoder.addToMap(map);
map.addControl(new maplibregl.NavigationControl());


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
