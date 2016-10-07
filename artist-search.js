"use strict";
/* jshint esversion:6 */

let http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser');
    
function getArtist(name) {
    return new Promise(function(resolve, reject) {
        let url = 'http://localhost:8081/artist/' + encodeURIComponent(name);
        http.get(url, function(response) {
            let result = '';
            response.setEncoding("utf8");
            response.on('data', function (datum) {
                result += datum;
            });
            response.on('end', function() {
                resolve(JSON.parse(result));
            });
            response.on('error', function(err) {
                reject(err.message);
            });
        }).on('error', function(err) { 
            console.log('got error here instead', err);
        });
    });
}

let app = express();
app.use(bodyParser.urlencoded({ extended:true }));
app.set('port', 8080);
app.set('view-engine', 'pug');

app.get('/', function(req, res) {
    let html = `<div class="col-md-6 col-md-offset-1" style="margin-top:20px;">
                <h1>Spotification</h1>
                <form action="/results" class="form-inline" method="post">
                <label for="artistSearch">Search: </label>
                <input type="text" name="artistSearch" placeholder="artist..." />
                <button type="submit" class="btn btn-sm btn-primary">Go!</button>
                </form><div>`;
    res.render('index.pug', {title: 'Spotification', 'body': html});
    res.end();
});

var myLogger = function(req, res, next) {
    console.log('Searching for:', req.body.artistSearch);
    next();
};


app.post('/results', myLogger, function (req, res) {
    getArtist(req.body.artistSearch).then(function(result) {
        let artists = JSON.parse(result);
        let listEls = '';
        let link = '';
        for (let artist of artists.artists.items) {
            if (artist.images[1] && artist.images[1].hasOwnProperty('url')) {link = artist.images[1].url;}
            listEls += `<li><a href="${artist.external_urls.spotify}">${artist.name}</a>
                        <img src="${link}" class="img-thumbnail" alt="artist image" /></li>`;
        }
        let html = `<div class="col-md-6 col-md-offset-1" style="margin-top:20px;">
                    <h1>Spotification</h1>
                    <ul>
                    ${listEls}
                    </ul>
                    </div>`;
        res.render('index.pug', {title: 'Spotification', 'body': html});
        res.end();
    }).catch(function(err) {
        let sorry = 'Something went wrong. Sorry';
        let html = `<h1>${sorry}.</h1>`;
        res.render('index.pug', {title: 'Spotification', 'body': html});
        res.end();
        console.log(`${sorry}:\n`, err);
    });
});

app.listen(app.get('port'), function() {
    console.log('Server running on port 8081.');
});