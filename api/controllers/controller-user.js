'use strict'

var bcrypt = require('bcrypt-nodejs'); // paquete que nos permite cifrar las contraseñas
var moongosePaginate = require('mongoose-pagination'); // paquete para la paginación
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');

var jwt = require('../services/jwt');
const { exists } = require('../models/user');

var transporter = require('../config/mailer').transporter;


// Métodos de los usuarios

// Registro
function saveUser(req, res) {
    let params = req.body;
    let user = new User();

    if (params.name && params.surname && params.nick &&
        params.email && params.password) {

            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = 'default-user.png' // debería asignar una imagen por defecto a todos los usuarios cuando los creo

            // Control de usuarios duplicados
            User.find({ $or: [
                             { email: user.email.toLowerCase() },
                             { nick: user.nick.toLowerCase() }
                ] }).exec((err, users) => {
                    if (err) return res.status(500).send({ message: 'Error en la petición — saveUser' });
                    if (users && users.length >= 1) {
                            return res.status(200).send({ message: 'El usuario que intenta registrar ya existe' });
                    } else {
                        // Cifrado de la password
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            user.password = hash;

                            // Guardar los usuarios
                            user.save((err, userStored) => {
                                if (err) return res.status(500).send({ message: 'Error al guardar el usuario' });

                                console.log("userStored: " + JSON.stringify(userStored));

                                if (userStored) {

                                    // SE HA REGISTRADO CORRECTAMENTE EL USUARIO
                                    console.log("registrando el user");
                                    try {
                                        // enviar el mail
                                        
                                        let info = sendMailRegister(user);

                                        res.status(200).send({ user: userStored });

                                    } catch (error) {
                                        res.status(404).send({ message: 'No se ha registrado el usuario - fallo en el envio del email' });
                                    }

                                } else {
                                    res.status(404).send({ message: 'No se ha registrado el usuario' });
                                }
                            });
                        });
                    }
                });

    } else {
        res.status(200).send({
            message: 'Envía todos los campos necesarios'
        });
    }
}

// envia el mail cuando se completa el registro
async function sendMailRegister(user) {

    await transporter.sendMail({
        from: '"Registro completado" <mycrystals.social@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Registro completado", // Subject line
        html: `
            <p>El <b>registro</b> se ha completado correctamente</p>
            <p>Puedes iniciar sesión clickando en el siguiente <a href='http://ec2-13-58-31-8.us-east-2.compute.amazonaws.com/login'> enlace </a></p>

        `, // html body
    });
}

// envia el mail de petición de cambio de contraseña
async function sendMailForgotPassword(user, token) {

    await transporter.sendMail({
        from: '"Contraseña olvidada" <mycrystals.social@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Recuperación de la contraseña", // Subject line
        //text: "Hello world?", // plain text body
        html: `
            <p>La solicitud para la <b> recuperación de contraseña </b> se ha realizado correctamente</p>
            <p>Haz click en el siguiente <a href='http://ec2-13-58-31-8.us-east-2.compute.amazonaws.com/new-password/${token}'>enlace</a> para poder restablecerla </p>

        `, // html body
    });
}

// metodo que envia el mail de recuperación de contraseña
function forgotPassword(req, res) {
    let params = req.body;

    if (params.email) {
        let email = params.email; // recogemos el mail del formulario
        User.findOne({ email: email }, (err, user) => {

            if (err) return res.status(500).send({ message: 'Error en la peticion — forgotPassword'});
    
            if (user) {
                // si existe el usuario
                let token = jwt.createToken(user);
                let info = sendMailForgotPassword(user, token);

                return res.status(200).send({
                    user: user,
                    //token: token
                });

            } else {
                return res.status(404).send({ message: 'El usuario no se ha podido identificar - no existe'});
            }
        }); 
    } else {
        res.status(200).send({
            message: 'Envía el email correctamente'
        });
    }
}

