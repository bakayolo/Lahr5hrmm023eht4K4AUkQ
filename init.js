var yaml = require('yamljs');
var Mongo = require('./mongo');

var config = yaml.load('config.yml');

var mongoClient = new Mongo();

var collection = 'rates';

mongoClient.connect(config.mongo.host).then(function() {
	mongoClient.drop(collection).then(function() {
		mongoClient.createIndex(collection, {jobid: 1, status: 1}, {}).then(function() {
			mongoClient.close();
			console.log("Initialization done");
		}, function (err) {
			console.error(err.stack);
		});
	}, function (err) {
		console.error(err.stack);
	});
}, function (err) {
	console.error(err.stack);
});