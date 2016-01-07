var log = require('./logger.js'),
BaseMapperView = require('./base.view.js'),
MappingModel = require('./mapping.model.js'),
MappingView = require('./mapping.view.js'),
Handlebars = require('./handlebars.js'),
_ = require('underscore'),
$ =require('jquery'),
ace = require('brace');
require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/monokai');

module.exports = BaseMapperView.extend({
  className: "request",
  autoRetry : true,
  events : {
    'click #saveRequest' : 'saveRequest',
    'click .btn-back' : 'back',
    'click .btn-delete' : 'deleteRequest',
    'submit form.try' : 'tryRequest',
    'click a.try' : 'tryRequest',
    'change input' : 'inputChanged',
    'change select' : 'inputChanged',
    'change textarea' : 'inputChanged',
    'click .add-header' : 'addHeaderField',
    'click .remove-header' : 'removeHeaderField',
    'change  select[name=method]' : 'render',
    'click .btn-add-mapping' : 'addMapping',
    'click #removeMapping' : 'removeMapping',
    'change #autoRetry' : 'toggleAutoRetry'
  },
  initialize : function(options){
    BaseMapperView.prototype.initialize.apply(this, arguments);
    this.tpl = Handlebars.compile($('#tplCreateEditRequestView').html());
    this.model = options.model;
    this.listenTo(this.model, 'success', this.onRequestSuccess);
    this.listenTo(this.model, 'fail', this.onRequestFailed);
    this.listenTo(this.model, 'trying', this.onRequestTrying);
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change:mapping', this.renderMapping);
    this.autoRetry = !(localStorage.getItem('autoRetry') === 'false');
  },
  render : function(){
    var model = this.model.toJSON();

    this.methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

    this.$el.html(this.tpl({
      model : model,
      isNew : this.model.isNew(),
      hasBody : typeof model.method !== 'undefined' && model.method !== 'GET',
      methods : this.methods
    }));
    
    this.$form = this.$el.find('form');
    this.$url = this.$el.find('input[name=url]');
    this.$method = this.$el.find('select[name=method]');
    this.$editableHeaders = this.$el.find('#editableHeaders');
    this.$data = this.$el.find('textarea[name=data]');
    this.$requestHeaders = this.$el.find('.request-headers');
    this.$requestRaw = this.$el.find('#requestRaw');
    this.$responseHeaders = this.$el.find('.response-headers');
    this.$responseRaw = this.$el.find('#responseRaw');
    this.$responseBodies = this.$el.find('#responseBody');
    this.$status = this.$el.find('.status');
    this.$sampleNodejs = this.$el.find('#sample-nodejs');
    this.$sampleFhService = this.$el.find('#sample-fhservice');
    this.$sampleCurl = this.$el.find('#sample-curl');
    this.$mountPath = this.$el.find('#mountPath');
    this.$mapping = this.$el.find('.fh-mapping');
    this.$tplNodejsRequest = Handlebars.compile($('#tplNodejsRequest').html());
    this.$tplFhServiceRequest = Handlebars.compile($('#tplFhServiceRequest').html());
    this.$tplCurlRequest = Handlebars.compile($('#tplCurlRequest').html());
    this.$tplEditableHeaders = Handlebars.compile($("#tplEditableHeaders").html());
    this.$tplHeaderRow = Handlebars.compile($("#tplHeaderRow").html());
    this.$tplRequestMappingContainer = Handlebars.compile($("#tplRequestMappingContainer").html());
    this.renderSnippets();
    this.renderHeaders();
    this.renderMapping();
    this.$el.find('#autoRetry').prop('checked', this.autoRetry);
  },
  renderSnippets : function(){
    // Set up sample snippets
    var snippetModel = this.model.toJSON();
    snippetModel.guid = guid || 'Unknown service GUID';
    snippetModel.fullUrl = window.location.origin + snippetModel.mountPath;
    this.$sampleNodejs.html(this.$tplNodejsRequest(snippetModel));
    this.$sampleFhService.html(this.$tplFhServiceRequest(snippetModel));
    this.$sampleCurl.html(this.$tplCurlRequest(snippetModel));
    this.renderEditors(this.$sampleNodejs, this.$sampleFhService, this.$sampleCurl);
  },
  renderHeaders : function(){
    var model = this.model.toJSON();
    model.headers = _.filter(model.headers, function(header){
      return _.isString(header.key) && header.key.toLowerCase() !== 'content-type';
    });
    this.$editableHeaders.html(this.$tplEditableHeaders({ model : model, hasBody : typeof model.method !== 'undefined' && model.method !== 'GET' }));
    this.$contentType = this.$el.find('select[name=content-type]');
    if (!model.headers || model.headers.length === 0){
      this.addHeaderField();
    }
    
    // Set the values for selects which we can't do in handlebars
    this.$method.val(this.model.get('method'));
    
    var contentType = _.findWhere(this.model.get('headers'), { key : 'content-type' });
    if (model.type !== 'GET' && contentType){
      this.$contentType.find('option[name="' + contentType.value + '"]').attr('selected', true);
    }
  },
  renderMapping : function(){
    if (this.model.isNew()){
      return;
    }
    this.$mapping.html(this.$tplRequestMappingContainer({ model : this.model.toJSON(), isNew : this.model.isNew() }));
    if (!this.model.has('mapping')){
      return;
    }
    this.renderMappingView(new MappingModel(this.model.get('mapping')));
  },
  back : function(){
    this.trigger('back');
    return false;
  },
  getFormValuesAsJSON : function(){
    var vals = this.$el.find('form').serializeArray(),
    mappedValues = {
      headers : []
    };
    // Map headers
    this.$el.find('.headerRow').each(function(){
      var key = $(this).find('input:first-of-type').val(),
      value = $(this).find('input:last-of-type').val();
      if (_.isEmpty(key)){
        return;
      }
      mappedValues.headers.push({key : key, value : value});
    });
    
    vals = _.object(_.map(vals, _.values));
    _.each(vals, function(value, key){
      if (key.match(/^headers/) || key === 'content-type'){
        return;
      }
      mappedValues[key] = value;
    });
    if (mappedValues.method !== "GET"){
      // This particular header gets treated as a separate input field, but 
      // our data schema serverside just treats it as any other header
      mappedValues.headers.push({ key : 'content-type', value : this.$contentType.val() });
    }else{
      mappedValues.body = null;
    }
    
    if (!mappedValues.mountPath && mappedValues.url){
      // Remove the protocol prefix
      var mountPath = mappedValues.url.replace(/^http(s)?:\/\//, ''),
      idx = mountPath.indexOf('/');
      if (idx === -1){
        // Likely to cause uniqueness constraint issues when the user goes to save..
        mountPath = '/';
      }else{
        mountPath = mountPath.substring(mountPath.indexOf('/'), mountPath.length);  
        // rip out query paths...
        mountPath = mountPath.replace(/\?.+$/g, '');
      }
      
      mappedValues.mountPath = mountPath;
      this.$mountPath.val(mountPath);
    }
    
    return mappedValues;  
  },
  inputChanged : function(){
    this.model.set(this.getFormValuesAsJSON());
    this.renderSnippets();
  },
  saveRequest : function(){
    var self = this,
    request = this.getFormValuesAsJSON();
    this.model.save(request, {
      success : function(){
        self.trigger('back', 'Request saved successfully');
      }, 
      error : function(model, xhr){
        log.error(xhr.responseText);
        var responseErr = xhr.responseJSON;
        var message = "Error saving request";
        if (responseErr && responseErr.errors){
          _.each(responseErr.errors, function(err){
            if (err.message){
              message += err.message + '\n';
            }
          });
        }
        self.trigger('notify', 'error', message);
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
    this.$requestHeaders.text('');
    this.$requestRaw.text('');
    this.$responseHeaders.val('');
    this.$responseRaw.text('');
    this.$status.text('In progress...');
    this.$el.addClass('request-pending').removeClass('request-done');
    this.$sampleNodejs.val('');
    this.$sampleFhService.val('');
    
    
  },
  onRequestSuccess : function(data){
    this.$el.removeClass('request-pending').addClass('request-done');
    var request = data.request,
    response = data.response,
    prettyResponseBody = response.body,
    prettyMappedBody = response.mapped,
    $tplHeaders = Handlebars.compile($('#tplHeaders').html()),
    $tplResponseBodies = Handlebars.compile($('#tplResponseBodies').html());
    
    if (_.isObject(prettyResponseBody)){
      prettyResponseBody = JSON.stringify(prettyResponseBody, null, 2);
      prettyMappedBody = JSON.stringify(prettyMappedBody, null, 2);
    }
    
    this.$status.text(response.statusCode);
    this.$requestHeaders.html( $tplHeaders({ headers : request.headers}) );
    this.$responseHeaders.html($tplHeaders({ headers : response.headers }));
    this.$requestRaw.text( request.raw );
    this.$responseRaw.text( response.raw );
    this.$responseBodies.html($tplResponseBodies({
      unmapped : prettyResponseBody,
      mapped : prettyMappedBody
    }));
    this.renderEditors(this.$el.find('#unmappedResponseBody'), this.$el.find('#mappedResponseBody'), this.$requestRaw, this.$responseRaw);
  },
  onRequestFailed : function(status, responseRaw){
    this.$status.text(status);
    this.$responseRaw.text(responseRaw);
    this.$el.addClass('request-done').removeClass('request-pending');
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
    var header = this.$tplHeaderRow({ key : "", value : "" });
    this.$el.find('#editableHeaders ul').append(header);
    return false;
  },
  removeHeaderField : function(e){
    var el = $(e.target),
    headerRow = el.parents('.headerRow');
    headerRow.remove();
    if (this.$el.find('#editableHeaders ul li.headerRow').size() === 0){
      this.addHeaderField();
    }
    return false;
  },
  addMapping : function(){
    var self = this,
    model = new MappingModel();
    model.request = self.model;
    model.save({}, {
      success : function(){
        self.model.set('mapping', model.toJSON());
      },
      error : function(model, response){
        var msg = 'Error creating new mapping';
        if (response.responseText && _.isString(response.responseText)){
          msg += ': ' + response.responseText;
        }
        self.trigger('notify', 'error', msg);
      }
    });
  },
  renderMappingView : function(model){
    var self = this;
    model.request = this.model;
    this.mappingView = new MappingView({
      request : this.model,
      // Will behave appropriate for both new and existing mapping models
      // new mappings will just call new MappingModel with undefined
      model : model
    });
    this.mappingView.render();
    this.$mapping.find('#mappingView').html(this.mappingView.$el);
    this.listenToOnce(this.mappingView, 'removed', function(){
      this.model.fetch();
    }, this);
    this.listenTo(this.mappingView, 'updated', function(){
      if (!this.autoRetry){
        return;
      }
      self.tryRequest();
    });
  },
  removeMapping : function(e){
    if (e){
      $(e.target).remove();
    }
    this.mappingView.removeMapping();
  },
  renderEditors : function(){
    _.each(arguments, function(el){
      el.attr('class', '');
      var id = el.attr('id'),
      type = el.data('type'),
      editor = ace.edit(id);
      if (['javascript', 'json'].indexOf(type)>-1){
        editor.setOptions({
            maxLines: Infinity
        });
        editor.getSession().setMode('ace/mode/' + type);
      }
      editor.setTheme('ace/theme/monokai');
      editor.setReadOnly(true);
    });
  },
  toggleAutoRetry : function(){
    this.autoRetry = !this.autoRetry;
    localStorage.setItem('autoRetry', this.autoRetry.toString());
  }
});
