"use strict";

var restify = require('restify');
var https = require('https');

function respond(req, res, next) {
   getArtist(req.params.name, function(result) { res.send(result);} ); 
    next();
}
var getArtist = function (name, callback) {
    var url = 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(name) + '&type=artist&limit=10';
    https.get(url, function(response) {
        var result = '';
        response.setEncoding("utf8");
        response.on('data', function (datum) {
            result += datum;
        });
        response.on('end', function() {
            callback(result);
        });
        response.on('error', function(err) {
            console.log('got an error here: ', err.message);
        });
    }).on('error', function(err) { 
        console.log('got error here instead', err);
    });
};

var server = restify.createServer();
server.get('/artist/:name', respond);
server.head('/artist/:name', respond);

server.listen(8081, function() {
    console.log('%s listening at %s', server.name, server.url);
});