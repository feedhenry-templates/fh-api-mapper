var _ = require('underscore'),
transformations = require('./transformations'),
map = function(mapping, body){
  var type = _.isArray(body) ? 'array' : typeof body,
  fields, // object based mappings 
  elementMapping; // array mapping to apply per-item
  if (!mapping){
    return body;
  }
  
  fields = mapping.fields;
  elementMapping = mapping.element;
  
  if (mapping.transformation && transformations.hasOwnProperty(mapping.transformation)){
    var transformer = transformations[mapping.transformation];
    if (transformer.type === type){
      body = transformer.transform(body);
    }
  }
  
  if (type === 'object' && fields){
    var mapped = {};
    fields.forEach(function(f){
      if (!f.use){
        return;
      }
      var originalValue = body[f.from];
      var newKey = f.to || f.from;
      // apply the new value, recursively mapping each
      mapped[newKey] = map(f, originalValue);
    });
    return mapped;
  }else if (type === 'array' && elementMapping && elementMapping.fields && elementMapping.fields.length > 0){
    return _.map(body, function(arrayItem){
      return map(elementMapping, arrayItem);
    });
  }else if (type === 'array' && elementMapping && elementMapping.element){
    return _.map(body, function(arrayItem){
      return map(elementMapping.element, arrayItem);
    });
  }else{
    return body;
  }
};

module.exports = map;
