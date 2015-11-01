var yaml = require('yamljs');
var assert = require('assert');
var http = require('http');
var Mongo = require('./mongo');
var Beanstalk = require('./beanstalk');
var Request = require('./request');
var XMLParser = require('./xml_parser');

var config = yaml.load('config.yml');

var beanstalkClient = new Beanstalk(config.beanstalk.host, config.beanstalk.port);
var mongoClient = new Mongo();