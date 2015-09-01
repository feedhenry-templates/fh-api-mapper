var log = App.logger;

App.RequestView = Backbone.View.extend({
  className: "request",
  el : '.container-fluid',
  events : {
    'submit form.try' : 'tryRequest',
    'change input' : 'inputChanged',
    'change select' : 'inputChanged',
    'change textarea' : 'inputChanged'
  },
  initialize : function(){
    this.tpl = Handlebars.compile($('#tplForm').html());
    this.model = new App.RequestModel();
    this.listenTo(this.model, 'success', this.onRequestSuccess);
    this.listenTo(this.model, 'fail', this.onRequestFailed);
    this.listenTo(this.model, 'trying', this.onRequestTrying);
  },
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
    this.model.set(name, value);
  },
  tryRequest : function(e){
    if (e) e.preventDefault();
    var formData = {
      method : this.$method.val(),
      url : this.$url.val(),
      headers : this.getHeaders(),
      'content-type' : this.$contentType.val(),
      data : this.$payloadRaw.val()
    };
    this.model.set(formData);
    this.model.execute();
    return false;
  },
  onRequestTrying : function(){
    // Empty all the fields
    this.$requestHeaders.val('');
    this.$responseHeaders.val('');
    this.$responseRaw.val('');
    this.$status.text('In progress...');
    this.$form.addClass('request-pending').removeClass('request-failed');
    this.$sampleNodejs.val('');
    
    // Set up sample snippets
    var $tplNodejsRequest = Handlebars.compile($('#tplNodejsRequest').html());
    this.$sampleNodejs.html($tplNodejsRequest(this.model.toJSON()));
    var $tplCurlRequest = Handlebars.compile($('#tplCurlRequest').html());
    this.$sampleCurl.html($tplCurlRequest(this.model.toJSON()));
  },
  onRequestSuccess : function(status, requestHeaders, requestRaw, responseHeaders, responseBody){
    this.$form.removeClass('request-pending');
    this.$status.text(status);
    this.$requestHeaders.val( requestHeaders );
    this.$requestRaw.val( requestRaw );
    
    var $responseHeadersTpl = Handlebars.compile($('#tplResponseHeaders').html());
    this.$responseHeaders.html($responseHeadersTpl({ headers : responseHeaders }));
    this.$responseRaw.val( responseBody );
  },
  onRequestFailed : function(status, responseRaw){
    this.$status.text(status);
    this.$responseRaw.val(responseRaw);
    this.$form.addClass('request-failed').removeClass('request-pending');
  },
  getHeaders : function() {
    var baseHeaders = {
      'content-type': this.$contentType.val()
    };
    var parsedHeaders = this.parseHeaders( this.$headersRaw.val() );
    var headers = _.extend( baseHeaders, parsedHeaders );
    return headers;
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
