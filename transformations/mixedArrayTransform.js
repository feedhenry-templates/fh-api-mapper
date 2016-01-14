// First, tell the mapper what value types this transformation is valid for
exports.type = "array";
// Then, implement the transformation function
exports.transform = function(values){
  var newObj = {};
  values.forEach(function(val, idx){
    newObj[idx] = val;
  });
  return newObj;
  
};
