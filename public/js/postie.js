Handlebars.registerHelper('controlGroup', function(label, helpText, options) {
  // ensure `options` is always set correctly
  options = arguments[arguments.length-1];
  
  var field = '<div class="control-group">';
  if (arguments.length >= 2){
    field += '<label class="control-label">' + label + '</label>';  
  }
  field += '<div class="controls">';
  field += options.fn(this);
  if (arguments.length >= 3){
    field += '<span class="help-inline">' + helpText + '</span>';  
  }
  field += '</div>';
  field += '</div>';
  return new Handlebars.SafeString(field);
});

(function( $ ) {

  var log = {
    debug: function() { console.log.apply(console, arguments); },
    info: function() { console.info.apply(console, arguments); },
    warn: function() { console.warn.apply(console, arguments); },
    error: function() { console.error.apply(console, arguments); },
  };
  
  var $responseHeadersTpl = Handlebars.compile($('#tplResponseHeaders').html());
  var $formTpl = Handlebars.compile($('#tplForm').html());
  $('.container-fluid').html($formTpl());

  var $form = $('form.try');

  $('form.try').submit(function( e ) {
    try {
      tryRequest( this );
    } catch (e) {
      log.error(e);
    }
    return false;
  });

  var $url = $('input[name=url]', $form)
    .val(localStorage.url)
    .change( saveToLocalStorage('url') );

  var $method = $('select[name=method]', $form)
    .val(localStorage.method || 'GET')
    .change( saveToLocalStorage('method') );

  var $contentType = $('select[name=content-type]', $form)
    .val(localStorage.contentType || 'GET')
    .change( saveToLocalStorage('contentType') );

  var $headersRaw = $('textarea[name=headers-raw]', $form)
    .val(localStorage.headersRaw)
    .change( saveToLocalStorage('headersRaw') );

  var $payloadRaw = $('textarea[name=payload-raw]', $form)
    .val(localStorage.payloadRaw)
    .change( saveToLocalStorage('payloadRaw') );

  var $requestHeaders = $('textarea[name=request-headers]', $form);
  var $requestRaw = $('textarea[name=request-raw]', $form);
  var $responseHeaders = $('.responseHeaders', $form);
  var $responseRaw = $('textarea[name=response-raw]', $form);
  var $status = $('.status', $form);
  var $sampleNodejs = $('textarea[name=sample-nodejs]', $form);


  function tryRequest( form ) {
    log.debug('trying');
    var url = $url.val();
    var method = $method.val();
    var headers = getHeaders();
    var payload = $payloadRaw.val();

    $requestHeaders.val('');
    $responseHeaders.val('');
    $responseRaw.val('');
    $status.text('In progress...');
    $form.addClass('request-pending').removeClass('request-failed');


    $sampleNodejs.val('');
    var reqParams = {
      url: url,
      method: method,
      headers: headers,
      data: payload
    };
    resolveTemplate( 'nodejs-request.js', reqParams ).then(function( sample ) {
      $sampleNodejs.val( sample );
    });



    $.ajax({
      method: method,
      url: '/try',
      headers: $.extend( {}, headers, getOverrideHeaders( url ) ),
      data: method == 'GET' ? undefined : payload
    }).done(function( data, textStatus, xhr ) {
      log.debug('done');
      $form.removeClass('request-pending');
      $status.text( getStatusText( xhr ) );
      var requestHeaders = atob(xhr.getResponseHeader('x-try-headers'));
      $requestHeaders.val( requestHeaders );
      var requestRaw = atob(xhr.getResponseHeader('x-try-payload') || btoa(''));
      $requestRaw.val( requestRaw );
      var responseHeaders = xhr.getAllResponseHeaders();
      responseHeaders = responseHeaders.split('\n');
      responseHeaders = _.map(responseHeaders, function(header){
        // Filter out our internal headers
        if (/^x-try-/.test(header)){
          return;
        }
        // use a regex over string because omitting global flag only matches first :
        header = header.split(/:/);
        if (header.length !== 2){
          return;
        }
        return {name : header[0], value : header[1]};
      });
      responseHeaders = _.reject(responseHeaders, _.isEmpty);
      $responseHeaders.html($responseHeadersTpl({ headers : responseHeaders }));
      
      if ( xhr.responseJSON ) {
        $responseRaw.val( JSON.stringify( xhr.responseJSON, null, '  ') );
      } else {
        $responseRaw.val( xhr.responseText );
      }
    }).fail(function( xhr, textStatus, errorThrown ) {
      log.error('fail');
      log.error( textStatus );
      $status.text( getStatusText( xhr ) );
      $responseRaw.val( getErrorMessage.apply(this, arguments) );
      $form.addClass('request-failed').removeClass('request-pending');
    });
  }

  function resolveTemplate( templateName, reqParams ) {
    return $.ajax({
      url: 'templates/' + templateName,
      method: 'GET',
      dataType: 'text'
    }).then(
      function( template ) {
        template = template.replace( '__REQUEST_PARAMS__', JSON.stringify(reqParams, null, 2) );
        return template;
      }
    );
  }

  function getStatusText( xhr ) {
    return xhr.status + ' ' + xhr.statusText;
  }

  function getHeaders() {
    var baseHeaders = {
      'content-type': $contentType.val()
    };
    var parsedHeaders = parseHeaders( $headersRaw.val() );
    var headers = $.extend( baseHeaders, parsedHeaders );
    return headers;
  }

  function getOverrideHeaders( url ) {
    return {
      'x-request-url': url
    };
  }

  function getErrorMessage( xhr, textStatus, errorThrown ) {
    if (xhr.status == 0) {
      return 'Failed to reach endpoint';
    }
    if (xhr.responseText) {
      return xhr.responseText;
    }
    return textStatus;
  }

  function parseHeaders( raw ) {
    var headers = {};
    raw.split('\n').forEach(function( line ) {
      var a = line.split(':', 2);
      if (a[0] && a[1]) headers[a[0].trim()] = a[1].trim();
    });
    log.debug('headers:');
    log.debug(headers);
    return headers;
  }

  function saveToLocalStorage( key ) {
    return function() {
      localStorage[key] = $(this).val();
    };
  }

})( jQuery );
