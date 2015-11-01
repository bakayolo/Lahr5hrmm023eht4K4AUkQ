var yaml = require('yamljs');
var Beanstalk = require('./utils/beanstalk');

var config = yaml.load('config.yml');

if (process.argv.length != 4) {
	console.log("Usage : ");
	console.log("node ../producer_worker.js [from] [to]");
	console.log("[from] => from currency. Example : HKD")
	console.log("[to]   => to currency. Example : USD");
	process.exit(1);
}

var beanstalkClient = new Beanstalk(config.beanstalk.host, config.beanstalk.port);

var job = {
	from: process.argv[2],
	to: process.argv[3]
};

beanstalkClient.connect(function() {
	beanstalkClient.putJobToTube(config.beanstalk.tube, JSON.stringify(job), 0, 0, 0, function() {
		beanstalkClient.end();
	});
});