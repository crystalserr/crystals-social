'use strict'

var express = require('express');
var PublicationController = require('../controllers/controller-publication');

var api = express.Router();

// Middlewares
var md_auth = require('../middlewares/authenticated');
var multiparty = require('connect-multiparty');
var md_upload = multiparty({ uploadDir: './uploads/publications' }); // directorio de subida de archivos


// cuando vamos a dar de alta algo (guardar datos) siempre utilizamos el metodo post
api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publications-user/:user/:page?', md_auth.ensureAuth, PublicationController.getUserPublications);
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/upload-image-publi/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
api.get('/get-image-publi/:imageFile', PublicationController.getImageFile);

module.exports = api;