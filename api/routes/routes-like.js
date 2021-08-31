'use strict'

var express = require('express');
var LikeController = require('../controllers/controller-like');

var api = express.Router();

// Middlewares
var md_auth = require('../middlewares/authenticated');

// Creamos las rutas para el like-controller
api.post('/like', md_auth.ensureAuth, LikeController.saveLike);
api.delete('/like/:id', md_auth.ensureAuth, LikeController.deleteLike);

module.exports = api;