(function(document, EventTarget) {

  /* Check various vendor-prefixed versions of Element.matches */
  function matches(selector, currentNode) {
    var vendors = ["webkit", "ms", "moz"],
        count = vendors.length, vendor, i;

    for(i = 0; i < count; i++) {
      vendor = vendors[i];
      if((vendor + "MatchesSelector") in currentNode) {
        return currentNode[vendor + "MatchesSelector"](selector);
      }
    }
  }

  /* Traverse DOM from event target up to parent, searching for selector */
  function passedThrough(event, selector, stopAt) {
    var currentNode = event.target;

    while(true) {
      if(matches(selector, currentNode)) {
        return currentNode;
      }
      else if(currentNode != stopAt && currentNode != document.body) {
        currentNode = currentNode.parentNode;
      }
      else {
        return false;
      }
    }
  }

  /* Extend the EventTarget prototype to add a delegateEventListener() event */
  EventTarget.prototype.delegateEventListener = function(eName, toFind, fn) {
    this.addEventListener(eName, function(event) {
      var found = passedThrough(event, toFind, event.currentTarget);

      if(found) {
        // Execute the callback with the context set to the found element
        // jQuery goes way further, it even has it's own event object
        fn.call(found, event);
      }
    });
  };

}(window.document, window.EventTarget || window.Element));