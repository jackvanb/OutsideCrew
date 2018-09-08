var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = mongoose.Schema({
    username: {type: String, sparse: true},
    password: String,
    groupQ: {type: String, sparse: true},
    artists: {type: [String], sparse: true},
    schedule: {type: [String], sparse: true}
    
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);