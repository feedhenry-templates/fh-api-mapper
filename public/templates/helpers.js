Handlebars.registerHelper('escapeSingleQuotes', function(data, options) {
  return data.replace(/'/g, "\\'");
});
Handlebars.registerHelper('escapeDoubleQuotes', function(data, options) {
  return data.replace(/"/g, '\\"');
});
