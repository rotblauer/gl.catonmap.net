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
        'circle-radius': 1.6,
        'circle-opacity': 1,
    };
}

export function CatColor(catAlias) {
    var _default = {
        'circle-radius': 1.42,
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
        'circle-radius': [
            'case',
            ['!', ['has', 'point_count']], 1,
            [
                'interpolate',
                ['exponential', 0.99],
                ['get', 'point_count'],
                attrPointCount.min, 1,
                attrPointCount.max, 3,
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
            'interpolate',
            ['exponential', 0.9993],
            ['get', 'point_count'],
            attrPointCount.min, ['to-color', colorMap.density.min],
            attrPointCount.max, ['to-color', colorMap.density.max],
        ],
    };
}
