'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secret = 'clave_secreta_crystals';

exports.ensureAuth = function(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no tiene la cabecera de autenticación' });
    } 

    var token = req.headers.authorization.replace(/['"]+/g, ''); // remplazamos cualquier comilla doble o simple por nada — eliminamos las comillas

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment.unix()) {
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
    } catch (e) {
        return res.status(404).send({
            message: 'El token no es válido'
        });
    }

    req.user = payload;

    next();
    
}