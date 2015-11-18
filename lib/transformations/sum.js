exports.type = "array";
exports.transform = function(values){
  var total = 0;
  if (!values.forEach){
    return;
  }
  values.forEach(function(value){
    if (typeof value === 'number'){
      total += value;
    }
  });
  return total;
};
