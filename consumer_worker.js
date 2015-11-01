var yaml = require('yamljs');
var http = require('http');
var Mongo = require('./mongo');
var Beanstalk = require('./beanstalk');
var Request = require('./request');
var XMLParser = require('./xml_parser');

var config = yaml.load('config.yml');

var beanstalkClient = new Beanstalk(config.beanstalk.host, config.beanstalk.port);
var mongoClient = new Mongo();
var requestClient = new Request('https://query.yahooapis.com/v1/public/');
var xmlParserClient = new XMLParser();

var collection = 'rates';


function processJob() {
	beanstalkClient.getJobFromTube(config.beanstalk.tube, function (jobid, payload) {
		if (jobid && payload) {
			payload = JSON.parse(JSON.parse(payload));
			requestClient.get('yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20%28%22' + payload.from + payload.to + '%22%29&env=store://datatables.org/alltableswithkeys', function(statusCode, body) {
				var doc = {
					from: payload.from,
					to: payload.to,
					jobid : jobid,
					created_at: new Date(),
				};
				if (statusCode == 200) {
					xmlParserClient.parse(body, function(result) {
						try {
							doc.rate = result.query.results[0].rate[0].Rate[0];
							doc.rate = (Math.round(doc.rate * 100) / 100).toString();
							doc.status = doc.rate?"success":"fail";
						} catch (exception) {
							doc.status = "fail";
						}
						processData(doc, doc.status, jobid, processJob);
					});
				} else {
					doc.status = "fail";
					processData(doc, doc.status, jobid, processJob);
				}
			});
		}
	});
}

function processData(doc, status, jobid, callback) {
	mongoClient.insertOne(collection, doc).then(function() {
		isJobFinished(jobid, function(isFinished) {
			if (isFinished) {
				beanstalkClient.destroyJob(jobid, callback);
			} else {
				beanstalkClient.releaseJob(jobid, 0, config.job[status].timeout, callback);
			}
		});
	}, function (err) {
		console.error(err.stack);
	});
}

function isJobFinished(jobid, callback) {
	mongoClient.count(collection, {jobid: jobid, status: "success"}).then(function(val) {
		if (val >= config.job.success.count) {
			callback(true);
		} else {
			mongoClient.count(collection, {jobid: jobid, status: "fail"}).then(function(val) {
				if (val >= config.job.fail.count) {
					callback(true);
				} else {
					callback(false);
				}
			}, function (err) {
				console.error(err.stack);
			});
		}
	}, function (err) {
		console.error(err.stack);
	});
}

beanstalkClient.connect(function() {
	mongoClient.connect(config.mongo.host).then(function() {
		processJob();
	}, function (err) {
		console.error(err.stack);
	});
});
