/* jshint esversion:6 */

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

function getArtist(name) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:8081/artist/${encodeURIComponent(name)}`;
    http.get(url, (response) => {
      let result = '';
      response.setEncoding('utf8');
      response.on('data', (datum) => {
        result += datum;
      });
      response.on('end', () => {
        resolve(JSON.parse(result));
      });
      response.on('error', (err) => {
        reject(err.message);
      });
    }).on('error', (err) => {
      console.log('got error here instead', err);
    });
  });
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', 8080);
app.set('view-engine', 'pug');

app.get('/', (req, res) => {
  res.render('index.pug', { title: 'Spotification' });
  res.end();
});

function myLogger(req, res, next) {
  console.log('Searching for:', req.body.artistSearch);
  next();
}

app.post('/results', myLogger, (req, res) => {
  getArtist(req.body.artistSearch).then((result) => {
    const artists = JSON.parse(result);
    let listEls = '';
    let link = '';

    for (const artist of artists.artists.items) {
      if (artist.images[1] && artist.images[1].hasOwnProperty('url')) { link = artist.images[1].url; }
      listEls += `<dt><img src="${link}" class="img-thumbnail" alt="artist image" /></dt>
                        <dd><a href="${artist.external_urls.spotify}">${artist.name}</a></dd>`;
    }
    if (artists.artists.items.length === 0) { listEls = '<dt>No Artists found.</dt>'; }
    res.render('index.pug', { title: 'Spotification', content: listEls });
    res.end();
  }).catch((err) => {
    const sorry = 'Something went wrong. Sorry';
    const html = `<h1>${sorry}.</h1>`;
    res.render('index.pug', { title: 'Spotification', content: html });
    res.end();
    console.log(`${sorry}:\n`, err);
  });
});

app.listen(app.get('port'), () => {
  console.log('Server running on port 8081.');
});
