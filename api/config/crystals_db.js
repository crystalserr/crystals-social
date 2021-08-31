
// Hacemos la conexión con mongo y creamos la base de datos
conn = new Mongo("localhost");
db = conn.getDB("crystalsDB_local"); 

// Limpiamos la base de datos por si existia algo antes
db.dropDatabase();

// Creamos la colección de usuarios
db.createCollection("users");

admin = {
    name: "Administrador",
    surname: "Crystals",
    nick: "admin",
    email: "admin@crystals.com",
    password: "$2a$10$DhYrI1RoCKspVGujvPfpY..wHY5Fkop8u6zBndG/VNIr5pA07owOa",
    role: "ROLE_ADMIN",
    image: "default-user.png"
}

user = {
    name: "User",
    surname: "Prueba",
    nick: "user_prueba",
    email: "user@prueba.com",
    password: "$2a$10$DhYrI1RoCKspVGujvPfpY..wHY5Fkop8u6zBndG/VNIr5pA07owOa",
    role: "ROLE_USER",
    image: "default-user.png"
}

// Insertamos los usuarios en la colección
db.users.insertMany([admin, user]);

let user_admin = db.users.findOne({"nick": "admin"}); // recupero el usuario administrador

// Creamos la colección de publicaciones
db.createCollection("publications");

var dateTime = Date.now();
var timestamp = Math.floor(dateTime / 1000);

var publication1 = {
    text: "Hola, te doy la bienvenida a Crystals",
    file: "null",
    created_at: timestamp,
    user: user_admin._id
}

var publication2 = {
    text: "Aquí podrás compartir publicaciones con tus seguidores, seguir a otros usuarios y mandar mensajes",
    file: "null",
    created_at: timestamp,
    user: user_admin._id
}

// Insertamos las publicaciones en la colección
db.publications.insertMany([publication1, publication2]);


