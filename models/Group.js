var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var groupSchema = mongoose.Schema({
    users: [{username: {type: String, sparse: true}, identification: String, list: {type: [String], sparse: true}}],
    schedule: {type: [String], sparse: true},
    name: String,
    pass: String,
    creator: String
});

groupSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Group", groupSchema);