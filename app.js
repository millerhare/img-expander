var ie = require("./");

var el1 = document.querySelector(".test1");
var el2 = document.querySelector(".test2");

el1.addEventListener("click", function(e) {
  var selectEl = document.querySelector("select");
  var container = document.querySelector("."+selectEl.value);
  ie.expand(e.target, container);
})

el1.addEventListener("expander-proxy:click", function(e) {
  ie.collapse(e.detail.target);
})

