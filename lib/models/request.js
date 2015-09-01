var mongoose = require('mongoose'),
Schema = require('mongoose').Schema,
validators = require('mongoose-validators');

var capitalize = function(val){
  return val.toUpperCase();
},
lowercase = function(val){
  return val.toLowerCase();
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
  // TODO: Should this be just part of the headers? 
  contentType : {
    type: String,
    "enum" : [],
    set : lowercase
  },
  headers : {
    type : [Header]
  },
  // TODO: This may need to be Mixed to allow mapping JSON types
  body : {
    type : String
  }
});

module.exports = mongoose.model('Request', Request);
