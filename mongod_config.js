var mongo = require('./node_modules/mongoskin');

exports.db = mongo.db('mongodb://localhost/beep_log');