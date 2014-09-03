var Delegate = require("dom-delegate");
var ie       = require("../");

var container = document.querySelector(".target");
var prev;

var delegate = new Delegate(document.body);
delegate.on('click', '.images img', function(e, target) {
  if(prev) {
    ie.collapse(prev);
  }
  prev = target;
  ie.expand(target, container);
});

delegate.on('img-expander:click', '.images img', function(e, target) {
  ie.collapse(target);
});

