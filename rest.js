const restify = require('restify');
const https = require('https');

const getArtist = function (name, callback) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=10`;
  https.get(url, (response) => {
    let result = '';
    response.setEncoding('utf8');
    response.on('data', (datum) => {
      result += datum;
    });
    response.on('end', () => {
      callback(result);
    });
    response.on('error', (err) => {
      console.log('got an error here: ', err.message);
    });
  }).on('error', (err) => {
    console.log('got error here instead', err);
  });
};

function respond(req, res, next) {
  getArtist(req.params.name, (result) => { res.send(result); });
  next();
}

const server = restify.createServer();
server.get('/artist/:name', respond);
server.head('/artist/:name', respond);

server.listen(8081, () => {
  console.log('%s listening at %s', server.name, server.url);
});
