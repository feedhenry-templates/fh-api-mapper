var _ = require('underscore');
exports.type = "array";
exports.transform = function(values){
  var total = (typeof _.first(values) === 'number') ? 0 : "";
  if (!values.forEach){
    return;
  }
  values.forEach(function(value){
    if (typeof value === 'number' || typeof value === 'string'){
      total += value;
    }
  });
  return total;
};
