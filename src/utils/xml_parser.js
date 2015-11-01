var request = require('request');
var assert = require('assert');
var parser = require('xml2js').parseString;

function XMLParser() {
}

XMLParser.prototype.parse = function(xml, callback) {
	console.log("XMLParser : Parse XML");
	parser(xml, function (err, result) {
		assert.equal(null, err);

		if (callback) {
			callback(result);
		}
	});
}

module.exports = XMLParser;