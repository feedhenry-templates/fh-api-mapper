var mongoose = require('mongoose'),
Schema = require('mongoose').Schema,
validators = require('mongoose-validators');

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
  }
});

mongoose.model('Header', Header);
module.exports = mongoose.model('Request', Request);
