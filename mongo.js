var mongodb = require('mongodb');
var co = require('co');

function Mongo() {
}

Mongo.prototype.connect = co.wrap(function* (host) {
	console.log('MongoDB : Connection to ' + host);
	this.db = yield mongodb.MongoClient.connect(host);
});

Mongo.prototype.createIndex = co.wrap(function* (collectionName, index, options) {
	var collection = this.db.collection(collectionName);
	yield collection.createIndex(index, options);
	console.log('MongoDB : Index created on ' + JSON.stringify(index) + ' with ' + JSON.stringify(options));
});

Mongo.prototype.count = co.wrap(function* (collectionName, query) {
	var collection = this.db.collection(collectionName);
	var count = null;
	if (query) {
		count = yield collection.count(query);
	} else {
		count = yield collection.count();
	}
	console.log('MongoDB : ' + count + ' document(s) in ' + collectionName + ' for query ' + query);
	return count;
});

Mongo.prototype.insertOne = co.wrap(function* (collectionName, doc) {
	var collection = this.db.collection(collectionName);
	yield collection.insertOne(doc);
	console.log('MongoDB : Insert ' + JSON.stringify(doc) + ' in ' + collectionName);
});

Mongo.prototype.removeAll = co.wrap(function* (collectionName) {
	var collection = this.db.collection(collectionName);
	yield collection.removeMany();
	console.log('MongoDB : Remove all documents from ' + collectionName);
});

Mongo.prototype.drop = co.wrap(function* (collectionName) {
	var collection = this.db.collection(collectionName);
	yield collection.drop();
	console.log('MongoDB : Collection ' + collectionName + ' dropped');
});

Mongo.prototype.close = function() {
	this.db.close();
	console.log('MongoDB : Connection close');
}

module.exports = Mongo;