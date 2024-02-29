import maplibregl from "maplibre-gl";
import {isMobileDevice} from "@/js/device";
import $ from "jquery";
import * as bootstrap from "bootstrap";

import Lightbox from 'bs5-lightbox';

const lightboxOptions = {
    keyboard: true,
    size: 'xl'
};

// import '@/styles/snaps.scss';

// import * as $ from "jquery";
import {getState} from "@/js/state";

import {timeAgo} from "@/js/timeago";

// https://gist.github.com/Bob2048/cf95235281544e23d14b
/* ============================================
 * bootstrap-infiniteScroll.js
 * ============================================ */

// !function ($) {
//     'use strict';
//
// }($);
// async function fetchSnaps() {
//     return fetch(`https://api.catonmap.info/catsnaps?tstart=${Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30}`).then((res) => {
//         // console.log("res", res);
//         return res.json();
//     }).then((data) => {
//         // console.log("data", data);
//         data = data.filter((d) => {
//             return typeof d.properties.imgS3 !== "undefined";
//         })
//         data.sort((a, b) => {
//             return b.properties.UnixTime - a.properties.UnixTime;
//         });
//
//         data.forEach((snap) => {
//
//
//         });
//     }).catch((err) => {
//         console.error("err", err);
//     });
// }

export function main() {
    console.debug("snaps page running");

    var InfiniteScroll = function (el, options) {
        console.debug("InfiniteScroll", el, options);
        this.$element = $(el);
        this.$options = options;

        this.executing = false;
        this.endOfResults = false;
        this.currentPage = 0;

        var that = this;

        $(window).scroll(function () {
            // console.debug("scrolling...");
            if ($(window).scrollTop() >= that.$options.calculateBottom()) {
                that.loadMore();
            }
        });

        // Init with twos loads.
        that.loadMore();
    };

    InfiniteScroll.prototype = {
        constructor: InfiniteScroll,

        loadMore: async function () {
            var $this = this;
            if ($this.executing || $this.endOfResults) return;

            $this.$element.find('.spinner-border').addClass('d-none');

            $this.executing = true;
            $this.currentPage += 1;
            // console.debug("loading more...", $this.currentPage);

            let params = {
                tstart: Math.floor(Date.now() / 1000) - ((60 * 60 * 24 * 30) * $this.currentPage),
                tend: Math.floor(Date.now() / 1000) - ((60 * 60 * 24 * 30) * ($this.currentPage - 1)),
            }

            return fetch($this.$options.url + `?${new URLSearchParams(params).toString()}`).then((res) => {
                return res.json();
            }).then((data) => {
                data = data.filter((d) => {
                    return typeof d.properties.imgS3 !== "undefined";
                })
                data.sort((a, b) => {
                    return b.properties.UnixTime - a.properties.UnixTime;
                });

                $this.$options.processResults(data);

                if (data.length === 0) {
                    $this.endOfResults = true;
                    $this.$element.find('#end-of-results').addClass('d-none');
                }

                $this.$element.find('.spinner-border').addClass('d-none');
                $this.executing = false;
            }).catch((err) => {
                console.error("err", err);
                $this.$element.find('.spinner-border').addClass('hide');
                $this.executing = false;
            });
        }
    };

    $.fn.infiniteScroll = function (option) {
        return this.each(function () {
            console.debug("$.fn.infiniteScroll", option);
            var $this = $(this),
                data = $this.data('infinite-scroll'),
                options = $.extend({}, $.fn.infiniteScroll.defaults, typeof option === 'object' && option);
            if (!data) $this.data('infinite-scroll', (data = new InfiniteScroll(this, options)));
            if (typeof option === 'string' && typeof data[option] === 'function') data[option]();
        });
    };

    $.fn.infiniteScroll.defaults = {
        calculateBottom: function () {
        },
        processResults: function () {
        },
        url: ''
    };

    $.fn.infiniteScroll.Constructor = InfiniteScroll;

    let is = $('#main-container').infiniteScroll({
        calculateBottom: function () {
            return ($('#main-container').position().top + $('#main-container').height()) - $(window).height() + 50;
        },
        processResults: function (data) {

            for (var i = 0; i < data.length; i++) {
                const snap = data[i];

                const s3URL = `https://s3.us-east-2.amazonaws.com/${snap.properties.imgS3}`;
                const snapTime = new Date(snap.properties.Time);
                const localTimeStr = snapTime.toLocaleString();
                const caption = `${snap.properties.Name} - ${localTimeStr}`;

                let $snapEl = $(`#snap-template`).clone();
                $snapEl.attr("href", s3URL);
                $snapEl.attr("data-caption", caption);
                // $snapEl.attr("data-gallery", `snaps-gallery-${snapTime.getFullYear()+""}-${snapTime.getMonth()+""}`);
                $snapEl.attr("data-gallery", `snaps-gallery`);
                $snapEl.find("img").attr("src", s3URL);
                // $snapEl.find("img").css("object-fit", "contain");
                $snapEl.find("figcaption").text(caption);
                $snapEl.removeClass("d-none");

                let $constraint = $(`<div></div>`);
                // $constraint.css("height", "300px");
                $constraint.addClass("col-sm-6 col-md-4 col-lg-3");
                $constraint.append($snapEl);

                $("#catsnaps-list").append($constraint);
            }

            $(`.snap-element`).off("click"); // remove all prior listeners from earlier pages
            $(`.snap-element`).on("click", function (e) {
                e.preventDefault();
                const lightbox = new Lightbox(this, lightboxOptions);
                lightbox.show();
            });
        },
        // url: $('#catsnaps-list').data('url'),
        url: 'https://api.catonmap.info/catsnaps',
    });


}
