Handlebars.registerHelper('escapeSingleQuotes', function(data, options) {
  return data.replace(/'/g, "\\'");
});
Handlebars.registerHelper('escapeDoubleQuotes', function(data, options) {
  return data.replace(/"/g, '\\"');
});

Handlebars.registerHelper('fa', function(icon){
  return new Handlebars.SafeString('<i class="fa ' + icon + '"></i>');
});

Handlebars.registerPartial('headerRow', $('#tplHeaderRow').html().toString());
