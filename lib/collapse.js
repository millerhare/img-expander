var prefixedEvent   = require('prefixed-event');
var store           = require("./store");
var domBatchWrapper = require("dom-batch-wrapper");

var collapse = domBatchWrapper();

collapse.read = function(el) {
  var id      = el.getAttribute("data-id");
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
  var interval = 500;
  var el       = data.el;
  var childEl  = data.childEl;

  childEl.style.webkitTransform = "translate("+data.x+"px, "+data.y+"px) scale(1)";

  prefixedEvent.add(childEl, "TransitionEnd", function fn() {
    el.style.opacity = 1;
    childEl.parentNode.removeChild(childEl);
    el.removeAttribute("data-id");
    prefixedEvent.remove(childEl, "TransitionEnd", fn);
  });

  childEl.style.webkitTransition = "-webkit-transform "+interval+"ms";
}

module.exports = collapse;
