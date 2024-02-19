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


const paint_activity = {
    // https://maplibre.org/maplibre-style-spec/layers/#paint-circle-circle-color
    // https://docs.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
    'circle-color': [
        'match',
        ['get', 'Activity'],
        'Stationary', '#f32d2d',
        'Walking', '#e78719',
        'Running', '#028532',
        'Bike', '#3112f6',
        'Automotive', '#be00ff',
        'Unknown', '#00000000',
        /* else */ '#00000000',
    ],
    'circle-radius': 1.42,
    'circle-opacity': 1,
}

const paint_catcolor_for = function(cat) {
    var _default = {
        'circle-radius': 1.42,
        'circle-opacity': 1,
        'circle-color': '#00000000',
    };
    switch (cat) {
        case 'rye':
            return Object.assign(_default, {
                'circle-color': '#1f2aee',
            });
        case 'ia':
            return Object.assign(_default, {
                'circle-color': '#ee1f1f',
            });
    }
    return _default;
}

const paint_density = {
    'circle-radius': [
        'case',
        ['!', ['has', 'point_count']], 1,
        ['interpolate', ['exponential', 0.99], ['get', 'point_count'], 0, 1, 824232, 3],
    ],
    'circle-opacity': [
        'case',
        ['!', ['has', 'point_count']], 0.1,
        ['interpolate', ['exponential', 0.995], ['get', 'point_count'], 0, 0, 824232, 1],
    ],
    'circle-color': ['interpolate', ['exponential', 0.999], ['get', 'point_count'], 1, ['to-color', '#014FE7'], 824232, ['to-color', '#E74500']],
}

map.on('load', () => {
    map.addSource('cattracks-rye', {
        type: 'vector',
        tiles: [
            // `https://mb.tiles.catonmap.info/services/ia.level-23/tiles/{z}/{x}/{y}.pbf`,
            `https://mb.tiles.catonmap.info/services/rye.level-23/tiles/{z}/{x}/{y}.pbf`
        ],
        minzoom: 3,
        maxzoom: 18
    });

    map.addLayer({
        'id': 'cattracks-activites-rye',
        'type': 'circle',
        'source':  'cattracks-rye',
        'source-layer': 'rye.level-23',
        'paint': paint_density,
    });

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
