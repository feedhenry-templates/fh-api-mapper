var App = {};

App.init = function() {
  var path = window.location.pathname || "",
  id, model;
  // replace last trailing /
  path = path.replace(/\/$/, "");
  path = path.split('/');
  id = _.last(path);

  // Always have requestsListView as the bottom view in the stack
  var listView = App.listView = new App.RequestsListView().render();
  
  if (!path || !id){
    return;
  }

  if (id === 'new'){
    // Show create new page
    return listView.listenToOnce(listView.collection, 'sync', function(){
      // Only show create new page once the list collection has loaded - prevent double render
      return listView.showRequestView(new App.RequestModel());
    });
  }

  model = new App.RequestModel({ _id : id });
  model.fetch({
    success : function(){
      listView.showRequestView(model);
    },
    error : function(){
      listView.notify('failure', 'Failed to load request with id ' + id);
    }
  });
};
