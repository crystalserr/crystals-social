'use strict'

const nodemailer = require('nodemailer'); 

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'mycrystals.social@gmail.com', // generated ethereal user
        pass: 'jbytnevjfytgandh', // generated ethereal password
    },
});

transporter.verify().then( () => {
    console.log('Listo para enviar e-mails');
})

module.exports = {
    transporter
}