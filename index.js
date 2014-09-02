var debounce = require("lodash.debounce");
var proxy    = require("./lib/proxy");

var uid   = 0;
var store = {};

function expand() {
  var args = Array.prototype.slice.call(arguments);
  var data = expand.read.apply(this, args);
  args.unshift(data);
  expand.write.apply(this, args);
}

// The read (see <https://github.com/wilsonpage/fastdom>)
expand.read = function(el, cEl, opts) {
  var id         = el.getAttribute("data-id");
  var sourceRect = el.getBoundingClientRect();
  var destRect   = cEl.getBoundingClientRect();
  var scrollX    = window.scrollX;
  var scrollY    = window.scrollY;

  return {
    id:  id,
    src: el.src,
    x:   sourceRect.left + scrollX,
    y:   sourceRect.top  + scrollY,
    w:   el.offsetWidth,
    h:   el.offsetHeight,
    cx:  destRect.left + scrollX,
    cy:  destRect.top  + scrollY,
    cw:  cEl.offsetWidth,
    ch:  cEl.offsetHeight
  };
}


// The write (see <https://github.com/wilsonpage/fastdom>)
expand.write = function(data, el, cEl, opts) {
  opts = opts || {};
  opts.pos = opts.pos || "center";

  if(opts.animation === undefined) {
    opts.animation = true;
  }

  var nEl;
  if(data.id === null) {
    nEl = document.createElement("div");
  } else {
    nEl = store[data.id].child;
  }

  var interval = 500;

  nEl.style.position       = "absolute";
  nEl.style.top            = "0px";
  nEl.style.left           = "0px";
  nEl.style.webkitTransformOrigin = "top left";
  nEl.style.width          = data.w+"px";
  nEl.style.height         = data.h+"px";
  nEl.style.background     = "url("+data.src+")";
  nEl.style.backgroundSize = "contain";
  nEl.style.backgroundPosition = "top left";
  nEl.style.backgroundRepeat = "no-repeat";

  if(opts.animation) {
    nEl.style.webkitTransition =
      "-webkit-transform "+interval+"ms";
  }

  if(data.id === null) {
    // Don't do it again!
    nEl.style.webkitTransform = "translate("+data.x+"px, "+data.y+"px)";
  }

  if(data.id === null) {
    // TODO: This doesn't get cleared up
    proxy(nEl, el, {
      events: ["click"],
      prefix: "expander"
    });
  }

  if(data.id === null) {
    uid++;
    el.setAttribute("data-id", uid);
    nEl.setAttribute("data-id", uid);
    data.id = uid;
  }

  el.style.opacity = 0;
  store[data.id] = {
    master: el,
    child: nEl
  };

  document.body.appendChild(nEl);

  scalew = data.cw / data.w;
  scaleh = data.ch / data.h;
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
    tx = parseInt(data.cx, 10) + parseInt(data.cw, 10) - parseInt(data.w*scale, 10);
  } else if(posx === "center") {
    tx =  parseInt(data.cx, 10) + parseInt(data.cw, 10)/2 - parseInt(data.w*scale, 10)/2;
  } else {
    // LEFT
    tx = data.cx;
  }

  if(posy === "bottom") {
    ty = parseInt(data.cy, 10) + parseInt(data.ch, 10) - parseInt(data.h*scale, 10);
  } else if(posy === "center") {
    ty =  parseInt(data.cy, 10) + parseInt(data.ch, 10)/2 - parseInt(data.h*scale, 10)/2;
  } else {
    // TOP
    ty = data.cy;
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
  var args = Array.prototype.slice.call(arguments);
  var data = collapse.read.apply(this, args);
  args.unshift(data);
  collapse.write.apply(this, args);
}

collapse.read = function(el) {
  var id = el.getAttribute("data-id");
  var nEl = store[id].child;
  var el = store[id].master;

  var rect = el.getBoundingClientRect();

  var data = {
    nEl : nEl,
    el  : el,
    x   : rect.left + window.scrollX,
    y   : rect.top  + window.scrollY
  };

  return data;
}

collapse.write = function(data, el) {
  var interval = 500;
  var nEl = data.nEl;
  var el  = data.el;

  nEl.style.webkitTransform = "translate("+data.x+"px, "+data.y+"px) scale(1)";

  nEl.addEventListener("webkitTransitionEnd", function fn() {
    el.style.opacity = 1;
    nEl.parentNode.removeChild(nEl);
    el.removeAttribute("data-id");
    nEl.removeEventListener("webkitTransitionEnd", fn);
  });

  nEl.style.webkitTransition =
    "-webkit-transform    "+interval+"ms"
}

/**
 * Are we in an expanded state
 * @param {Element} el source element or dest element
 * @return {Boolean}
 */
function isExpanded(el) {
  var id = el.getAttribute("data-id");
  return (id !== null && store[id]);
}

module.exports = {
  expand:     expand,
  isExpanded: isExpanded,
  collapse:   collapse,
  toggle:     toggle
};
