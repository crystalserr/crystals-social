'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

// Conexión a la base de datos

mongoose.promise = global.Promise;

// public mongo atlas - cloud database
//mongoose.connect('mongodb+srv://admin:LuciaS_@cluster0.fk4ye.mongodb.net/crystals?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }) 

// MongoDB Local
mongoose.connect('mongodb://localhost:27017/crystals_db', { useNewUrlParser: true, useUnifiedTopology: true })    

    .then(() => {
            console.log("La conexión a la bd crystals se ha realizado correctamente");

            // Creación del servidor
            app.listen(port, () => {
                console.log("Servidor corriendo en http://localhost:3800");
            });
        })
        .catch(e => console.log(e));