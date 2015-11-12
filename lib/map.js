var _ = require('underscore'),
map = function(mapping, body){
  var type = _.isArray(body) ? 'array' : typeof body,
  fields, // object based mappings 
  elementMapping; // array mapping to apply per-item
  if (!mapping){
    return body;
  }
  
  fields = mapping.fields;
  elementMapping = mapping.element;
  
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
  }else if (type === 'array'){
    // TODO cater for nested arrays
    // TODO cater for transformations
    if (!elementMapping){
      return body;
    }else if (elementMapping.fields){
      return _.map(body, function(arrayItem){
        return map(elementMapping, arrayItem);
      });
    }else{
      return body;
    }
  }else{
    // TODO: Cater for transformations (of string, bool, etc)
    return body;
  }
  
  return body;
  
};

module.exports = map;
