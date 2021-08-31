'use strict'

// Configuración de express js

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar rutas
var user_routes = require('./routes/routes-user');
var follow_routes = require('./routes/routes-follow');
var publication_routes = require('./routes/routes-publication');
var message_routes = require('./routes/routes-message');
var like_routes = require('./routes/routes-like');

// middlewares — middleware es un método que se ejecuta antes de que llegue a un controlador
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // cada vez que reciba datos de una petición me lo va a convertir en un objeto JSON

// cabeceras y acceso cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

// rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);
app.use('/api', like_routes);

// exportar la configuración
module.exports = app;
