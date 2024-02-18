// Test import of a JavaScript module
import { example } from '@/js/example'

import maplibregl from 'maplibre-gl'

// Test import of an asset
import webpackLogo from '@/images/webpack-logo.svg'

// Test import of styles
import '@/styles/index.scss'

const map = new maplibregl.Map({
    container: 'map', // container id
    style:
        'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [-74.5, 40], // starting position
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new maplibregl.NavigationControl());