// nueva contraseña - cuando el usuario olvidó su contraseña anterior
function newPassword(req, res) {
    let userId = req.user.sub; // esto lo obtengo con el token
    let params = req.body;

    // la nueva contraseña
    if (params.password && userId) {

        let newPassword = params.password; // recogemos la nueva contraseña
        User.findOne({ '_id': userId }, (err, user) => {

            if (err) return res.status(500).send({ message: 'Error en la peticion — newPassword'});
    
            if (user) {

                // si existe el usuario le cambiamos la contraseña

                bcrypt.hash(newPassword, null, null, (err, hash) => {
                    user.password = hash;

                    // Actualizamos el usuario con la nueva contraseña
                    User.findByIdAndUpdate(userId, user, { new: true }, (err, userUpdated) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion — newPassword' });
            
                        if (!userUpdated) return res.status(404).send({ message: 'No se ha posido cambiar la contraseña' });

                        res.status(200).send({
                            user: userUpdated
                        });

                    });
                });

            } else {
                return res.status(404).send({ message: 'El usuario no se ha podido identificar - no existe'});
            }
        }); 

    } else {
        res.status(200).send({
            message: 'Ocurrió un error restableciendo la contraseña'
        });
    }

}

// cambia la contraseña cuando el usuario esta loggeado
function changePassword(req, res) {
    let userId = req.params.id; // esto lo paso por la url
    let params = req.body;

    if (userId != req.user.sub) {
      return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
    }

    // la nueva contraseña
    if (params.password && userId) {

        let newPassword = params.password; // recogemos la nueva contraseña
        User.findOne({ '_id': userId }, (err, user) => {

            if (err) return res.status(500).send({ message: 'Error en la peticion — changePassword'});
    
            if (user) {

                // si existe el usuario le cambiamos la contraseña

                bcrypt.hash(newPassword, null, null, (err, hash) => {
                    user.password = hash;

                    // Actualizamos el usuario con la nueva contraseña
                    User.findByIdAndUpdate(userId, user, { new: true }, (err, userUpdated) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion — changePassword' });
            
                        if (!userUpdated) return res.status(404).send({ message: 'No se ha posido cambiar la contraseña' });

                        res.status(200).send({
                            user: userUpdated
                        });

                    });
                });

            } else {
                return res.status(404).send({ message: 'El usuario no se ha podido identificar - no existe'});
            }
        }); 

    } else {
        res.status(200).send({
            message: 'Ocurrió un error cambiando la contraseña'
        });
    }
}

// Login
function loginUser(req, res) {
    let params = req.body;

    let email = params.email;
    let password = params.password;

    User.findOne({ email: email }, (err, user) => {

        if (err) return res.status(500).send({ message: 'Error en la peticion — loginUser'});

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    // Devolver datos de usuario
                    if (params.gettoken) {
                        // generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // devolver los datos de usuario en claro
                        user.password = undefined; // de esta manera elimino la propiedad password
                        return res.status(200).send({ user });
                    }
                    
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar'});
                }
            })
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido identificar - no existe'});
        }
    }); 
}

//Listar — devolver los datos de un usuario concreto (se le pasa el id)
function getUser(req, res) {
    // datos por url - params
    // datos por post o put - body
    let userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — GetUser' });
        if (!user) return res.status(404).send({ message: 'El usuario no existe — GetUser' });

        // para saber si nosotros como usuario identificado seguimos al usuario que se pasa por la URL
        
        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined; // para no enviar la password en el objeto usuario
            return res.status(200).send({ 
                user,
                following: value.following, // si lo seguimos
                followed: value.followed // si nos sigue
            });
        });
    });
}

function getUserNick(req, res) {
    // datos por url - params
    // datos por post o put - body
    let userNick = req.params.nick;

    User.findOne({ nick: userNick }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — GetUserNick' });
        if (!user) return res.status(404).send({ message: 'El usuario no existe — GetUserNick' });

        user.password = undefined; // para no enviar la password en el objeto usuario
        return res.status(200).send({ 
            user
        });
    });
}

// funcion que devuelve la informacion de un seguimiento entre dos usuarios
async function followThisUser(identity_user_id, user_id) {
    let following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    let followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed
    }
}

