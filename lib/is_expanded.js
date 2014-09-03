var store = require("./store");

/**
 * Are we in an expanded state
 * @param {Element} el source element or dest element
 * @return {Boolean}
 */
function isExpanded(el) {
  var id = el.getAttribute("data-id");
  return (id !== null && store[id]);
}

module.exports = isExpanded;
