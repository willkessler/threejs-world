chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");
      console.log('First href:', firstHref);
    } else if (request.message === 'write_to_dom') {
      //console.log('writing to dom');
      sendResponse(document.all[0].outerHTML);
    }
  }
);
