import {AntPathPaint} from "@/js/map_paint";

export const LinestringsLastPush = (uuid) => {
    return {
        'id': `layer-lastpush-linestrings-${uuid}`,
        'type': 'line',
        'source': `lastpush-linestrings-${uuid}`,
        'layout': {
            'line-join': 'round', 'line-cap': 'round'
        },
        'paint': AntPathPaint.background,
    };
}

export const LinestringsLabels = (uuid) => {
    //  map.addLayer({
    //             'id': 'poi-labels',
    //             'type': 'symbol',
    //             'source': 'places',
    //             'layout': {
    //                 'text-field': ['get', 'description'],
    //                 'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    //                 'text-radial-offset': 0.5,
    //                 'text-justify': 'auto',
    //                 'icon-image': ['concat', ['get', 'icon'], '_15']
    //             }
    //         });

    // https://maplibre.org/maplibre-gl-js/docs/examples/variable-label-placement/
    // https://maplibre.org/maplibre-gl-js/docs/examples/display-and-style-rich-text-labels/
    // https://maplibre.org/maplibre-gl-js/docs/examples/cluster-html/

    return {
        'id': `linestrings-labels-${uuid}`,
        'type': 'symbol',
        'source': `linestrings-${uuid}`,
        'layout': {
            // https://maplibre.org/maplibre-style-spec/layers/#text-field
            // 'text-field': ['get', 'MeasuredSimplifiedTraversedKilometers'],
            // 'text-field': [
            //     'number-format',
            //     ['get', 'MeasuredSimplifiedTraversedKilometers'],
            //     {'min-fraction-digits': 1, 'max-fraction-digits': 1}
            // ],
            'text-field': [
                'format',
                ['get', 'Name'], {'font-scale': 1.0},
                '\n', {},
                ['number-format', ['get', 'MeasuredSimplifiedTraversedKilometers'], {
                    'min-fraction-digits': 0,
                    'max-fraction-digits': 2,
                }],
                {
                    'font-scale': 1.0,
                    // 'text-font': [
                    //     'literal',
                    //     ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
                    // ]
                },
                ' km', {},
                '\n', {},
                ['number-format', ['/', ['to-number', ['get', 'Duration']], 60], {
                    'min-fraction-digits': 0,
                    'max-fraction-digits': 1,
                }], {},
                ' min', {},
                '\n', {},
                ['number-format', ['get', 'KmpH'], {
                    'min-fraction-digits': 0,
                    'max-fraction-digits': 1,
                }],
                {
                    'font-scale': 1.0,
                },
                ' km/h', {},
            ],
            'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
            'text-radial-offset': 0.62,
            'text-justify': 'left', // 'auto'
            // 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            // 'text-size': 10
        },
        'paint': AntPathPaint.label,
    };
}

export const LinestringsDashed = (uuid) => {
    return {
        'id': `linestrings-dashed-${uuid}`,
        'type': 'line',
        'source': `linestrings-${uuid}`,
        'layout': {
            'line-join': 'round', 'line-cap': 'round'
        },
        'paint': AntPathPaint.dashed,
    };
}

export const LinestringsBackground = (uuid) => {
    return {
        'id': `linestrings-background-${uuid}`,
        'type': 'line',
        'source': `linestrings-${uuid}`,
        'layout': {
            'line-join': 'round', 'line-cap': 'round'
        },
        'paint': AntPathPaint.background,
    };
}