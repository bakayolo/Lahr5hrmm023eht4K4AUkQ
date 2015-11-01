var fivebeans = require('fivebeans');
var assert = require('assert');

function Beanstalk(host, port) {
	console.log("Beanstalk : Initialization on " + host + ":" + port);
	this.beanstalkClient = new fivebeans.client(host, port);
}

Beanstalk.prototype.connect = function(callback) {
	this.beanstalkClient.on('connect', function() {
		console.log("Beanstalk : Successed connection");

		if (callback) {
			callback();
		}
	}).on('error', function(err) {
		console.log("Beanstalk : " + err);
	}).connect();
}

Beanstalk.prototype.getJobFromTube = function(tube, callback) {
	this.beanstalkClient.watch(tube, (function(err, numwatched) {
		assert.equal(null, err);
		console.log("Beanstalk : Watch the " + tube + " tube");

		this.beanstalkClient.reserve(function(err, jobid, payload) {
			if (jobid && payload) {
				console.log("Beanstalk : Get the job [" + jobid + " => " +  payload + "]");
			} else {
				console.log("Beanstalk : No job from the tube");
				jobid = null;
				payload = null;
			}

			if (callback) {
				callback(jobid, payload);
			}
		});
	}).bind(this));
}

Beanstalk.prototype.releaseJob = function(jobid, priority, delay, callback) {
	console.log("Beanstalk : Release the job " + jobid + " with priority " + priority + " and delay " + delay);
	this.beanstalkClient.release(jobid, priority, delay, function(err) {
		assert.equal(null, err);

		if (callback) {
			callback();
		}
	});
}

Beanstalk.prototype.buryJob = function(jobid, priority, callback) {
	console.log("Beanstalk : Bury the job " + jobid + " with priority " + priority);
	this.beanstalkClient.bury(jobid, priority, function(err) {
		assert.equal(null, err);

		if (callback) {
			callback();
		}
	});
}

Beanstalk.prototype.putJobToTube = function(tube, job, priority, delay, ttr, callback) {
	this.beanstalkClient.use(tube, (function(err, jobname) {
		assert.equal(null, err);
		console.log("Beanstalk : Use the " + tube + " tube");

		this.beanstalkClient.put(priority, delay, ttr, JSON.stringify(job), function(err, jobid) {
			assert.equal(null, err);
			console.log("Beanstalk : Job [" + jobid + " => " +  JSON.stringify(job) + "] pushed");

			if (callback) {
				callback(jobid);
			}
		});
    }).bind(this));
}

Beanstalk.prototype.destroyJob = function(jobid, callback) {
	this.beanstalkClient.destroy(jobid, function(err){
		assert.equal(null, err);
		console.log("Beanstalk : Job [" + jobid + "] destroyed");

		if (callback) {
			callback();
		}
	});
}

Beanstalk.prototype.pauseTube = function(tube, delay, callback) {
	this.beanstalkClient.pause_tube(tube, delay, function(err){
		assert.equal(null, err);
		console.log("Beanstalk : Tube [" + tube + "] waiting for " + delay);

		if (callback) {
			callback();
		}
	});
};

Beanstalk.prototype.end = function() {
	this.beanstalkClient.end();
	console.log("Beanstalk : Connection closed");
}

module.exports = Beanstalk;