// Listar — todos los usuarios | este listado estará paginado
function getUsers(req, res) {
    let identity_user_id = req.user.sub; // id del usuario loggeado

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5; // 5 usuarios por página como máximo
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — getUsers' });
        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

        followUserIds(identity_user_id).then((value) => {
            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total: total, // cantidad total de usuarios
                pages: Math.ceil(total/itemsPerPage) // número de páginas que vamos a tener
            });
        });
    });
}

function getAllUsers(req, res) {
    let identity_user_id = req.user.sub; // id del usuario loggeado

    User.find().sort('nick').exec((err, users) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion — getAllUsers' });
        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

        return res.status(200).send({
            users: users
        });
    });
}

// función asincrona que devuelve los ids de los usuarios que seguimos y que nos siguen
// following — que seguimos
// followed — que nos siguen
async function followUserIds(user_id) {

    let following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec().then((follows) => {
        let follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        return follows_clean;    
    }).catch((err) => {
        return handleError(err);
    });

    let followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec().then((follows) => {
        let follows_clean = [];

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

function getCounters(req, res) {
    let user_id = req.user.sub;
    
    if (req.params.id) {
        user_id = req.params.id;
    }

    getCountFollow(user_id).then((value) => {
        return res.status(200).send(value); // el count que ha hecho el metodo
    });
}

async function getCountFollow(user_id) {
    let following = await Follow.countDocuments({ "user": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    let followed = await Follow.countDocuments({ "followed": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    let publications = await Publication.countDocuments({ "user": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed,
        publications: publications // numero de publicaciones 
    }
}

// Actualizar datos de un usuario
// Añadimos el control de usuarios duplicados
function updateUser(req, res) {
    let userId = req.params.id;
    let update = req.body;

    // Eliminar la propiedad password — es recomendable tener en un método separado la actualización de la contraseña
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
    }

    // Control de usuarios duplicados
    User.find({ $or: [
        { email: update.email.toLowerCase() },
        { nick: update.nick.toLowerCase() }
    ] }).exec((err, users) => {

        if (err) return res.status(500).send({ message: 'Error en la petición — updateUser' });
        
        /*if (users && users.length >= 1) {
            return res.status(404).send({ message: 'Los datos introducidos ya están en uso' });
        } else {
            // con el tercer parámetro de opciones, 'new: true' indicamos que en el objeto userUpdated queremos que estén los datos actualizados
            User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion — updateUser' });

                if (!userUpdated) return res.status(404).send({ message: 'No se ha posido actualizar el usuario' });

                return res.status(200).send({ user: userUpdated });
            });
        }*/

        let user_isset = false;
        users.forEach((user) => {
            if (user._id != userId) user_isset = true;
        });

        if (user_isset) return res.status(404).send({ message: 'Los datos introducidos ya están en uso' });
        
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion — updateUser' });

            if (!userUpdated) return res.status(404).send({ message: 'No se ha posido actualizar el usuario' });

            return res.status(200).send({ user: userUpdated });
        });
    });
}

// Subir archivos de imagen | avatar de usuario
function uploadImage(req, res) {
    let userId = req.params.id; 

    if (req.files) {
        // Si estamos enviando algún fichero
        let file_path = req.files.image.path;
        
        let file_name = file_path.split('/')[2]; // en el server es asi | en win va \\ asi
        console.log(file_path + "   " + file_name);
        let file_ext = file_name.split('\.')[1];

        console.log('file name: ' + file_name + ' | file ext: ' + file_ext);

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // Actualizar avatar del usuario logeado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion — updateUser' });

                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar la imagen del usuario' }); 
                return res.status(200).send({ user: userUpdated });
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
    let image_file = req.params.imageFile;

    let path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}

module.exports = {
    saveUser,
    loginUser,
    forgotPassword,
    newPassword,
    changePassword,
    getUser,
    getUserNick,
    getUsers,
    getAllUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile,
}