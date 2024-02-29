import { main as home } from '@/js/home.js';
import { main as snaps } from '@/js/snaps.js';

switch (window.location.pathname) {
    case "/":
        home();
        break;
    case "/snaps.html":
        snaps();
        break;
    default:
        console.log("no main function for this page");
}
