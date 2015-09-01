var log = App.logger;

App.RequestView = Backbone.View.extend({
  className: "request",
  initialize : function(){
    this.tpl = Handlebars.compile($('#tplForm').html());
  },
  events : {
    'submit form.try' : 'onFormSubmit',
    'change input' : 'inputChanged',
    'change select' : 'inputChanged',
    'change textarea' : 'inputChanged'
  },
  el : '.container-fluid',
  render : function(){
    this.$el.html(this.tpl());
    this.$form = this.$el.find('form');
    this.$url = this.$el.find('input[name=url]')
    .val(localStorage.url);
    
    this.$method = this.$el.find('select[name=method]')
    .val(localStorage.method || 'GET');
    
    this.$contentType = this.$el.find('select[name=content-type]')
    .val(localStorage['content-type'] || 'GET');
    
    this.$headersRaw = this.$el.find('textarea[name=headers-raw]')
    .val(localStorage['headers-raw']);
    
    this.$payloadRaw = this.$el.find('textarea[name=payload-raw]')
    .val(localStorage['payload-raw']);
    
    this.$requestHeaders = this.$el.find('textarea[name=request-headers]');
    this.$requestRaw = this.$el.find('textarea[name=request-raw]');
    this.$responseHeaders = this.$el.find('.responseHeaders');
    this.$responseRaw = this.$el.find('textarea[name=response-raw]');
    this.$status = this.$el.find('.status');
    this.$sampleNodejs = this.$el.find('#sample-nodejs');
    this.$sampleCurl = this.$el.find('#sample-curl');
  },
  inputChanged : function(e){
    var input = $(e.target),
    name = input.attr('name'),
    value = input.val();
    localStorage.setItem(name, value);
  },
  onFormSubmit : function(e){
    if (e) e.preventDefault();
    
    var self = this;
    
    var url = this.$url.val();
    var method = this.$method.val();
    var headers = this.getHeaders();
    var payload = this.$payloadRaw.val();

    this.$requestHeaders.val('');
    this.$responseHeaders.val('');
    this.$responseRaw.val('');
    this.$status.text('In progress...');
    this.$form.addClass('request-pending').removeClass('request-failed');


    this.$sampleNodejs.val('');
    
    var reqParams = {
      url: url,
      method: method,
      headers: headers,
      data: payload
    };
    var $tplNodejsRequest = Handlebars.compile($('#tplNodejsRequest').html());
    this.$sampleNodejs.html($tplNodejsRequest(reqParams));
    var $tplCurlRequest = Handlebars.compile($('#tplCurlRequest').html());
    this.$sampleCurl.html($tplCurlRequest(reqParams));
    
    $.ajax({
      method: method,
      url: '/try',
      headers: $.extend( {}, headers, this.getOverrideHeaders( url ) ),
      data: method === 'GET' ? undefined : payload
    }).done(function( data, textStatus, xhr ) {
      log.debug('done');
      self.$form.removeClass('request-pending');
      self.$status.text( self.getStatusText( xhr ) );
      var requestHeaders = atob(xhr.getResponseHeader('x-try-headers'));
      self.$requestHeaders.val( requestHeaders );
      var requestRaw = atob(xhr.getResponseHeader('x-try-payload') || btoa(''));
      self.$requestRaw.val( requestRaw );
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
      var $responseHeadersTpl = Handlebars.compile($('#tplResponseHeaders').html());
      self.$responseHeaders.html($responseHeadersTpl({ headers : responseHeaders }));
      
      if ( xhr.responseJSON ) {
        self.$responseRaw.val( JSON.stringify( xhr.responseJSON, null, '  ') );
      } else {
        self.$responseRaw.val( xhr.responseText );
      }
    }).fail(function( xhr, textStatus ) {
      log.error('fail');
      log.error( textStatus );
      self.$status.text( self.getStatusText( xhr ) );
      self.$responseRaw.val( self.getErrorMessage.apply(self, arguments) );
      self.$form.addClass('request-failed').removeClass('request-pending');
    });
    return false;
  },
  getHeaders : function() {
    var baseHeaders = {
      'content-type': this.$contentType.val()
    };
    var parsedHeaders = this.parseHeaders( this.$headersRaw.val() );
    var headers = $.extend( baseHeaders, parsedHeaders );
    return headers;
  },
  getStatusText : function( xhr ) {
    return xhr.status + ' ' + xhr.statusText;
  },
  getOverrideHeaders : function( url ) {
    return {
      'x-request-url': url
    };
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
  parseHeaders : function( raw ) {
    var headers = {};
    raw.split('\n').forEach(function( line ) {
      var a = line.split(':', 2);
      if (a[0] && a[1]) headers[a[0].trim()] = a[1].trim();
    });
    log.debug('headers:');
    log.debug(headers);
    return headers;
  }
});
