export function Activity()  {
    return {
        // https://maplibre.org/maplibre-style-spec/layers/#paint-circle-circle-color
        // https://docs.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
        'circle-color': [
            'match',
            ['get', 'Activity'],
            'Stationary', '#f32d2d',
            'Walking', '#e78719',
            'Running', '#028532',
            'Bike', '#1238f6',
            'Automotive', '#be00ff',
            'Unknown', '#000000',
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
                'circle-color': '#1238f6',
            });
        case 'ia':
            return Object.assign(_default, {
                'circle-color': '#ee1f1f',
            });
        case 'edge':
        case 'devop':
            return Object.assign(_default, {
                'circle-color': [
                    'case',
                    ['in', 'rye', ['downcase', ['get', 'Name']]], '#1238f6',
                    ['in', 'moto', ['downcase', ['get', 'Name']]], '#ee1f1f',
                    ['in', 'papa', ['downcase', ['get', 'Name']]], '#ee1f1f',
                    '#000000'
                ]
            });
    }
    return _default;
}

export function Density(service) {
    const attrPointCount = service.getLayerAttribute('point_count');
    return {
        'circle-radius': [
            'case',
            ['!', ['has', 'point_count']], 1,
            ['interpolate', ['exponential', 0.99], ['get', 'point_count'], attrPointCount.min, 1, attrPointCount.max, 3],
        ],
        'circle-opacity': [
            'case',
            ['!', ['has', 'point_count']], 0.1,
            ['interpolate', ['exponential', 0.995], ['get', 'point_count'], attrPointCount.min, 0, attrPointCount.max, 1],
        ],
        'circle-color': ['interpolate', ['exponential', 0.999], ['get', 'point_count'], attrPointCount.min, ['to-color', '#014FE7'], attrPointCount.max, ['to-color', '#E74500']],
    };
}
