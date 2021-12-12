const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.end.PASSWORD
    }
});

const sendEmailOnWelcome = function (email, name) {

    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'New Message from ' + "Anurag",
        text: `Hello ${name}! Welcome to our app`
    };

    transporter.sendMail(mailOptions);

}
const sendEmailOnDelete = function (email, name) {

    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'New Message from ' + "Anurag",
        text: `Dear ${name}, sad to say you good bye!`
    };

    transporter.sendMail(mailOptions);

}

module.exports = {
    sendEmailOnWelcome,
    sendEmailOnDelete
}
