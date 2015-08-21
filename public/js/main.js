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
    } finally {
      return false;
    }
  });

  var $url = $('input[name=url]', $form)
    .val(localStorage.url)
    .change( saveToLocalStorage('url') );

  var $method = $('select[name=method]', $form)
    .val(localStorage.method || 'GET')
    .change( saveToLocalStorage('method') );

  var $headersRaw = $('textarea[name=headers-raw]', $form)
    .val(localStorage.headersRaw)
    .change( saveToLocalStorage('headersRaw') );

  var $bodyRaw = $('textarea[name=body-raw]', $form);

  function tryRequest( form ) {
    log.debug('trying');
    var headers = $.extend( {}, parseHeaders( $headersRaw.val() ), {
      'x-request-url': form.url.value
    });
    $.ajax({
      method: form.method.value,
      url: '/try',
      headers: $.extend({ 'x-request-url': form.url.value }, headers)
    }).done(function( data, textStatus, xhr ) {
      log.debug('done');
      log.debug( xhr );
      if ( xhr.responseJSON ) {
        $bodyRaw.val( JSON.stringify( xhr.responseJSON, null, '  ') );
      } else {
        $bodyRaw.val( xhr.responseText );
      }
    }).fail(function() {
      log.error('fail');
    });
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