// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  alert('You clicked ThreeJS!');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

//chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//  chrome.tabs.executeScript(null,{file:"contentscript.js"});
//});

chrome.tabs.onCreated.addListener(function(tab) {
  //  alert(
  //    'tabs.onCreated -- window: ' + tab.windowId + ' tab: ' + tab.id +
  //      ' title: ' + tab.title + ' index ' + tab.index + ' url:' + tab.url + ':');
  //
  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
  // alert('sending message');
  
  //alert("sending message");

  setTimeout((tab) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "write_to_dom"});
    });
  }, 2000);
});

chrome.tabs.onAttached.addListener(function(tabId, props) {
  console.log(
    'tabs.onAttached -- window: ' + props.newWindowId + ' tab: ' + tabId +
    ' index ' + props.newPosition);
});
