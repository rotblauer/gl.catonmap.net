/*
antimeridian_adjusted_bounds	"-158.237400,0.000000,173.403015,63.006706"
bounds
0	-158.2374
1	0
2	173.403015
3	63.006706
center	[…]
description	"ia.level-23"
format	"pbf"
generator	"tippecanoe v2.41.1"
generator_options	"/usr/local/bin/tippecano…lls/ia.level-23.json.gz"
map	"https://mb.tiles.catonma…services/ia.level-23/map"
maxzoom	18
minzoom	3
name	"ia.level-23"
scheme	"xyz"
strategies	'[{},{},{},{"coalesced_as…ced_as_needed":105912}]'
tilejson	"2.1.0"
tiles
0	"https://mb.tiles.catonmap.info/services/ia.level-23/tiles/{z}/{x}/{y}.pbf"
tilesize	512
tilestats	{…}
tippecanoe_decisions	'{"basezoom":18,"droprate…n_points_multiplier":1}'
type	"overlay"
vector_layers	[…]
version	"2"
 */

import $ from 'jquery';
import {Density, Activity, CatColor} from './map_paint';

const servicePrototype = {
    greet() {
        console.log(`hello, my name is ${this.name}!`);
    },

    appendHTML(map) {
        let $serviceOptions = $(`
        <li id="layer-options-${this.name}" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
               aria-expanded="false">
                ${this.name}
            </a>
            <ul class="dropdown-menu border-0 show">
                
                <div class="form-check form-switch">
                    <label class="form-check-label" for="flexSwitchCheckLayer-${this.name}-CatColor">Cat Color</label>
                </div>
                
                <div class="form-check form-switch">
                  <label class="form-check-label" for="flexSwitchCheckLayer-${this.name}-Activity">Activity</label>
                </div>
                <div class="form-check form-switch">
                  <label class="form-check-label" for="flexSwitchCheckLayer-${this.name}-Density">Density</label>
                </div>
                
<!--                <li>-->
<!--                    <hr class="dropdown-divider">-->
<!--                </li>-->
                
                <div class="mt-2">
                    <ul style="font-size: smaller;">
                        <li><span class="text-muted">Points count: ${this.tilestats.layers[0].count}</span></li>
                        <li><span class="text-muted">Points ranging: ${new Date(this.getLayerAttribute("UnixTime").values[1] * 1000).toLocaleDateString()} - ${new Date(this.getLayerAttribute("UnixTime").max * 1000).toLocaleString()}</span></li>
                    </ul>
                </div>
            </ul>
        </li>
      `);

        $("#services-list").append($serviceOptions);

        function checkboxLayerSwitcherFunction(_this, $element, layerType) {
            return function() {
                const isChecked = $element.prop('checked');
                if (isChecked) {
                    _this.addLayerToMap(map, layerType);
                } else {
                    _this.removeLayerFromMap(map, layerType);
                }
            }
        }

        const $catColorSwitcher = $(`<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckLayer-${this.name}-CatColor">`);
        $catColorSwitcher.change(checkboxLayerSwitcherFunction(this, $catColorSwitcher, "catcolor"));
        $serviceOptions.find(".form-check:eq(0)").prepend($catColorSwitcher);

        const $catActivitySwitcher = $(`<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckLayer-${this.name}-Activity">`);
        $catActivitySwitcher.change(checkboxLayerSwitcherFunction(this, $catActivitySwitcher, "activity"))
        $serviceOptions.find(".form-check:eq(1)").prepend($catActivitySwitcher);

        const $catDensitySwitcher = $(`<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckLayer-${this.name}-Density">`);
        $catDensitySwitcher.change(checkboxLayerSwitcherFunction(this, $catDensitySwitcher, "density"))
        $serviceOptions.find(".form-check:eq(2)").prepend($catDensitySwitcher);
    },

    addSourceToMap(map) {
        map.addSource(`cattracks-${this.name}`, {
            type: 'vector',
            tiles: this.tiles,
            minzoom: this.minzoom,
            maxzoom: this.maxzoom,
        });

    },

    addLayerToMap(map, layerType) {
        let layerOpts = {
            'id': `cattracks-${this.name}-${layerType}`,
            'type': 'circle',
            'source': `cattracks-${this.name}`,
            'source-layer': `${this.vector_layers[0].id}`,
            'paint': null,
        };
        switch (layerType) {
            case "catcolor":
                layerOpts.paint = CatColor(this.name.replace(/\.level\-23/g, ''));
                break;
            case "activity":
                layerOpts.paint = Activity();
                break;
            case "density":
                layerOpts.paint = Density(this);
                break;
        }
        map.addLayer(layerOpts);
    },

    removeLayerFromMap(map, layerType) {
        map.removeLayer(`cattracks-${this.name}-${layerType}`);
    },

    getLayerAttribute(attribute) {
        for (let attr of this.tilestats.layers[0].attributes) {
            if (attr.attribute === attribute) {
                return attr;
            }
        }
    },
};

export function Service(serviceData) {
    this.antimeridian_adjusted_bounds = serviceData.antimeridian_adjusted_bounds;
    this.bounds = serviceData.bounds;
    this.center = serviceData.center;
    this.description = serviceData.description;
    this.format = serviceData.format;
    this.maxzoom = serviceData.maxzoom;
    this.minzoom = serviceData.minzoom;
    this.name = serviceData.name;
    /*
    tiles
        0	"https://mb.tiles.catonmap.info/services/ia.level-23/tiles/{z}/{x}/{y}.pbf"
     */
    this.tiles = serviceData.tiles;
    this.tilesize = serviceData.tilesize;
    /*
    tilestats
    layerCount	1
    layers
        0
            attributeCount	10
            attributes
                0	{…}
                1	{…}
                2	{…}
                3	{…}
                4
                    attribute	"UnixTime"
                    count	1000
                    max	1708179119
                    min	1328787803
                    type	"number"
                    values	[…]
                5	{…}
                6
                    attribute	"point_count"
                    count	1000
                    max	824232
                    min	2
                    type	"number"
                    values	[…]
                7	{…}
                8	{…}
                9	{…}
            count	9910353
            geometry	"Point"
            layer	"ia.level-23"
     */
    this.tilestats = serviceData.tilestats;
    /*
    vector_layers
        0
            description	""
            fields
                Accuracy	"Number"
                Activity	"String"
                Elevation	"Number"
                Speed	"Number"
                UnixTime	"Number"
                clustered	"Boolean"
                point_count	"Number"
                point_count_abbreviated	"String"
                sqrt_point_count	"Number"
                tippecanoe_feature_density	"Number"
            id	"ia.level-23"
            maxzoom	18
            minzoom	3
     */
    this.vector_layers = serviceData.vector_layers;
}

Object.assign(Service.prototype, servicePrototype);

