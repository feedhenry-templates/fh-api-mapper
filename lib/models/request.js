var mongoose = require('mongoose'),
Schema = require('mongoose').Schema,
validators = require('mongoose-validators'),
requester = require('../requester'),
Mapping = require('./mapping');


var capitalize = function(val){
  return val.toUpperCase();
};
var Header = new Schema({
  key : {
    type : String
  },
  value : {
    type : String
  }
}),
Request = new Schema({
  url: {
    type: String,
    required: true,
    validate : validators.isURL()
  },
  method: {
    type: String,
    required: true,
    "enum" : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    set: capitalize
  },
  headers : {
    type : [Header]
  },
  // TODO: This may need to be Mixed to allow mapping JSON types
  body : {
    type : String
  },
  mapping : {    
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mapping'
  }
});

Request.methods.createMapping = function(requestObject, cb) {
  var request = this;
  return requester(requestObject, false, function(err, requestResult){
    if (err){
      return cb(err);
    }
    if (!requestResult || !requestResult.response || !requestResult.response.body){
      return cb('No response body was found from this request');
    }
    var responseBody = requestResult.response.body;
    Mapping.createFromResponse(responseBody, function(err, newMapping){
      if (err){
        return cb(err);
      }
      request.mapping = newMapping._id;
      return request.save(cb);
    });
  });
};


mongoose.model('Header', Header);
module.exports = mongoose.model('Request', Request);
