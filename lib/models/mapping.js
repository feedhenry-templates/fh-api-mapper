var mongoose = require('mongoose'),
Schema = mongoose.Schema,
_ = require('underscore'),
transformations = require('../transformations'),
validTypes = ['array', 'number', 'object', 'string', 'boolean', 'custom', 'mixed'],
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
Returns an accurate type, including array or not
 */
getTypeOfItem = function(item){
  var type = typeof(item);
  type = _.isArray(item) ? 'array' : type;
  return type;
},
/*
 Recursive function to generate a new mapping object from a completed request body
 */
_mappingFromField = function(response, key){
  var type = getTypeOfItem(response), 
  mapping = { type : type, from : key };
  
  if (type === 'object'){
    mapping.fields = [];
    _.each(response, function(value, key){
      mapping.fields.push(_mappingFromField(value, key));
    });
  }
  if (type === 'array' && response.length && response.length > 0){
    var firstField = _.first(response),
    expectedElementsType = getTypeOfItem(firstField),
    // Will store the ID of fields from sub-objects which we've already iterated over
    seenFields = [];
    
    mapping.element = {
      type : expectedElementsType,
      fields : []
    };
    
    for (var i=0; i<response.length; i++){
      var arrayItem = response[i],
      arrayItemType = getTypeOfItem(arrayItem),
      arrayItemFields; // If this arrayItemType is an object, this will contain a field{} for every property on that object
      
      // If our array contains mixed types, flag as such
      if (arrayItemType !== expectedElementsType){
        // make sure nothing else is set on the "element" property & return
        mapping.element = {
          mixed : true,
          type : 'mixed'
        };
        return mapping;
      }
      
      // No action needed if we don't see an object, but we need to iterate the entire array to ensure it's not "mixed"
      if (arrayItemType !== 'object' && arrayItemType !== 'array'){
        continue;
      }
      
      if (arrayItemType === 'array'){
        mapping.element = {
          type : 'array',
          from : null,
          element : _mappingFromField(arrayItem, '')
        };
      }else if (arrayItemType === 'object'){
        // build up a combined fields[] array which encompasses every possible field on every object we've seen in the array
        arrayItemFields = _mappingFromField(arrayItem, '').fields;
        // Remove any fields which we've seen from previous arrayItem(s) - this will be a common occurance
        arrayItemFields = _.filter(arrayItemFields, function(field){
          var fieldName = field.from;
          if (seenFields.indexOf(fieldName)>-1){
            return false;
          }
          seenFields.push(fieldName);
          return true;
        });
        // Now that we've filtered out previously seen items, append it to our parent fields list
        mapping.element.fields = mapping.element.fields.concat(arrayItemFields);
      }
    }
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
  // Exposes a transformation which operates on every element of the array
  element : {
    type : typeField,
    transformation : transformationField,
    fields: { type : [MappingSchema]},
    mixed : { 
      type : Boolean, 'default' : false
    },
    // TODO: Ideally this would be a sub-ref to itself, but the ORM
    // only allows this by `ref` - that makes create ops a PITA. 
    element : {
      type : Schema.Types.Mixed
    }
  }
});

MappingSchema.pre('save', function(next){
  // don't allow the element field on non-array types
  if (this.type !== 'array'){
    this.set('element', undefined);
  }
  return next();
});
MappingSchema.pre('validate', function(next) {
  // Conditional required fields are checked here
  // TODO - this is a bit nasty, but mongoose insists on outputting the field even if it hasn't been set...
  var element = this.get('element');
  if (element){
    if (element.fields && element.fields.length === 0){
      delete element.fields;
    }
    if (this.type !== 'array' || (element.mixed === false && !element.transformation && !element.element && (!element.fields || !element.fields.length))){
      element = undefined;
    }
    this.set('element', element);
  }
  
  if (!this.get('type') || (element && element.mixed !== true && !element.type)){
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

MappingSchema.post('update', function(){
  MappingModel.schema.emit('update', this._update.$set);
});
MappingSchema.post('save', function(model){
  MappingModel.schema.emit('save', model);
});


MappingModel = mongoose.model('Mapping', MappingSchema);
module.exports = MappingModel;
