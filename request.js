var request = require('request');
var assert = require('assert');

function Request(url) {
	this.url = url;
}

Request.prototype.get = function(path, callback) {
	console.log("Request : Getting the url " + this.url + path);
	request(this.url + path, function (error, response, body) {
		assert.equal(null, error);

		if (callback) {
			callback(response.statusCode, body);
		}
	});
}

module.exports = Request;