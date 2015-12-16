var log = require('./logger.js');
var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
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
      self.lastSuccess = data;
      self.trigger('success', data);
    }).fail(function( xhr, textStatus ) {
      log.error('fail');
      log.error( textStatus );
      var status = self.getStatusText(xhr);
      var rawResponse = self.getErrorMessage.apply(self, arguments);
      self.trigger('fail', status, rawResponse);
    });
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
  getLastSuccess : function(cb){
    if (this.lastSuccess){
      return cb(null, this.lastSuccess);
    }
    this.listenToOnce(this, 'success', function(data){
      return cb(null, data);
    });
    this.listenToOnce(this, 'fail', cb);
    this.execute();
  }
});
