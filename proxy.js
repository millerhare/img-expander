module.exports = function(aEl, bEl, opts) {
	opts.events.forEach(function(event) {
		aEl.addEventListener(event, function(e) {
			var ne = new CustomEvent(opts.prefix+'-proxy:'+event, {
				'detail': e
			});
			bEl.dispatchEvent(ne);
		})
	});
}
