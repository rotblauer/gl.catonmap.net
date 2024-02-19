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

fetch("https://api.catonmap.info/lastknown").
then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
}).catch((err) => {
    console.error("err", err);
});

fetch(`https://api.catonmap.info/catsnaps?tstart=${Math.floor(Date.now() / 1000) - 60*60*24*30}`).
then((res) => {
    console.log("res", res);
    return res.json();
}).then((data) => {
    console.log("data", data);
}).catch((err) => {
    console.error("err", err);
});
