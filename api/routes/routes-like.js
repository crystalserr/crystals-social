'use strict'

var express = require('express');
var LikeController = require('../controllers/controller-like');

var api = express.Router();

// Middlewares
var md_auth = require('../middlewares/authenticated');

api.post('/like', md_auth.ensureAuth, LikeController.saveLike);
api.delete('/like/:id', md_auth.ensureAuth, LikeController.deleteLike);

module.exports = api;