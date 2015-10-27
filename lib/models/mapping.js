var mongoose = require('mongoose'),
Schema = mongoose.Schema,
_ = require('underscore'),
transformations = require('../transformations'),
validTypes = ['array', 'number', 'object', 'string', 'boolean', 'custom'],
typeField = {
  type: String,
  "enum" : validTypes
},
transformationField = {
  type : String,
  validate : function(val){
    return transformations.hasOwnProperty(val);
  }
},
/*
 Recursive function to generate a new mapping object from a completed request body
 */
_mappingFromField = function(response, key){
  var type = typeof(response),
  mapping = { type : type, from : key };
  type = _.isArray(response) ? 'array' : type;
  
  if (type === 'object'){
    mapping.fields = [];
    _.each(response, function(value, key){
      mapping.fields.push(_mappingFromField(value, key));
    });
  }
  return mapping;
},
MappingSchema, MappingModel;


MappingSchema = new Schema();
// NB Recursive fields need to be added using the .add() fn for sub-validation to work
MappingSchema.add({
  type: typeField,
  from : String,
  use : {
    type : Boolean,
    'default' : true
  },
  fields: { type : [MappingSchema]},
  to : String,
  transformation : transformationField,
  // exposes a transformation for reducing an array down to one value
  arrayTransformation: String,
  // Exposes a transformation which operates on every element of the array
  element : {
    type : typeField,
    transformation : transformationField,
    fields: { type : [MappingSchema]}
  }
});
MappingSchema.pre('validate', function(next) {
  // Conditional required fields are checked here
  // TODO - this is a bit nasty, but mongoose insists on outputting the field even if it hasn't been set...
  if (!this.type || (this.element && ((this.element.fields && this.element.fields.length > 0) || this.element.transformation) && !this.element.type)){
    var error = new mongoose.Error.ValidationError(this);
    error.errors.type = new mongoose.Error.ValidatorError({}, 'type is required.', 'notvalid');
    return next(error);
  }
  return next();
});
MappingSchema.statics.createFromResponse = function(response, cb){
  var mapping = _mappingFromField(response);
  var newMappingModel = new MappingModel(mapping);
  return newMappingModel.save(cb);
};

MappingModel = mongoose.model('Mapping', MappingSchema);
module.exports = MappingModel;
