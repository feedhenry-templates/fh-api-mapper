Handlebars.registerHelper('escapeSingleQuotes', function(data) {
  return data.replace(/'/g, "\\'");
});
Handlebars.registerHelper('escapeDoubleQuotes', function(data) {
  return data.replace(/"/g, '\\"');
});

Handlebars.registerHelper('fa', function(icon){
  return new Handlebars.SafeString('<i class="fa ' + icon + '"></i>');
});

Handlebars.registerHelper('transformationsForField', function(field, transformations){
  if (!transformations ){
    // TODO: Figure this context passing bug
    transformations = App.listView.requestView.mappingView.transformations.toJSON();
  }
  var relevantTransformations = _.where(transformations, {type : field.type});
  var html = ['<select class="form-control" name="transformation">'];
  html.push('<option name="none">No transformation</option>');
  _.each(relevantTransformations, function(t){
    html.push('<option name="' + t.name + '">' + t.name + '</option>');
  });
  html.push('</select>');
  return new Handlebars.SafeString(html.join('\n'));
});

Handlebars.registerPartial('headerRow', $('#tplHeaderRow').html().toString());
