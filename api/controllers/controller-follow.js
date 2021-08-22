'use strict'

var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');


// Guardar un follow — seguir a un usuario
function saveFollow(req, res) {
    var params = req.body; // peticion por post

    var follow = new Follow();
    follow.user = req.user.sub; // usuario loggeado
    follow.followed = params.followed; // usuario al que empieza a seguir

    // Me deja guardar follows aunque no les pase el followed por parámetros — intentar arreglarlo despues
    // También me deja guardar duplicados - arreglar

    if (follow.followed != undefined) {
        // Control de follows duplicados
        Follow.findOne({ user: follow.user, followed: follow.followed }).exec((err, follows) => {
            if (err) return res.status(500).send({ message: 'Error en la petición — saveFollow' });
            if (follows) {
                return res.status(200).send({ message: 'Ya estás siguiendo a ese usuario' });
            } else {
              if (follow.user.toString() != follow.followed.toString()) {
                    follow.save((err, followStored) => {             
                        if (err) return res.status(500).send({ message: 'Error al guardar el follow — SaveFollow' });

                        if (!followStored) return res.status(404).send({ message: 'El follow no se ha guardado — SaveFollow' });

                        return res.status(200).send({ follow: followStored });
                    });
                } else if (follow.user.toString() == follow.followed.toString()) {
                    return res.status(404).send({ message: 'No puedes seguirte a ti mismo — SaveFollow' });
                }
            }
        });
    } else {
        return res.status(404).send({ message: 'No has indicado el usuario a seguir — SaveFollow' });
    }
    
}

// Eliminar un follow — dejar de seguir a un usuario
function deleteFollow(req, res) {

    var userId = req.user.sub; // usuario loggeado
    // intentar en un futuro pasar el nombre de usuario por la url, y obtener el id de ese usuario
    // para guardarlo en followId, y así no estar mostrando el id en la barra de búsqueda

    var followId = req.params.id; // usuario al que deja de seguir // lo vamos a pasar por la url — peticion delete

    Follow.find({ 'user': userId, 'followed': followId }).deleteOne((err) => {
        if (err) return res.status(500).send({ message: 'Error al dejar de seguir — DeleteFollow' });

        return res.status(200).send({ message: 'El follow se ha eliminado' });
    });
}

// Listar usuarios a los que seguimos — Following | Seguidos
function getFollowingUsers(req, res) {
    var userId = req.user.sub; // si solo le pasamos el id por paramétros y no la página
    // coge el usuario del token de auntenticación

    // como en los métodos anteriores, intentar pasar el nick en vez del id del usuario

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id; // ya que el primer parámetro, que se supone que es el id, en este caso será la página, pues solo pasamos un parámetro
    }

    var itemsPerPage = 4; // usuarios por página

    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor — GetFollowingUsers' });

        if (!follows || follows == 0) return res.status(200).send({ message: 'No sigues a ningún usuario' });


        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPerPage),
                follows: follows,
                users_following: value.following, // usuarios que esta siguiendo el usuario loggeado
                users_follow_me: value.followed // usuarios que siguen al usuario loggeado
            });
        });

        
    });
}

// Listar usuarios que nos siguen — Followers | Seguidores
function getFollowedUsers(req, res) {
    var userId = req.user.sub // id del usuario identificado

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id; // ya que el primer parámetro, que se supone que es el id, en este caso será la página, pues solo pasamos un parámetro
    }

    var itemsPerPage = 4; // 4 usuarios por página

    Follow.find({ followed: userId }).populate( 'user followed' ).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor — GetFollowedUsers' });

        if (!follows || follows == 0) return res.status(404).send({ message: 'No te sigue ningún usuario' });


        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPerPage),
                follows: follows,
                users_following: value.following, // usuarios que esta siguiendo el usuario loggeado
                users_follow_me: value.followed // usuarios que siguen al usuario loggeado
            });
        });
    });
}

// función asincrona que devuelve los ids de los usuarios que seguimos y que nos siguen
// following — que seguimos
// followed — que nos siguen
async function followUserIds(user_id) {

    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec().then((follows) => {
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        return follows_clean;    
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec().then((follows) => {
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });

        return follows_clean;    
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following, // que seguimos
        followed: followed // que nos siguen
    }
}

// Listados sin paginar

// Devolver usuarios que sigo o me siguen
function getMyFollows(req, res) {
    var userId = req.user.sub;

    var find = Follow.find({ user: userId }); // los usuarios que sigo

    // mejorar lo de que el parametro followed de la url sea un booleano
    if (req.params.followed) {
        find = Follow.find({ followed: userId }); // los usuarios que me estan siguiendo — http://localhost:3800/api/get-my-follows/true
    }

    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor — GetMyFollows' });

        if (!follows || follows == 0) return res.status(404).send({ message: 'No sigues / te sigue ningún usuario — GetMyFollows' });

        return res.status(200).send({ follows });
    });
}

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}