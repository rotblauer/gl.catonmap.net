/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */



// Test import of styles
import '@/styles/index.scss'


import map from '@/js/map'


fetch("https://mb.tiles.catonmap.info/services").
then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
}).catch((err) => {
    console.error("err", err);
});
