'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');
var Like = require('../models/like');

// Guarda una publicacion
function savePublication(req, res) {
    var params = req.body; // peticion por post

    if (!params.text || params.text == "") return res.status(200).send({ message: 'Debes enviar un texto' });

    var publication = new Publication();
    publication.text = params.text; // lo minimo para crear una publicacion es que tenga texto
    publication.file = 'null'; // en principio no tiene que ser oblicatiorio que se suba una publicacion cuando se crea el post
    publication.user = req.user.sub; //id del usuario identificado que esta creando la publicacion
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar la publicacion — SavePublication'});

        if (!publicationStored) return res.status(404).send({ message: 'La publicacion no ha sido guardada — SavePublication'});

        return res.status(200).send({ publication: publicationStored });
    });
}

// Devuelve todas las publicaciones de los usuarios que estoy siguiendo — timeline
function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page; // peticion por get
    }

    var itemsPerPage = 5;

    // Buscamos en los follows donde nosotros somos el usuario que sigue
    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error al obtener el seguimiento — GetPublications'});
        
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed); // aqui estan los objetos usuario que seguimos
        });

        follows_clean.push(req.user.sub); // nos añadimos a nosotros mismos
        // para poder ver también nuestras publicaciones

        // va a buscar todas las publicaciones cuyo usuario esté contenido en follows_clean
        // las devuelve ordenadas de mas reciente a menos, y popula para obtener todos los datos del usuario
        Publication.find({ user: { $in: follows_clean }}).sort('-created_at').populate('user')
        .paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500).send({ message: 'Error al obtener las publicaciones — GetPublications'});
            
            if (!publications) return res.status(404).send({ message: 'No hay publicaciones — GetPublications'});
            
            getUserLikesPublications(req.user.sub).then((value) => {
                return res.status(200).send({
                    total_items: total, // cantidad total de publicaciones
                    pages: Math.ceil (total/itemsPerPage), // numero de páginas
                    itemsPerPage: itemsPerPage,
                    page: page, // pagina actual
                    publications, // las publicaciones
                    liking: value.liking
                });
            });
        }); 
    });
}


// Devuelve todas las publicaciones de un usuario — timeline
function getUserPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page; // peticion por get
    }

    var user_id = req.user.sub; // por defecto es el usuario loggeado
    if (req.params.user) {
        user_id = req.params.user; // el nombre que le puse en la ruta al parametro
    }

    var itemsPerPage = 5;

    Publication.find({ user: user_id}).sort('-created_at').populate('user')
        .paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500).send({ message: 'Error al obtener las publicaciones — GetUserPublications'});
            
            if (!publications) return res.status(404).send({ message: 'No hay publicaciones — GetUserPublications'});
            
            getUserLikesPublications(user_id).then((value) => {
                return res.status(200).send({
                    total_items: total, // cantidad total de publicaciones
                    pages: Math.ceil (total/itemsPerPage), // numero de páginas
                    itemsPerPage: itemsPerPage,
                    page: page, // pagina actual
                    publications, // las publicaciones
                    liking: value.liking
                });
            });

        }); 
}

// obtiene los likes que hizo el usuario loggeado
async function getUserLikesPublications(user_id) {

    var liking = await Like.find({"user": user_id}).exec().then((likes) => {

        var likes_clean = [];

        likes.forEach((like) => {
            likes_clean.push(like.publication); // id de la publicacion;
        });

        return likes_clean;

    }).catch((err) => {
        return handleError(err);
    });

    return {
        liking: liking // ids de las publicaciones que le gustan al usuario loggeado
    }

}

// Obtener una publicacion a través de su id
function getPublication(req, res) {
    // peticion por get
    var publicationId = req.params.id; // id de la publicacion que queremos obtener

    Publication.findById(publicationId, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error al obtener la publicacion — GetPublication'});
        if (!publication) return res.status(404).send({ message: 'No existe la publicacion — GetPublication'});
        
        return res.status(200).send({ publication });
    });
}

// Eliminar una publicacion
function deletePublication(req, res) {
    var publicationId = req.params.id; // peticion por delete

    // antes de eliminar la publicación deberíamos eliminar la foto asociada a esa publicación

    // primero tengo que eliminar los likes asociados a esa publicación antes de eliminar la publicación

    Like.find({ publication: publicationId }).deleteMany(err => {
        if (err) {
            return res.status(500).send({ message: 'Error al eliminar la publicacion — GetPublication'});
        } else {
            // si se borraron correctamente los likes de la publicación
            // bottamos la publicación

            Publication.find({ user: req.user.sub, '_id': publicationId }).deleteOne(err => {
                if (err) return res.status(500).send({ message: 'Error al eliminar la publicacion — GetPublication'});
                //if (!publicationRemoved) return res.status(404).send({ message: 'No existe la publicacion | No se ha borrado la publicacion — GetPublication'});
                
                return res.status(200).send(
                    { message: 'Publicación eliminada correctamente',
                    status: 200
                    }
                );
            });
        }
    });    
}

// Subir imagenes a la publicación
function uploadImage(req, res) {
    var publicationId = req.params.id; 

    if (req.files) {
        // Si estamos enviando algún fichero
        var file_path = req.files.image.path;
        
        var file_name = file_path.split('\\')[2];
        var file_ext = file_name.split('\.')[1];

        console.log('file name: ' + file_name + ' | file ext: ' + file_ext);

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // solo podemos actualizarla si somos los creadores de esa publicacion
            Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                if (publication) {
                    // Actualizar imagen de la publicacion
                    Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (err, publicationUpdated) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion — updateUser' });

                        if (!publicationUpdated) return res.status(404).send({ message: 'No se ha podido actualizar la imagen de la publicación' }); 

                        return res.status(200).send({ publication: publicationUpdated });
                    });
                } else {
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar esta publicación');
                }
            });
        } else {
            //console.log("Extensión no válida")
            return removeFilesOfUploads(res, file_path, 'Extensión no válida'); // Eliminamos el fichero
        }
    } else {
        return res.status(200).send({ message: 'No se ha subido una imagen' });
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        //console.log(message);
        return res.status(200).send({ message: message });
    });
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;

    var path_file = './uploads/publications/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}

module.exports = {
    savePublication,
    getPublications,
    getUserPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}