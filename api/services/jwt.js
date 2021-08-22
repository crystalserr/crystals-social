'use strict'

const e = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');

var secret = 'clave_secreta_crystals';

// Recibe como parametro el usuario del que quiero generar el token
exports.createToken = function(user) {
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), // fecha de creación del token
        exp: moment().add(30, 'days').unix() // fecha de expiración
    };

    return jwt.encode(payload, secret);
}