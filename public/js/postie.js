(function( $ ) {

  var log = {
    debug: function() { console.log.apply(console, arguments); },
    info: function() { console.info.apply(console, arguments); },
    warn: function() { console.warn.apply(console, arguments); },
    error: function() { console.error.apply(console, arguments); },
  };

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
  var $responseHeaders = $('textarea[name=response-headers]', $form);
  var $responseRaw = $('textarea[name=response-raw]', $form);

  var $status = $('.status', $form);

  function tryRequest( form ) {
    log.debug('trying');
    var url = $url.val();
    var method = $method.val();
    var payload = $payloadRaw.val();

    $requestHeaders.val('');
    $responseHeaders.val('');
    $responseRaw.val('');
    $status.text('In progress...');
    $form.addClass('request-pending').removeClass('request-failed');

    $.ajax({
      method: method,
      url: '/try',
      headers: getHeaders( url ),
      data: method == 'GET' ? undefined : payload
    }).done(function( data, textStatus, xhr ) {
      log.debug('done');
      $form.removeClass('request-pending');
      $status.text( getStatusText( xhr ) );
      var requestHeaders = atob(xhr.getResponseHeader('x-try-headers'));
      $requestHeaders.val( requestHeaders );
      var responseHeaders = xhr.getAllResponseHeaders();
      responseHeaders = responseHeaders.split('\n').filter(function( line ) { return !/^x-try-headers/.test(line); }).join('\n');
      $responseHeaders.val( responseHeaders );
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

  function getStatusText( xhr ) {
    return xhr.status + ' ' + xhr.statusText;
  }

  function getHeaders( url ) {
    var baseHeaders = {
      'content-type': $contentType.val()
    };
    var parsedHeaders = parseHeaders( $headersRaw.val() );
    var overrideHeaders = {
      'x-request-url': url
    };
    var headers = $.extend( baseHeaders, parsedHeaders, overrideHeaders );
    log.debug(headers);
    return headers;
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