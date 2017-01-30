# API Mapper   [![Build Status](https://travis-ci.org/feedhenry-templates/fh-api-mapper.png?branch=master)](https://travis-ci.org/feedhenry-templates/fh-api-mapper)
The API Mapper is a visual tool for transforming the response of JSON APIs. It allows users to:

* Rename Fields
* Exclude fields which are not needed
* Transform Fields using built-in transformations, or custom transforms they have defined themselves

##Setup
There are currently some workarounds needed to get the API Mapper up and running within the platform. 

1. Make the newly created service public
![Public Service](/public/images/publicservice.jpg)
2. Visit the data browser, depending on your application configuration a "Upgrade Database" action will be available, this means the application is using an old/legacy shared database and it needs to be upgraded to use a dedicated one. Note the application needs to be first finished its initial deploy and be running to perform this task.
![Public Service](/public/images/databrowser.jpg)
3. Re-deploy the service
4. You can now use the API mapper under the "Preview" section of the studio. The mapper can be popped out of the studio fullscreen by visiting the deploy host of this service in a web browser. 

##Creating your first request
Today, we're going to connect to a GitHub JSON API.

1. To get started, from the home page of the api mapper, select "New Request". 
2. In the URL field, paste the URL of our API: `https://api.github.com/repos/feedhenry-templates/fh-api-mapper`
3. Our API requires us to add a `User-Agent` header field. In the "Header Key" value, write `User-Agent`. In the "Header Value" field, write `FHApiMapper`.
4. Let's set up where this API gets mounted. Select the "Mount Path" tab, and enter a mount path - we're using `/thisrepo`. 
5. Click 'Create Request'. We have now saved our first request.
6. Let's try this request. Click the blue "Send Request" button. 
7. In the "Response" section, verify the "Response Headers" and "Response Body" sections appear as expected. You can now see the response body. 

##Add a Mapping
1. Once we've created and saved a request, we can then add a mapping. Click the blue "Add a Mapping" button. 
2. Once the mapping is created, we see a list of fields the API returns on the left. This API has a lot of fields. We're now going to modify the response which our API returns. 
3. Click the "owner" field, and the "Field Mapping" panel should update. We can now define transformations on this field. 
4. We're going to discard the "owner" field, and all of it's children. Untick the "Use this field" box. The change is automatically saved. 
5. Let's rename the `id` field to be called `_id`. Select the "id" field on the left, and in the "rename field" box, type `_id`. 
6. Lastly, we're going to repurpose the boolean `private` field to be a `public` field. As part of this, we're also going to invert the value of this field. As before, rename the field from `private` to `public`. 
Now, select a transformation called "invert". 
7. Now that we've transformed our response, let's see it in action. In the "Response" section, visit the "Response Body" tab. 
On the left is the previous API response. On the right is the Mapped Response. 
8. Verify the mapped response has a field named "public" set to true, and the `id` field now reads `_id`. Verify there is no `owner` field. 

##Using the Mapped API
1. Now that we've mapped our API, let's make use of this. First, we're going to test the mapped API using the command line. 
2. Navigate to the "Sample Code" section. Copy the "cURL Request" to the clipboard, and try the command in a <abbr title="Unix, Linux or Mac">\*nix</abbr> terminal.
3. Verify the mapped response is returned. 
4. You can also use the Node.js code snippets. Copy the `Node.js Request Module` snippet into a new file called `test.js`. You can then run this file from the terminal by running `node test.js`. You should see the mapped response output. 

##Writing your own Mappings
As well as using built-in mappings, you can also write your own transformation functions. Here's how. 
1. In the studio's code editor, open the `application.js` file in the root directory.
2. You'll notice the API mapper route is instantiated by providing one optional transformation, called `mixedArrayTransform`. By looking at this, you can probably figure out how to add your own!  
We're going to add a transformation called 'even', which changes even numbers to 0, and odd numbers to 1 - really simple! Here's the implementation:
    
    // First, tell the mapper it operates on numbers
    exports.type = 'number';
    // then, implement the function.
    exports.transform = function(n){
      return n%2;
    };
      
3. Now that we've created our transformation file, we need to include it in `application.js`. We'll replace the instantiation of the API mapper route with something like this:
    
    app.use('/', require('./lib/api')({      
      transformations : {
        even : require('./transformations/even.js')
      }
    }));
    
4. You can now use your new transformation on numeric types!

## Developing

- Needs mongodb to run locally
  - e.g. `docker run -p 27017:27017 --name mongo_instance_001 -d mongo:3.2 --smallfiles`
- Needs env vars set to start and connect to mongo (mimicing a SaaS MBaaS)
  - e.g. `FH_SERVICE_APP_PUBLIC=true FH_MONGODB_CONN_URL=localhost:27017 npm start`

### Client
- Uses Patternfly http://www.patternfly.org/#_
- less in public/css, auto recompiles using less-middleware mounted as a route
  - https://github.com/feedhenry-templates/fh-api-mapper/tree/master/public/css
- static content under public/
  - https://github.com/feedhenry-templates/fh-api-mapper/tree/master/public
- browserified js, served via `app-built.js`
  - requires re-running `grunt browserify` to rebuild
- uses handlebars templates in views/templates (html files)
  - https://github.com/feedhenry-templates/fh-api-mapper/tree/master/views/templates
- uses bootstrap js
- uses backbone for models, collections & views https://github.com/feedhenry-templates/fh-api-mapper/tree/master/public/js
  - Models
    - Request https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/mapping.model.js
    - Mapping https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/request.model.js
  - Collections
    - Requests https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/requests.collection.js
    - Transformation https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/transformations.collection.js
  - Views
    - `base.view.js`, which others extend
      - https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/base.view.js
    - Request *Default View* (and request.html templates) https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/request.view.js
    - Requests (default view) (and requests.html template) https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/requests.view.js
    - Mapping (and mapping.html templates) https://github.com/feedhenry-templates/fh-api-mapper/blob/master/public/js/mapping.view.js

### Backend
- main api mapper routers in `lib/api.js`
  - https://github.com/feedhenry-templates/fh-api-mapper/blob/master/lib/api.js
- uses mongoose for requests and mappings models in lib/models/
  - https://github.com/feedhenry-templates/fh-api-mapper/tree/master/lib/models
- Mappings are dynamically mounted as routes in `lib/api.js` via populateSingleRoute & populateAllRoutes functions
  - Whenever a Request or Mapping changes, routes are updated
  - https://github.com/feedhenry-templates/fh-api-mapper/blob/master/lib/api.js#L33-L79

Open [http://localhost:8001/](http://localhost:8001/)

### Tests

```bash
npm test
```
