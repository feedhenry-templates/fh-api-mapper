var express = require('express');
var bodyParser = require('body-parser');

function errorHandler(err, req, resp) {
  resp.status(500).send(err.message);
}

module.exports = function() {
  var proxy = new express.Router();

  proxy.all('/',
    bodyParser.text(),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: false}),
    bodyParser.raw({ type: '*/*' }),
    errorHandler,

    function(req, resp) {

      var body = req.body;

      if (Buffer.isBuffer(req.body)) {
        body = req.body.toString('utf8');
      }

      var data = {
        headers: req.headers,
        body: body
      };
      resp.json(data);
    }
  );


  return proxy;
};