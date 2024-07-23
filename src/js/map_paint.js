import Color from 'color';

const colorMap = {
    cat: {
        'rye': '#1238f6',
        'ia': '#ee1f1f',
    },
    density: {
        min: '#014FE7',
        max: '#E74500',
    },
    activity: {
        'Stationary': '#f32d2d',
        'Walking': '#e78719',
        'Running': '#028532',
        'Bike': '#1238f6',
        'Automotive': '#be00ff',
        'Unknown': '#000000',
    },

}

export const ColorMap = colorMap;

// technique based on https://jsfiddle.net/2mws8y3q/
// an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
export const AntpathDashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5],
]

// AntPathPaint is a collection of paint properties for the AntPath (linestring) layer.
// They are represented as Activities.
export const AntPathPaint = {
    'background': {
        // 'line-color': '#ce0000',
        'line-color': [
            'match',
            ['get', 'Activity'],
            ...function () {
                let arr = [];
                for (let [k, v] of Object.entries(colorMap.activity)) {
                    // arr.push(k, Color(v).lighten(0.7).hex());
                        arr.push(k, v);
                }
                return arr;
            }(),
            /* else */ '#000000',
        ],
        'line-width': 4,
        'line-opacity': 1,
    },
    'dashed': {
            // 'line-color': '#1238f6',
            'line-color': [
                'match',
                ['get', 'Activity'],
                ...function () {
                    let arr = [];
                    for (let [k, v] of Object.entries(colorMap.activity)) {
                        arr.push(k, "#FFFFFF");
                    }
                    return arr;
                }(),
                /* else */ '#000000',
            ],
            'line-width': 2,
            'line-dasharray': [0, 4, 3]
    },
    'label': {
        // https://maplibre.org/maplibre-style-spec/layers/#text-color
        'text-color': [
            'match',
            ['get', 'Activity'],
            ...function () {
                let arr = [];
                for (let [k, v] of Object.entries(colorMap.activity)) {
                    // arr.push(k, Color(v).lighten(0.7).hex());
                    arr.push(k, v);
                }
                return arr;
            }(),
            /* else */ '#000000',
        ],
        'text-halo-color': '#FFFFFF',
        'text-halo-width': 6,
        'text-halo-blur': 1,
        // 'line-width': 4,
        // 'line-opacity': 1,
    }
}

export function Activity() {
    return {
        // https://maplibre.org/maplibre-style-spec/layers/#paint-circle-circle-color
        // https://docs.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
        'circle-color': [
            'match',
            ['get', 'Activity'],
            ...function () {
                let arr = [];
                for (let [k, v] of Object.entries(colorMap.activity)) {
                    arr.push(k, v);
                }
                return arr;
            }(),
            /* else */ '#000000',
        ],
        // 'circle-blur': 0,
        'circle-radius': 2,
        'circle-opacity': 1,
    };
}

export function CatColor(catAlias) {
    var _default = {
        'circle-radius': 2,
        'circle-opacity': 1,
        'circle-color': '#000000',
    };
    switch (catAlias) {
        case 'rye':
            return Object.assign(_default, {
                'circle-color': colorMap.cat.rye,
            });
        case 'ia':
            return Object.assign(_default, {
                'circle-color': colorMap.cat.ia,
            });
        case 'edge':
        case 'devop':
            return Object.assign(_default, {
                'circle-color': [
                    'case',
                    ['in', 'rye', ['downcase', ['get', 'Name']]], colorMap.cat.rye,
                    ['in', 'moto', ['downcase', ['get', 'Name']]], colorMap.cat.ia,
                    ['in', 'papa', ['downcase', ['get', 'Name']]], colorMap.cat.ia,
                    '#000000'
                ]
            });
    }
    return _default;
}

export function Density(service) {
    const attrPointCount = service.getLayerAttribute('point_count');
    const attrAccuracy = service.getLayerAttribute('Accuracy');
    return {
        'circle-blur': [
            'case',
            ['!', ['has', 'point_count']], 1,
            [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                attrPointCount.min, 0,
                attrPointCount.max, 2,
            ],
        ],
        'circle-radius': [
            'case',
            ['!', ['has', 'point_count']], 1,
            [
                'interpolate',
                ['exponential', 0.995],
                ['get', 'point_count'],
                attrPointCount.min, 1,
                attrPointCount.max, 4,
            ],
        ],
        'circle-opacity': [
            'case',
            ['!', ['has', 'point_count']], 0.1,
            [
                'interpolate',
                ['exponential', 0.995],
                ['get', 'point_count'],
                attrPointCount.min, 0,
                attrPointCount.max, 1,
            ],
        ],
        // 'circle-blur': ['interpolate', ['linear'], ['get', 'Accuracy'], attrAccuracy.min, 0, attrAccuracy.max, 1],
        'circle-color': [
            'case',
            ['!', ['has', 'point_count']], colorMap.density.min,
            [
                'interpolate',
                ['exponential', 0.9993],
                ['get', 'point_count'],
                attrPointCount.min, ['to-color', colorMap.density.min],
                attrPointCount.max, ['to-color', colorMap.density.max],
            ],
        ],
    };
}

export function Recency(service) {
    // const attrPointCount = service.getLayerAttribute('point_count');
    const attrUnixTime = service.getLayerAttribute('UnixTime');
    let attrUnixTimeMin = attrUnixTime.min;
    if (/^rye/.test(service.uid)) {
        /*
        attribute	"UnixTime"
        count	1000
        max	1708750380
        min	-2177449139
        type	"number"
        values
        0	-2177449139
        1	1272964512
        2	1324918983
        3	1324920937
        4	1324930002
        5	1325073179
        6	1325076786
         */
        attrUnixTimeMin = 1324918983;
    }
    return {
        'circle-radius': [
            'case',
            ['!', ['has', 'UnixTime']], 1,
            [
                'interpolate',
                ['linear'],
                ['get', 'UnixTime'],
                attrUnixTimeMin, 1,
                attrUnixTime.max, 3,
            ],
        ],
        'circle-opacity': [
            'case',
            ['!', ['has', 'UnixTime']], 0.1,
            [
                'interpolate',
                ['linear'],
                ['get', 'UnixTime'],
                attrUnixTimeMin, 0,
                attrUnixTime.max, 1,
            ],
        ],
        'circle-color': [
            'case',
            ['!', ['has', 'UnixTime']], colorMap.density.min,
            [
                'interpolate',
                ['linear'],
                ['get', 'UnixTime'],
                attrUnixTimeMin, ['to-color', colorMap.density.min],
                attrUnixTime.max, ['to-color', colorMap.density.max],
            ],
        ],
    };
}
