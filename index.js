var proxy = require("./proxy");

var uid   = 0;
var store = {};

function expand(el, cEl) {
  var src = el.src;
  var x   = el.offsetLeft;
  var y   = el.offsetTop;
  var w   = el.offsetWidth;
  var h   = el.offsetHeight;

  var cx = cEl.offsetLeft;
  var cy = cEl.offsetTop;
  var cw = cEl.offsetWidth;
  var ch = cEl.offsetHeight;

  var interval = 500;

  var nEl = document.createElement("div");
  nEl.style.position       = "absolute";
  nEl.style.left           = x+"px";
  nEl.style.top            = y+"px";
  nEl.style.width          = w+"px";
  nEl.style.height         = h+"px";
  nEl.style.background     = "url("+src+")";
  nEl.style.backgroundSize = "contain";
  nEl.style.backgroundRepeat = "no-repeat";
  nEl.style.backgroundPosition = "left center"; 
  nEl.style.webkitTransition =
      "  width  "+interval+"ms"
    + ", height "+interval+"ms"
    + ", top    "+interval+"ms"
    + ", left   "+interval+"ms";

  uid++;

  proxy(nEl, el, {
    events: ["click"],
    prefix: "expander"
  });

  el.style.opacity = 0;
  el.setAttribute("data-id", uid);
  nEl.setAttribute("data-id", uid);
  store[uid] = {
    master: el,
    child: nEl
  };

  document.body.appendChild(nEl);

  setTimeout(function() {
    nEl.style.left   = cx+"px";
    nEl.style.top    = cy+"px";
    nEl.style.width  = cw+"px";
    nEl.style.height = ch+"px";
  }, 0);

}

function toggle(el, cEl) {
  var uid = el.getAttribute("data-id");
  if(uid) {
    collapse(el);
  } else {
    expand(el, cEl);
  }
}

function collapse(el) {
  var id = el.getAttribute("data-id");
  nEl = store[id].child;
  el = store[id].master;

  var interval = 500;

  var src = el.src;
  var x   = el.offsetLeft;
  var y   = el.offsetTop;
  var w   = el.offsetWidth;
  var h   = el.offsetHeight;

  nEl.style.left           = x+"px";
  nEl.style.top            = y+"px";
  nEl.style.width          = w+"px";
  nEl.style.height         = h+"px";

  nEl.addEventListener("webkitTransitionEnd", function fn() {
    el.style.opacity = 1;
    nEl.parentNode.removeChild(nEl);
    nEl.removeEventListener("webkitTransitionEnd", fn);
  });

  nEl.style.webkitTransition =
      "  width  "+interval+"ms"
    + ", height "+interval+"ms"
    + ", top    "+interval+"ms"
    + ", left   "+interval+"ms";
}

module.exports = {
  expand:   expand,
  collapse: collapse,
  toggle:   toggle
};
