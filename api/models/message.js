'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema de Message - Mensaje
var MessageSchema = Schema({
    text: String,
    viewed: String, // podría ser boolean con true o false
    created_at:  String,
    emitter: { type: Schema.ObjectId, ref: 'User' },
    receiver: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Message', MessageSchema);