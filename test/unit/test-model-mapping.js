var assert = require('assert'),
mongoose = require('mongoose'),
mockgoose = require('mockgoose'),
Mapping;

// in-memory mongoose for model testing
mockgoose(mongoose, true);

Mapping = require('../../lib/models/mapping');

exports.it_should_create_a_simple_mapping = function(done){
  var mapping = new Mapping({
    type : "object",
    fields : [
      {
        type : "number",
        from : "foo",
        to : "bar"
      }
    ]
  });
  return mapping.save(function(err){
    assert.ok(!err, 'Unable to create simple mapping: ' + err);
    return done();
  });
};

exports.it_should_create_a_more_complex_mapping = function(done){
  var mapping = new Mapping({
    type : "object",
    fields : [
      {
        type : "object",
        fields : [
          {
            from : "foo",
            to : "bar",
            type : "number"
          }
        ]
      }
    ]
  });
  return mapping.save(function(err){
    assert.ok(!err, 'Unable to create a complex mapping: ' + err);
    return done();
  });
};

exports.it_should_map_arrays_with_existing_transformation = function(done){
  var mapping = new Mapping({
    type : "object",
    fields : [
      {
        type : "object",
        fields : [
          {
            from : "fooarray",
            to : "bararray",
            type : "array",
            transformation : "capitalize"
          }
        ]
      }
    ]
  });
  return mapping.save(function(err){
    assert.ok(!err, 'Unable to create array mapping: ' + err);
    return done();
  });
};

exports.it_should_reject_transformations_which_dont_exist = function(done){
  var mapping = new Mapping({
    type : "object",
    fields : [
      {
        type : "object",
        fields : [
          {
            type : "array",
            transformation : "doesnotexist"
          }
        ]
      }
    ]
  });
  return mapping.save(function(err){
    assert.ok(err, 'It should reject a transform which doesnt exist ');
    return done();
  });
};

exports.it_should_require_element_types = function(done){
  var mapping = new Mapping({
    element : {  
      transformation : "capitalize",
      type : "string"
    }
  });
  return mapping.save(function(err){
    assert.ok(err, 'It should ensure fields have a type');
    var newMapping = new Mapping({
      from : 'foo',
      to: 'bar',
      type : "array",
      element : {
        transformation : "capitalize"
      }
    });
    return newMapping.save(function(err){
      assert.ok(err, 'It should ensure field elements have a type');
      return done();
    });
  });
};
