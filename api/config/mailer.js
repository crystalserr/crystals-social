'use strict'

const nodemailer = require('nodemailer'); 

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'lucia.serranoperez01@gmail.com', // generated ethereal user
        pass: 'jzfvlnxoglczmmpf', // generated ethereal password
    },
});

transporter.verify().then( () => {
    console.log('ready for sending mails');
})

module.exports = {
    transporter
}