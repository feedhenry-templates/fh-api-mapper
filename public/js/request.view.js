var log = App.logger;

App.RequestView = App.BaseMapperView.extend({
  className: "request",
  el : '.container-fluid',
  events : {
    'click #saveRequest' : 'saveRequest',
    'click .btn-back' : 'back',
    'click .btn-delete' : 'deleteRequest',
    'submit form.try' : 'tryRequest',
    'change input' : 'inputChanged',
    'change select' : 'inputChanged',
    'change textarea' : 'inputChanged',
    'click .btn-new-header' : 'addHeaderField',
    'change  select[name=method]' : 'render'
  },
  initialize : function(options){
    App.BaseMapperView.prototype.initialize.apply(this, arguments);
    this.tpl = Handlebars.compile($('#tplCreateEditRequestView').html());
    this.model = options.model;
    this.listenTo(this.model, 'success', this.onRequestSuccess);
    this.listenTo(this.model, 'fail', this.onRequestFailed);
    this.listenTo(this.model, 'trying', this.onRequestTrying);
  },
  render : function(){
    var model = this.model.toJSON();
    if (!model.headers){
      // Always render an empty form field for headers
      model.headers = [{key : '', value : ''}];
    }
    this.$el.html(this.tpl({
      model : model,
      isNew : this.model.isNew(),
      hasBody : model.method !== 'GET'
    }));
    
    this.$form = this.$el.find('form');
    this.$url = this.$el.find('input[name=url]');
    this.$method = this.$el.find('select[name=method]');
    this.$contentType = this.$el.find('select[name=content-type]');
    this.$data = this.$el.find('textarea[name=data]');
    this.$requestHeaders = this.$el.find('textarea[name=request-headers]');
    this.$requestRaw = this.$el.find('textarea[name=request-raw]');
    this.$responseHeaders = this.$el.find('.responseHeaders');
    this.$responseRaw = this.$el.find('textarea[name=response-raw]');
    this.$status = this.$el.find('.status');
    this.$sampleNodejs = this.$el.find('#sample-nodejs');
    this.$sampleCurl = this.$el.find('#sample-curl');
    
    // Set the values for selects which we can't do in handlebars
    this.$method.val(this.model.get('method'));
    // TODO: Fix this
    var contentType = _.findWhere(this.model.get('headers'), { key : 'content-type' });
    if (contentType){
      this.$contentType.find('option[name="' + contentType.value + '"]').attr('selected', true);
    }
    
  },
  back : function(){
    this.trigger('back');
  },
  getFormValuesAsJSON : function(){
    var vals = this.$el.find('form').serializeArray(),
    mappedValues = {
      headers : []
    };
    vals = _.object(_.map(vals, _.values));
    _.each(vals, function(value, key){
      if (key.match(/^headerKey[0-9]+$/)){
        var headerName = vals[key],
        headerValue = vals[key.replace('Key', 'Value')];
        if (headerName === ""){
          return;
        }
        mappedValues.headers.push({ key : headerName, value : headerValue });
      }else if (key.match(/^headerValue[0-9]+$/)){
        // handled in above clause - continue
        return;
      }else if (key === 'content-type'){
        mappedValues.headers.push({ key : 'content-type', value : value });
      }else{
        mappedValues[key] = value;
      }
    });
    return mappedValues;
  },
  inputChanged : function(){
    this.model.set(this.getFormValuesAsJSON());
  },
  saveRequest : function(){
    var self = this,
    request = this.getFormValuesAsJSON();
    this.model.save(request, {
      success : function(){
        self.trigger('notify', 'success', 'Notification saved successfully');
        self.trigger('back');
      }, 
      error : function(model, xhr){
        log.error(xhr.responseText);
        self.trigger('notify', 'error', 'Error saving request');
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
    log.debug({ 'headers' : headers});
    return headers;
  },
  deleteRequest : function(){
    var self = this;
    this.model.destroy({
      success : function(){
        self.trigger('back');
      },
      error : function(){
        self.trigger('notify', 'error', 'Error deleting request');
      }
    });
  },
  addHeaderField : function(){
    var headers = this.model.get('headers');
    headers.push({ key : '', value : '' });
    this.model.set('headers', headers);
    this.render();
  }
});
