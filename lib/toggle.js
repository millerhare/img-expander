var expand   = require("./expand");
var collapse = require("./collapse");
var domBatchWrapper = require("dom-batch-wrapper");

var toggle = domBatchWrapper();

toggle.read = function() {
  var data, uid = el.getAttribute("data-id");
  if(uid) {
    data = collapse.read(el);
  } else {
    data = expand.read(el, cEl);
  }
  data.uid = uid;
  return data;
}

toggle.write = function(data) {
  if(data.uid) {
    collapse.write(data, el);
  } else {
    expand.write(data, el, cEl);
  }
}

module.exports = toggle;
