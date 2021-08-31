'use strict'

var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Like = require('../models/like');

// Guardar un like — me gusta a una publicacion
function saveLike(req, res) {

    console.log("saving likeeee");
    var params = req.body; // peticion por post

    var like = new Like();
    like.user = req.user.sub; // usuario loggeado
    like.publication = params.publication; // id de la publicacion que le gusta

    console.log(like.publication);

    if (like.publication != undefined) {
        // Control de likes duplicados
        Like.findOne({ user: like.user, publication: like.publication }).exec((err, likes) => {
            if (err) return res.status(500).send({ message: 'Error en la petición — saveLike' });
            if (likes) {
                return res.status(200).send({ message: 'Ya te gusta esta publicación' });
            } else {
                like.save((err, likeStored) => {             
                    if (err) return res.status(500).send({ message: 'Error al guardar el like — saveLike' });

                    if (!likeStored) return res.status(404).send({ message: 'El like no se ha guardado — saveLike' });

                    return res.status(200).send({ like: likeStored });
                });
            }
        });
    } else {
        return res.status(404).send({ message: 'No has indicado la publicación que te gusta — saveLike' });
    }
    
}

// Eliminar un like — deja de gustarte la publicacion
function deleteLike(req, res) {

    var userId = req.user.sub; // usuario loggeado

    var publicationId = req.params.id; // publicacion que le deja de gustar, lo vamos a pasar por la url — peticion delete

    Like.find({ 'user': userId, 'publication': publicationId }).deleteOne((err) => {
        if (err) return res.status(500).send({ message: 'Error al dejar de gustar la publicacion — DeleteLike' });

        return res.status(200).send({ message: 'Ya no te gusta esa publicación' });
    });
}


module.exports = {
    saveLike,
    deleteLike,
}