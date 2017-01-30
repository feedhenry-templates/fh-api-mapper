var _ = require('underscore'),
RequestModel = require('./request.model.js'),
RequestsListView = require('./requests.view.js'),
App = {};
$ = require('jquery');
jQuery = $;
window.jQuery = jQuery;
global.jQuery = jQuery;
var bootstrap = require('bootstrap');


App.bootstrap = bootstrap;
App.init = (function() {
  var path = window.location.pathname || "",
  id, model;
  // replace last trailing /
  path = path.replace(/\/$/, "");
  path = path.split('/');
  id = _.last(path);

  // Always have requestsListView as the bottom view in the stack
  var listView = App.listView = new RequestsListView().render();
  
  if (!path || !id){
   
  }

  if (id === 'new'){
    // Show create new page
    return listView.listenToOnce(listView.collection, 'sync', function(){
      // Only show create new page once the list collection has loaded - prevent double render
      return listView.showRequestView(new RequestModel());
    });
  }

  if (!_.contains(path, 'requests')) {
    return;
  }

  model = new RequestModel({ _id : id });
  model.fetch({
    success : function(){
      listView.showRequestView(model);
    },
    error : function(){
      listView.notify('failure', 'Failed to load request with id ' + id);
    }
  });
})();

module.exports = App;
