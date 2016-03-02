var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var Connection = function (url) {
    this.url = url;
    this.operations = {};
};

module.exports.server = function (url) {
    return new Connection(url);
};

Connection.prototype.collection = function (collectionName) {
    this.table = collectionName;
    return this;
};

Connection.prototype.where = function (searchField) {
    this.field = searchField;
    return this;
};

Connection.prototype.equal = function (value) {
    if (!this.not) {
        this.operations[this.field] = value;
    } else {
        this.operations[this.field] = {$ne: value};
        this.not = false;
    }
    return this;
};

Connection.prototype.lessThan = function (value) {
    if (!this.not) {
        this.operations[this.field] = {$lt: value};
    } else {
        this.operations[this.field] = {$gte: value};
        this.not = false;
    }
    return this;
};

Connection.prototype.greatThan = function (value) {
    if (!this.not) {
        this.operations[this.field] = {$gt: value};
    } else {
        this.operations[this.field] = {$lte: value};
        this.not = false;
    }
    return this;
};

Connection.prototype.include = function (values) {
    if (!this.not) {
        this.operations[this.field] = values;
    } else {
        this.operations[this.field] = {$ne:values};
        this.not = false;
    }
    return this;
};

Connection.prototype.not = function () {
    this.not = true;
    return this;
};

Connection.prototype.find = function (callback) {
    var this_ = this;
    MongoClient.connect(this.url, function (err, db) {
        if (err) {
            callback(err);
        } else {
            var table = db.collection(this_.table);
            var result = table.find(this_.operations);
            db.close();
            callback(null, result);
        }
    });
};
