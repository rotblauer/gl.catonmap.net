var qJSON = function qJSON(url) {
    return {
        type: "GET",
        url: url,
        // data: ,
        dataType: "json",
        timeout: 10000,
        beforeSend: function(request) {
            // request.setRequestHeader("Access-Control-Allow-Origin", "*");
            // request.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        },
        error: function(err) {
            ce("ajax error", url, JSON.stringify(err, null, 2));
        }
    };
};

module.exports = {
    qJSON
}
