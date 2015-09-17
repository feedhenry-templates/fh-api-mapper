var express = require('express'),
bodyParser = require('body-parser'),
requester = require('../requester'),
Request = require('../models/request.js');

function requestWithRequestObject(req, res, requestObject){
  return requester(requestObject, true, function(err, body){
    if (err){
      return res.status(err.code || 500).json(err);
    }
    return res.status(200).json(body);
  });
}

module.exports = function() {
  var router = new express.Router();
  router.use(bodyParser.json());
  
  router.post('/', function( req, res ) {
    var requestObject = req.body;
    return requestWithRequestObject(req, res, requestObject);
  });
  
  router.post('/:id', function( req, res ) {
    return Request.findOne({ _id : req.params.id }).populate('headers').exec(function(err, requestResult){
      if (err){
        return req.status(500).json(err);
      }
      if (!requestResult){
        return req.status(404).json({ message : 'Could not find request with id ' + req.params.id });
      }
      return requestWithRequestObject(req, res, requestResult);
    });
  });
  return router;
};
