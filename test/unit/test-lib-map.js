var assert = require('assert'),
map = require('../../lib/map.js'),
transformations = require('../../lib/default_transformations'),
mapping = require('../fixtures/fixture-comprehensive-mapping.js'),
body = require('../fixtures/fixture-comprehensive-response.js');

exports.it_should_map_a_comprehensive_response = function(done){
  var mappedResponse = map(mapping, body);
  assert.ok(mappedResponse);
  
  //assert our "sum" on the array worked
  assert.ok(mappedResponse.arrayOfNumbers === 55);
  
  // Assert our rename-and-capitalize worked
  assert.ok(!mappedResponse.string);
  assert.ok(mappedResponse.ding === 'STRING');
  
  // Assert our bool got flipped
  assert.ok(mappedResponse.bool === false);
  
  // Assert our number got rounded
  assert.ok(mappedResponse.number === 3);
  
  // Assert our object & subobject stuff got mapped as expected
  assert.ok(mappedResponse.object.numPropRenamed === 1);
  assert.ok(mappedResponse.object.boolProp === false);
  assert.ok(mappedResponse.object.subObjectProp.b === false);
  assert.ok(mappedResponse.object.hasOwnProperty('emptyObjectProperty'));
  
  // Lastly, assert our transformation applied to the sub-arrays of our arrayOfArrays
  // stringify because we can't compare arrays with ===
  assert.ok(JSON.stringify(mappedResponse.arrayOfArrays) === '[1,2,3]');
  return done();
};

exports.it_should_map_with_custom_transforms = function(done){
  transformations._set('customStringConcat', {
    type : "array",
    transform : function(values){
      return values.join('');
    }
  });
  transformations._set('customMixedArrayTransform', {
    type : "array",
    transform : function(values){
      var newObj = {};
      values.forEach(function(val, idx){
        newObj[idx] = val;
      });
      return newObj;
    }
  });
  var mappedResponse = map(mapping, body);
  assert.ok(mappedResponse);
  assert.ok(mappedResponse.arrayOfStrings === 'abcdefg');
  // ensure the custom array mapping works, and transforms it into an object as expected
  assert.ok(!mappedResponse.mixedArray.hasOwnProperty('length'));
  return done();
};
