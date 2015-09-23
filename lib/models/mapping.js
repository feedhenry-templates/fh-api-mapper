var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var Mappings = new Schema({
  type: {
    type: String,
    required: true,
    // TODO: Params for these need to be on the schema too! Subschemas??
    "enum" : ['array', 'number', 'object', 'string', 'boolean', 'custom']
  },
  from : {
    type : String,
    required : true
  },
  to : {
    type : String,
    required : true
  }
});

var Mapping = new Schema({
  name : {
    type: String,
    required: true // TODO: Should this be required?
  },
  mappings : {
    type : [Mappings],
    required : true
  },
  passThrough : {
    type : Boolean,
    "default" : false
  }
});

module.exports = mongoose.model('Mapping', Mapping);
