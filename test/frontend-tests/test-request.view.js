describe("App.RequestView", function () {

  var view, model;

  beforeEach(function () {
    model = new App.RequestModel();
    view = new App.RequestView({ model: model });
    view.render();
  });

  describe("getFormValuesAsJSON", function () {

    describe("headers", function() {

      it("no content-type for GET requests", function () {
        view.$method.val('GET').trigger('change');
        var contentType = view.$editableHeaders.find('[name=content-type]').val('text/plain');
        assert.equal(contentType.size(), 0);
        var data = view.getFormValuesAsJSON();
        assert.isArray(data.headers);
        assert.equal(data.headers.length, 0);
        assert.deepEqual(data.headers, []);
      });

      it("content-type options are available for non-GET requests", function() {
        assert.isArray(view.methods);
        _.each(view.methods, function( method ) {
          if (method !== 'GET') {
            view.$method.val(method).trigger('change');
            var contentType = view.$editableHeaders.find('[name=content-type]').val('text/plain');
            assert.equal(contentType.size(), 1);

            var data = view.getFormValuesAsJSON();
            assert.isArray(data.headers);
            assert.equal(data.headers.length, 1);
            assert.propertyVal(data.headers[0], "key", "content-type");
            assert.propertyVal(data.headers[0], "value", "text/plain");
          }
        });
      });

      it("allows to customize headers", function () {
        view.$method.val('GET').trigger('change');
        view.$editableHeaders.find('[name="headers.key"]').val('Authorization');
        view.$editableHeaders.find('[name="headers.value"]').val('Bearer ABCTOKEN=');
        var data = view.getFormValuesAsJSON();
        assert.isArray(data.headers);
        assert.equal(data.headers.length, 1);
        assert.propertyVal(data.headers[0], "key", "Authorization");
        assert.propertyVal(data.headers[0], "value", "Bearer ABCTOKEN=");
      });

    });

    describe("body", function() {

      it("no body for GET requests", function () {
        view.$method.val('GET').trigger('change');
        var body = view.$el.find('[name=body]');
        assert.equal(body.length, 0);
      });

      it("body is available for non-GET requests", function() {
        assert.isArray(view.methods);
        _.each(view.methods, function( method ) {
          if (method !== 'GET') {
            view.$method.val(method).trigger('change');
            var body = view.$el.find('[name=body]');
            assert.equal(body.length, 1);
            body.val('{}');
            var data = view.getFormValuesAsJSON();
            assert.equal(data.body, '{}');
          }
        });
      });
    });
  });
});
