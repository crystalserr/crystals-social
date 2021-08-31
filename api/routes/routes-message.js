'use strict'

var express = require('express');
var MessageController = require('../controllers/controller-message');

var api = express.Router();

// Middlewares
var md_auth = require('../middlewares/authenticated');

// Creamos las rutas para el like-controller
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages); // mensajes recibidos
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmittedMessages); // mensajes enviados por nosotros
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages); // mensajes sin leer
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages); // mensajes sin leer


module.exports = api;