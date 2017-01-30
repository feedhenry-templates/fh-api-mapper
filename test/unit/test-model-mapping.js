var assert = require('assert');
var mongoose = require('mongoose');
var Mapping = require('../../lib/models/mapping');

exports.before = function(done) {
  mongoose.connect('mongodb://127.0.0.1:27017', function() {
    done();
  });
};

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
  mapping.save(function(err){
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

exports.it_should_create_array_mappings_with_existing_transformation = function(done){
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

exports.it_should_map_simple_objects = function(done){
  Mapping.createFromResponse({
    foo : 'bar'
  }, function(err, newMapping){
    assert.ok(!err);
    assert.ok(newMapping);
    assert.ok(newMapping.fields.length === 1);
    var field = newMapping.fields[0];
    assert.ok(field.from = 'foo');
    assert.ok(field.type = 'string');
    return done();
  });
};

exports.it_should_map_objects_which_contain_arrays_which_contain_arrays = function(done){
  Mapping.createFromResponse({
    title : 'bar',
    items : [
      {
        title : 'har',
        items : [{
          title : 'far'
        }]
      },
      {
        title : 'tar',
        items : []
      }
    ]
  }, function(err, newMapping){
    newMapping = newMapping.toObject();
    var arrayField = newMapping.fields[1];
    assert.ok(newMapping.fields[0].type ==='string');
    assert.ok(arrayField.type ==='array');
    assert.ok(arrayField.element.fields);
    var subArray = arrayField.element.fields[1].element;
    assert.ok(subArray);
    assert.ok(subArray.fields[0].from === 'title');
    return done();
  });
};

exports.it_should_map_arrays_of_mixed_fielded_objects = function(done){
  Mapping.createFromResponse([
    { id : 1, foo : 'bar' },
    { id : 2, foo : 'har', troo : 'mar' },
    { voo : 'kar' }
  ], function(err, newMapping){
    assert.ok(newMapping.type === 'array');
    assert.ok(newMapping.element.fields.length === 4);
    assert.ok(newMapping.element.fields[2].from === 'troo');
    return done();
  });
};

exports.it_should_mark_mixed_arrays_as_such = function(done){
  Mapping.createFromResponse({
    records : [
      { id : 2 },
      "",
      0
    ]
  }, function(err, newMapping){
    newMapping = newMapping.toObject();
    var recordsField = newMapping.fields[0].element;
    assert.ok(recordsField.mixed === true);
    return done();
  });
};

exports.after = function(done) {
  mongoose.connection.close();
  done();
};

