var express = require('express');
var bodyParser = require('body-parser');
var Request = require('../models/request.js');

module.exports = function() {
  var requests = new express.Router();
  requests.use(bodyParser.json());
  
  requests.get('/', function(req, res){
    Request.find({}).populate('headers').exec(function(err, requestsList){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(requestsList);
    });
  });
  
  requests.get('/:id', function(req, res){
    Request.findOne({ _id : req.params.id }).populate('headers').exec(function(err, requestResult){
      if (err){
        return res.status(500).json(err);
      }
      if (!requestResult){
        return res.status(401).json({ message : 'Could not find requested id ' + req.params.id });
      }
      return res.json(requestResult);
    });
  });
  
  requests.put('/:id', function(req, res){
    Request.update({ _id : req.params.id }, req.body, function(err, updateResult){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(updateResult);
    });
  });
  
  requests['delete']('/:id', function(req, res){
    Request.findOne({_id : req.params.id}).remove(function(err, removeRes){
      if (err){
        return res.status(500).json(err);
      }
      return res.json(removeRes);
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
  
  requests.use(function errorHandler(req, resp) {
    resp.status(500).send('No route found for ' + req.path);
  });

  return requests;
};
