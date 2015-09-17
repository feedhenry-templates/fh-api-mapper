var log = App.logger;

App.RequestModel = Backbone.Model.extend({
  urlRoot : '/api/requests',
  idAttribute : '_id',
  execute : function(){
    this.trigger('trying');
    var self = this;
    
    $.ajax({
      url: '/try',
      method: 'post',
      data: JSON.stringify(this.toJSON()),
      contentType: "application/json"
    }).done(function( data ) {
      log.debug('done');
      self.trigger('success', data);
    }).fail(function( xhr, textStatus ) {
      log.error('fail');
      log.error( textStatus );
      var status = self.getStatusText(xhr);
      var rawResponse = self.getErrorMessage.apply(self, arguments);
      self.trigger('fail', status, rawResponse);
    });
  },
  getOverrideHeaders : function( url ) {
    return {
      'x-request-url': url
    };
  },
  getStatusText : function( xhr ) {
    return xhr.status + ' ' + xhr.statusText;
  },
  getErrorMessage : function( xhr, textStatus ) {
    if (xhr.status === 0) {
      return 'Failed to reach endpoint';
    }
    if (xhr.responseText) {
      return xhr.responseText;
    }
    return textStatus;
  },
  getResponseHeaders : function(xhr){
    var responseHeaders = xhr.getAllResponseHeaders();
    responseHeaders = responseHeaders.split('\n');
    responseHeaders = _.map(responseHeaders, function(header){
      // Filter out our internal headers
      if (/^x-try-/.test(header)){
        return;
      }
      // use a regex over string because omitting global flag only matches first :
      header = header.split(/:/);
      if (header.length !== 2){
        return;
      }
      return {name : header[0], value : header[1]};
    });
    responseHeaders = _.reject(responseHeaders, _.isEmpty);
    return responseHeaders;
  }
});
