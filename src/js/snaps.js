import maplibregl from "maplibre-gl";
import {isMobileDevice} from "@/js/device";
import $ from "jquery";
import * as bootstrap from "bootstrap";
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
            console.debug("scrolling...");
            if ($(window).scrollTop() >= that.$options.calculateBottom()) {
                that.loadMore();
            }
        });

        // Init with one load.
        that.loadMore();
    };

    InfiniteScroll.prototype = {
        constructor: InfiniteScroll,

        loadMore: function () {
            var $this = this;
            if ($this.executing || $this.endOfResults) return;

            $this.$element.find('.spinner-border').addClass('d-none');

            $this.executing = true;
            $this.currentPage += 1;
            console.debug("loading more...", $this.currentPage);

            let params = {
                tstart: Math.floor(Date.now() / 1000) - ((60 * 60 * 24 * 30) * $this.currentPage),
                tend: Math.floor(Date.now() / 1000) - ((60 * 60 * 24 * 30) * ($this.currentPage - 1)),
            }

            fetch($this.$options.url + `?${new URLSearchParams(params).toString()}`).then((res) => {
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

                $this.$element.find('.spinner-border').addClass('hide');
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

                let $card = $(`#snap-card-template`).clone();
                $card.removeClass("d-none");
                $card.find("img").attr("src", s3URL);
                $card.find("#snap-author").text(snap.properties.Name);
                $card.find("#snap-time-absolute").text(localTimeStr);
                $card.find("#snap-time-timeago").text(timeAgo.format(snapTime, 'mini') + " ago");

                // Finally append the card to the list.
                let $col = $(`<div></div>`)
                    .addClass("col-12 col-md-6 col-lg-4 col-xl-3");
                $col.append($card);
                $("#catsnaps-list").append($col);

            }
        },
        // url: $('#catsnaps-list').data('url'),
        url: 'https://api.catonmap.info/catsnaps',
    });


}
