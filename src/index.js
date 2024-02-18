// Test import of a JavaScript module
import { example } from '@/js/example'

import maplibregl from 'maplibre-gl'
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder'

// Test import of an asset
import webpackLogo from '@/images/webpack-logo.svg'

// Test import of styles
import '@/styles/index.scss'


const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [-93, 45], // starting position
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new maplibregl.NavigationControl());

const geocoderApi = {
    forwardGeocode: async (config) => {
        const features = [];
        try {
            const request =
                `https://nominatim.openstreetmap.org/search?q=${
                    config.query
                }&format=geojson&polygon_geojson=1&addressdetails=1`;
            const response = await fetch(request);
            const geojson = await response.json();
            for (const feature of geojson.features) {
                const center = [
                    feature.bbox[0] +
                    (feature.bbox[2] - feature.bbox[0]) / 2,
                    feature.bbox[1] +
                    (feature.bbox[3] - feature.bbox[1]) / 2
                ];
                const point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: center
                    },
                    place_name: feature.properties.display_name,
                    properties: feature.properties,
                    text: feature.properties.display_name,
                    place_type: ['place'],
                    center
                };
                features.push(point);
            }
        } catch (e) {
            console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
            features
        };
    }
};

map.addControl(
    new MaplibreGeocoder(geocoderApi, {
        maplibregl: maplibregl,
        marker: false,
        flyTo: {
            zoom: 11,
        }
    })
);

