/*
    https://mb.tiles.catonmap.info/services/ia.level-23
 */


// Test import of styles
import '@/styles/index.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'
import $ from 'jquery'

// Import bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css'
import { main as home } from '@/js/home.js';

switch (window.location.pathname) {
    case "/":
        home();
        break;
    case "/snaps.html":
        console.log("snaps page js running");
        break;
    default:
        console.log("no main function for this page");
}
