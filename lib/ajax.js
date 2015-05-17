"use strict";
(function(exports) {
	var ajaxJSON = function(url, _options) {
		var options = {
			data : {},
			cache : true,
			method : "GET",
			output : 'json',
			payload : null,
			headers : {}
		};
		for ( var k in _options) {
			options[k] = _options[k];
		}
		if (options.cache == false) {
			options.data['_'] = (new Date()).getTime();
		}
		for (k in options.data) {
			url += (url.indexOf("?") == -1) ? "?" : "&";
			url += encodeURIComponent(k);
			url += "=";
			url += encodeURIComponent(options.data[k]);
		}
		var req = new XMLHttpRequest();
		try {
			req.open(options.method, url, true);
			// req.responseType = "json";
			req.onreadystatechange = function(aEvt) {
				if (req.readyState == 4) {
					if (req.status == 200) {
						if (typeof options.success == 'function') {
							var response = req.response;
							if(options.output == 'json'){
								try{
									response = JSON.parse(response);
								} catch(e){}
							}
							options.success(response, req.statusText, req);
						}
					} else {
						if (typeof options.error == 'function') {
							options.error(req.statusText, req, null);
						}
					}
					if (typeof options.complete == 'function') {
						options.complete(req, req.statusText);
					}
				}
			};
			for ( var k in options.headers) {
				req.setRequestHeader(k, options.headers[k]);
			}
			req.send(options.payload);	
		} catch (e) {
			if (typeof options.error == 'function') {
				options.error(req.statusText, req, e);
			}
			// console.error(e);
		}
	};

	exports.getJSON = function(url, _options) {
		ajaxJSON(url, _options);
	};
	exports.postJSON = function(url, postData, _options) {
		if(_options == null){
			_options = {}
		}
		_options.payload = JSON.stringify(postData);
		_options.headers = {
			'Content-Type' : 'application/json; charset=UTF-8'
		};
		_options.method = 'POST';
		ajaxJSON(url, _options);
	};

})(this);