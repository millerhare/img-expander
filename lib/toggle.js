var expand          = require("./expand");
var collapse        = require("./collapse");
var domBatchWrapper = require("dom-batch-wrapper");

var toggle = domBatchWrapper();

toggle.read = function(el, targetEl) {
  var data, uid = el.getAttribute("data-id");
  if(uid) {
    data = collapse.read(el);
  } else {
    data = expand.read(el, targetEl);
  }
  data.uid = uid;
  return data;
}

toggle.write = function(data, el, targetEl) {
  if(data.uid) {
    collapse.write(data, el);
  } else {
    expand.write(data, el, targetEl);
  }
}

module.exports = toggle;
