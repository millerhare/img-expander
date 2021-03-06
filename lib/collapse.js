var stylePrefixer   = require("style-prefixer");
var prefixedEvent   = require("prefixed-event");
var domBatchWrapper = require("dom-batch-wrapper");
var store           = require("./store");

var collapse = domBatchWrapper();

collapse.read = function(el) {
  var id = el.getAttribute("data-img-expander-id");
  if(!store[id]) {
    // Attempting to collapse a non expanded node.
    return;
  }

  var el      = store[id].master;
  var childEl = store[id].child;

  var rect = el.getBoundingClientRect();

  return {
    el: el,
    childEl: childEl,
    x: rect.left + window.scrollX,
    y: rect.top  + window.scrollY
  };
}

collapse.write = function(data, el) {
  if(!data) {
    // Read failed
    return;
  }

  var interval = 250;
  var el       = data.el;
  var childEl  = data.childEl;

  var returnScale = childEl.getAttribute('data-return-to-scale') || 1;
  childEl.style[stylePrefixer("transform")] = "translate("+data.x+"px, "+data.y+"px) scale(" + returnScale + ")";
  childEl.style[stylePrefixer("backgroundPosition")] = "0 0";

  prefixedEvent.add(childEl, "TransitionEnd", function fn() {
    prefixedEvent.remove(childEl, "TransitionEnd", fn);
    el.removeAttribute("data-img-expander-id");
    el.style.opacity = 1;
    if (childEl.parentNode) {
      childEl.parentNode.removeChild(childEl);
    }
    //childEl.removeAttribute("data-return-to-scale");
  });

  childEl.style.webkitTransition = stylePrefixer("transform")+" "+interval+"ms";
}

module.exports = collapse;
