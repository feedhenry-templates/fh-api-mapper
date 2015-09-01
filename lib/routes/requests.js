var express = require('express');
var bodyParser = require('body-parser');
var Request = require('../models/request.js');

module.exports = function() {
  var requests = new express.Router();
  requests.use(bodyParser.json());
  
  requests.get('/', function(req, res){
    Request.find({}, function(err, requestsList){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(requestsList);
    });
  });

  requests.post('/', function(req, res) {
    var createdRequest = new Request(req.body);
    createdRequest.save(function(err, newRequest){
      if (err){
        // TODO: Better validation error handling?
        return res.status(500).json(err);
      }
      return res.json(newRequest);
    });
  });
  
  requests.use(function errorHandler(err, req, resp) {
    resp.status(500).send(err.message);
  });

  return requests;
};
