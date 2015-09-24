Handlebars.registerHelper('escapeSingleQuotes', function(data, options) {
  return data.replace(/'/g, "\\'");
});
Handlebars.registerHelper('escapeDoubleQuotes', function(data, options) {
  return data.replace(/"/g, '\\"');
});

Handlebars.registerHelper('fa', function(icon){
  return new Handlebars.SafeString('<i class="fa ' + icon + '"></i>');
});

Handlebars.registerHelper('renderSubMapping', function(type, value, parent){
  var html = '';
  if (type === 'array'){
    
  }
  if (type === 'object'){
    _.each(value, function(value, key){
      html += '<tr>';
      html += '<td></td>';
      html += '<td>'+ parent + '.' + key + '</td>';
      html += '<td></td>';
      html += '<td></td>';
      html += '<td></td>';
      html += '</tr>';
    });
  }
  return new Handlebars.SafeString(html);
});

Handlebars.registerPartial('headerRow', $('#tplHeaderRow').html().toString());
