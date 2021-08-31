'use strict'

var express = require('express');
var UserController = require('../controllers/controller-user');

var api = express.Router();

// Middlewares
var md_auth = require('../middlewares/authenticated');
var multiparty = require('connect-multiparty');
var md_upload = multiparty({ uploadDir: './uploads/users' }); // directorio de subida de archivos

// Creamos las rutas para el user-controller
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/user-nick/:nick', md_auth.ensureAuth, UserController.getUserNick);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
api.get('/all-users', md_auth.ensureAuth, UserController.getAllUsers);
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

// Recuperar contraseña
api.put('/forgot-password', UserController.forgotPassword);
api.put('/new-password', md_auth.ensureAuth, UserController.newPassword);
api.put('/change-password/:id', md_auth.ensureAuth, UserController.changePassword);

module.exports = api;
