# fh-api-mapper  [![Build Status](https://travis-ci.org/feedhenry-templates/fh-api-mapper.png?branch=master)](https://travis-ci.org/feedhenry-templates/fh-api-mapper)

> API Mapping Tool

##Getting started with the API Mapper
There are currently some workarounds needed to get the API Mapper up and running within the platform. 

1. Make the newly created service public
![Public Service](/public/images/publicservice.jpg)
2. Visit the data browser, and upgrade the database so this application has it's own database. Note the application needs to be first finished it's initial deploy and be running to perform this task. 
![Public Service](/public/images/databrowser.jpg)
3. Re-deploy the service
4. You can now use the API mapper under the "Preview" section of the studio. The mapper can be popped out of the studio fullscreen by visiting the deploy host of this service in a web browser. 

## Developing

    grunt serve

Open [http://localhost:8001/](http://localhost:8001/)

## Running Tests

    grunt test
