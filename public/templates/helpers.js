Handlebars.registerHelper('escapeSingleQuotes', function(data, options) {
  return data.replace(/'/g, "\\'");
});
Handlebars.registerHelper('escapeDoubleQuotes', function(data, options) {
  return data.replace(/"/g, '\\"');
});
Handlebars.registerHelper('controlGroup', function(label, helpText, options) {
  // ensure `options` is always set correctly
  options = arguments[arguments.length-1];
  
  var field = '<div class="control-group">';
  if (arguments.length >= 2){
    field += '<label class="control-label">' + label + '</label>';  
  }
  field += '<div class="controls">';
  field += options.fn(this);
  if (arguments.length >= 3){
    field += '<span class="help-inline">' + helpText + '</span>';  
  }
  field += '</div>';
  field += '</div>';
  return new Handlebars.SafeString(field);
});
