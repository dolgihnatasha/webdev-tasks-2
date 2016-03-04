var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var Connection = function (url) {
    this.url = url;
    this.operations = {};
    this.isNot = false;
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
    if (!this.isNot) {
        this.operations[this.field] = value;
    } else {
        this.operations[this.field] = {$ne: value};
        this.isNot = false;
    }
    return this;
};

Connection.prototype.lessThan = function (value) {
    if (!this.isNot) {
        this.operations[this.field] = {$lt: value};
    } else {
        this.operations[this.field] = {$gte: value};
        this.isNot = false;
    }
    return this;
};

Connection.prototype.greatThan = function (value) {
    if (!this.isNot) {
        this.operations[this.field] = {$gt: value};
    } else {
        this.operations[this.field] = {$lte: value};
        this.isNot = false;
    }
    return this;
};

Connection.prototype.include = function (values) {
    if (!this.isNot) {
        this.operations[this.field] = values;
    } else {
        this.operations[this.field] = {$ne:values};
        this.isNot = false;
    }
    return this;
};

Connection.prototype.set = function (val) {
    this.setValue = val;
    return this;
};

Connection.prototype.not = function () {
    this.isNot = true;
    return this;
};

Connection.prototype.find = function (callback) {
    dbRequest('find', this, callback);
};

Connection.prototype.remove = function (callback) {
    dbRequest('remove', this, callback);
};

Connection.prototype.update = function (callback) {
    dbRequest('update', this, callback);
};

Connection.prototype.insert = function (obj, callback) {
    this.insertObj = obj;
    dbRequest('update', this, callback);
};

function dbRequest(func, connectionInfo, callback) {
    MongoClient.connect(connectionInfo.url, function (err, db) {
        if (err) {
            console.log(err)
        } else {
            var table = db.collection(connectionInfo.table);
            var result;
            switch (func) {
                case('update'): {
                    result = table.func(connectionInfo.operations, connectionInfo.setValue).toArray();
                    break;
                }
                case('remove'): {
                    result = table.deleteMany(connectionInfo.operations).toArray();
                    break;
                }
                case('find'):{
                    result = table.find(connectionInfo.operations).toArray();
                    break;
                }
                case('insert'):{
                    result = table.insertOne(connectionInfo.insertObj).toArray();
                    break
                }
                default:{
                    callback('err')
                }
            }
            result.then(()=>{db.close();});
            callback(null, result);
        }
    });
}
