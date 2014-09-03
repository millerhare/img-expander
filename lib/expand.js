var prefixedEvent   = require('prefixed-event');
var debounce        = require("lodash.debounce");
var domBatchWrapper = require("dom-batch-wrapper");
var stylePrefixer   = require("style-prefixer");

var store = require("./store");

/**
 * Expand an image element to a container
 * @param {Element} el the image element
 * @param {Element} targetEl the target to expand to
 * @param {Object} opts
 */
var expand = domBatchWrapper();


// Intended for use by fastdom (see <https://github.com/wilsonpage/fastdom>)
expand.read = function(el, targetEl, opts) {
  var id         = el.getAttribute("data-img-expander-id");
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
  var pos = opts.pos || ["center", "center"];
  if(pos.length < 2) {
    pos[1] = pos[0];
  }

  if(opts.animation === undefined) {
    opts.animation = true;
  }

  var childEl;
  if(data.id === null) {
    childEl = document.createElement("div");
  } else {
    childEl = store[data.id].child;
  }

  var interval = 500;

  childEl.style.position       = "absolute";
  childEl.style.top            = "0px";
  childEl.style.left           = "0px";
  childEl.style.width          = data.w+"px";
  childEl.style.height         = data.h+"px";
  childEl.style.background     = "url("+data.src+")";
  childEl.style.backgroundSize = "contain";
  childEl.style.backgroundPosition = "top left";
  childEl.style.backgroundRepeat = "no-repeat";
  childEl.style[stylePrefixer("transform-origin")] = "top left";

  if(opts.animation) {
    childEl.style.webkitTransition =
      stylePrefixer("transform")+" "+interval+"ms";
  }

  if(data.id === null) {
    // Don't do it again!
    childEl.style[stylePrefixer("transform")] = "translate("+data.x+"px, "+data.y+"px)";
  }

  if(data.id === null) {
    // Kinda a hack!
    childEl.addEventListener("click", function(e) {
      var event = new CustomEvent('img-expander:click', {
        'detail': e
      });
      el.dispatchEvent(event);
    }, false);
  }

  if(data.id === null) {
    var uid = store.uid++;
    el.setAttribute("data-img-expander-id", uid);
    childEl.setAttribute("data-img-expander-id", uid);
    data.id = uid;
  }

  el.style.opacity = 0;
  store[data.id] = {
    master: el,
    child: childEl
  };
  document.body.appendChild(childEl);

  scalew = data.cw / data.w;
  scaleh = data.ch / data.h;
  if(scaleh < scalew) {
    scale = scaleh;
  } else {
    scale = scalew;
  }

  var tx, ty;

  var posx = pos[0];
  var posy = pos[1];

  if(posx === "right") {
    tx = data.cx + data.cw - (data.w*scale);
  } else if(posx === "center") {
    tx =  data.cx + (data.cw/2) - (data.w*scale/2);
  } else {
    // LEFT
    tx = data.cx;
  }

  if(posy === "bottom") {
    ty = data.cy + data.ch - (data.h*scale);
  } else if(posy === "center") {
    ty =  data.cy + (data.ch/2) - (data.h*scale/2);
  } else {
    // TOP
    ty = data.cy;
  }

  setTimeout(function() {
    childEl.style[stylePrefixer("transform")] = "translate("+tx+"px, "+ty+"px) scale("+scale+")";
  }, 0);

  function resize() {
    opts.animation = false;
    expand(el, targetEl, opts);
    childEl.style.opacity = 1;
  }

  resize = debounce(resize, 100, {
    trailing: true
  });

  window.addEventListener("resize", function(e) {
    childEl.style.opacity = 0;
    resize();
  }, false);

  if(opts.animation) {
    prefixedEvent.add(el, 'TransitionEnd', function fn() {
      childEl.style.webkitTransition = "";
      prefixedEvent.remove("TransitionEnd", fn);
    });
  }

  return childEl;
}

module.exports = expand;
