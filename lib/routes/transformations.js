var _ = require('underscore'),
transformations = require('../transformations');
module.exports = function(req, res){
  var transforms = [];
  _.each(transformations, function(value, key){
    if (key === '_set'){
      return;
    }
    transforms.push({name : key, type : value.type});
  });
  return res.json(transforms);
};
