var log = App.logger;

App.RequestView = App.BaseMapperView.extend({
  className: "request",
  el : '.container-fluid',
  events : {
    'click #saveRequest' : 'saveRequest',
    'submit form.try' : 'tryRequest',
    'change input' : 'inputChanged',
    'change select' : 'inputChanged',
    'change textarea' : 'inputChanged'
  },
  initialize : function(){
    App.BaseMapperView.prototype.initialize.apply(this, arguments);
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
    
    this.$headersRaw = this.$el.find('textarea[name=headers]')
    .val(localStorage['headers']);
    
    this.$data = this.$el.find('textarea[name=data]')
    .val(localStorage['data']);
    
    this.$requestHeaders = this.$el.find('textarea[name=request-headers]');
    this.$requestRaw = this.$el.find('textarea[name=request-raw]');
    this.$responseHeaders = this.$el.find('.responseHeaders');
    this.$responseRaw = this.$el.find('textarea[name=response-raw]');
    this.$status = this.$el.find('.status');
    this.$sampleNodejs = this.$el.find('#sample-nodejs');
    this.$sampleCurl = this.$el.find('#sample-curl');
  },
  getFormValuesAsJSON : function(){
    var vals = this.$el.find('form').serializeArray();
    vals = _.object(_.map(vals, _.values))
    vals.headers = this.parseHeaders(vals.headers);
    return vals;
  },
  inputChanged : function(e){
    var input = $(e.target),
    name = input.attr('name'),
    value = input.val();
    localStorage.setItem(name, value);
    this.model.set(name, value);
  },
  saveRequest : function(e){
    var self = this,
    request = this.getFormValuesAsJSON();
    this.model.save(request, {
      success : function(){
        self.trigger('notify', 'success', 'Notification saved successfully');
      }, 
      error : function(model, xhr){
        log.error(xhr.responseText);
        self.trigger('notify', 'error', 'Error saving mapping');
        self.saveError(xhr.responseJSON);
      }
    });
  },
  saveError : function(response){
    if (!response){
      return;
    }
    var self = this;
    _.each(response.errors, function(errorObject, errorKey){
      var el = self.$el.find('*[name=' + errorKey + ']'),
      msg = errorObject.message;
      if (!el){
        return;
      }
      var controlGroup = $(el.parents('.control-group'));
      controlGroup.addClass('error');
      if (msg){
        controlGroup.find('.help-inline').html(msg);  
      }
    });
  },
  tryRequest : function(e){
    if (e) e.preventDefault();
    var formData = this.getFormValuesAsJSON();
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
