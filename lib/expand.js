var prefixedEvent = require('prefixed-event');
var debounce      = require("lodash.debounce");
var store         = require("./store");
var domBatchWrapper = require("dom-batch-wrapper");

/**
 * Expand an image element to a container
 * @param {Element} el the image element
 * @param {Element} targetEl the target to expand to
 * @param {Object} opts
 */
var expand = domBatchWrapper();


// Intended for use by fastdom (see <https://github.com/wilsonpage/fastdom>)
expand.read = function(el, targetEl, opts) {
  var id         = el.getAttribute("data-id");
  var sourceRect = el.getBoundingClientRect();
  var destRect   = targetEl.getBoundingClientRect();
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
    cw:  targetEl.offsetWidth,
    ch:  targetEl.offsetHeight
  };
}


// Intended for use by fastdom (see <https://github.com/wilsonpage/fastdom>)
expand.write = function(data, el, targetEl, opts) {
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
    // Kinda a hack!
    nEl.addEventListener("click", function(e) {
      el.dispatchEvent("img-expander:click", {
        detail: e
      });
    }, false);
  }

  if(data.id === null) {
    var uid = store.uid++;
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
    expand(el, targetEl, opts);
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
    prefixedEvent.add(el, 'TransitionEnd', function fn() {
      nEl.style.webkitTransition = "";
      prefixedEvent.remove("TransitionEnd", fn);
    });
  }

  return nEl;
}

module.exports = expand;
