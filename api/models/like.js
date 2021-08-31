'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema de Like - Me gusta
var LikeSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' }, // usuario que da me gusta
    publication: { type: Schema.ObjectId, ref: 'Publication' } // publicación que le gusta
});

module.exports = mongoose.model('Like', LikeSchema);