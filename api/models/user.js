'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema de User - Usuario
var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
});

module.exports = mongoose.model('User', UserSchema);