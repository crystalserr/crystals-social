'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

// Guardar mensaje - enviar mensaje
function saveMessage(req, res) {
    var params = req.body; // peticion por post
    if (!params.text || !params.receiver) {
        return res.status(200).send({ message: 'Envia los datos necesarios' });
    }

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — SaveMessage' });
        if (!messageStored) return res.status(500).send({ message: 'Error al enviar el mensaje — SaveMessage' });

        return res.status(200).send({ message: messageStored });
    });
}

// Listar mensajes recibidos
function getReceivedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 4;

    // para listar los mensajes que nosotros recibimos
    // el segundo parametro de populate indica los datos que se van a devolver
    Message.find({ receiver: userId }).populate('emitter receiver', ' _id name surname nick image').sort('-created_at').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — GetReceivedMessages' });
        if (!messages) return res.status(404).send({ message: 'No hay mensajes — GetReceivedMessages' });
        
        return res.status(200).send({ 
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

// Listado de mensajes enviados
function getEmittedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 4;

    // para listar los mensajes que nosotros emitimos
    // el segundo parametro de populate indica los datos que se van a devolver
    Message.find({ emitter: userId }).populate('emitter receiver', ' _id name surname nick image').sort('-created_at').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — GetEmittedMessages' });
        if (!messages) return res.status(404).send({ message: 'No hay mensajes — GetEmittedMessages' });
        
        return res.status(200).send({ 
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

// Obtiene el numero de mensajes sin leer
function getUnviewedMessages(req, res) {
    var userId = req.user.sub;

    Message.countDocuments({ receiver: userId, viewed: 'false' }).exec((err, count) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — GetUnviewedMessages' });
        
        return res.status(200).send({
            'unviewed': count
        });
    });
}

// Marcar todos los mensajes como leídos (para eso es la opcion multi)
// NOTA - hacer un metodo similar a este que solo actualice un mensaje (??)
function setViewedMessages(req, res) {
    var userId = req.user.sub;

    // investigar mas acerca de la opcion de multi
    Message.updateMany({ receiver: userId, viewed: 'false'}, { viewed: 'true' }, {"multi": true}, (err, messagesUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — SetViewedMessages' });
        //if (!messageUpdated) return res.status(404).send()
        return res.status(200).send({
            messages: messagesUpdated
        })
    });
}

module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmittedMessages,
    getUnviewedMessages,
    setViewedMessages
}