var debounce = require("lodash.debounce");
var proxy = require("./proxy");

var uid   = 0;
var store = {};

function expand(el, cEl, opts) {
  opts = opts || {};
  opts.pos = opts.pos || "center";

  if(opts.animation === undefined) {
   opts.animation = true;
  }

  var id = el.getAttribute("data-id");
  var src = el.src;
  var rect = el.getBoundingClientRect();
  var x   = rect.left + window.scrollX;
  var y   = rect.top  + window.scrollY;
  var w   = el.offsetWidth;
  var h   = el.offsetHeight;

  var rect = cEl.getBoundingClientRect();
  var cx   = rect.left + window.scrollX;
  var cy   = rect.top  + window.scrollY;
  var cw = cEl.offsetWidth;
  var ch = cEl.offsetHeight;

  var interval = 500;



  var nEl;
  if(id === null) {
    nEl = document.createElement("div");
  } else {
    nEl = store[id].child;
  }

  nEl.style.position       = "absolute";
  nEl.style.top            = "0px";
  nEl.style.left           = "0px";
  nEl.style.webkitTransformOrigin = "top left";
  nEl.style.width          = w+"px";
  nEl.style.height         = h+"px";
  nEl.style.background     = "url("+src+")";
  nEl.style.backgroundSize = "contain";
  nEl.style.backgroundPosition = "top left";
  nEl.style.backgroundRepeat = "no-repeat";

  if(opts.animation) {
    nEl.style.webkitTransition =
      "-webkit-transform "+interval+"ms";
  }

  if(id === null) {
    // Don't do it again!
    nEl.style.webkitTransform = "translate("+x+"px, "+y+"px)";
  }


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

  scalew = cw / w;
  scaleh = ch / h;
  if(scaleh < scalew) {
    scale = scaleh;
  } else {
    scale = scalew;
  }

  var tx, ty;

  var pos = opts.pos.split(/\s+/);
  if(pos.length < 2) {
    pos[1] = pos[0];
  }

  var posx = pos[0];
  var posy = pos[1];

  if(posx === "right") {
    tx = parseInt(cx, 10) + parseInt(cw, 10) - parseInt(w*scale, 10);
  } else if(posx === "center") {
    tx =  parseInt(cx, 10) + parseInt(cw, 10)/2 - parseInt(w*scale, 10)/2;
  } else {
    // LEFT
    tx = cx;
  }

  if(posy === "bottom") {
    ty = parseInt(cy, 10) + parseInt(ch, 10) - parseInt(h*scale, 10);
  } else if(posy === "center") {
    ty =  parseInt(cy, 10) + parseInt(ch, 10)/2 - parseInt(h*scale, 10)/2;
  } else {
    // TOP
    ty = cy;
  }

  setTimeout(function() {
    nEl.style.webkitTransform = "translate("+tx+"px, "+ty+"px) scale("+scale+")";
  }, 0);

  function resize() {
    opts.animation = false;
    expand(el, cEl, opts);
    nEl.style.opacity = 1;
  }

  resize = debounce(resize, 100, {
    trailing: true
  });

  window.addEventListener("resize", function(e) {
    nEl.style.opacity = 0;
    resize();
  }, false);

  if(opts.animation) {
    nEl.addEventListener("webkitTransitionEnd", function fn() {
      nEl.style.webkitTransition = "";
      nEl.removeEventListener("webkitTransitionEnd", fn);
    });
  }

  return nEl;
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
  var rect = el.getBoundingClientRect();
  var x   = rect.left + window.scrollX;
  var y   = rect.top  + window.scrollY;
  var w   = el.offsetWidth;
  var h   = el.offsetHeight;

  nEl.style.webkitTransform = "translate("+x+"px, "+y+"px) scale(1)";

  nEl.addEventListener("webkitTransitionEnd", function fn() {
    el.style.opacity = 1;
    nEl.parentNode.removeChild(nEl);
    el.removeAttribute("data-id");
    nEl.removeEventListener("webkitTransitionEnd", fn);
  });

  nEl.style.webkitTransition =
    "-webkit-transform    "+interval+"ms"
}

function isExpanded(el) {
  var id = el.getAttribute("data-id");
  if(id && store[id]) {
    return store[id];
  }
  return false;
}

module.exports = {
  expand:   expand,
  isExpanded: isExpanded,
  collapse: collapse,
  toggle:   toggle
};
