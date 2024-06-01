const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'emeaiedc@gmail.com',
        pass: process.env.IEDC_EMAIL_PASSWORD
    }
});

async function sendIEDCEmail(to, subject, text, html) {
    try {
        let mailOptions = {
            from: 'IEDC EMEA ',
            replyTo: 'emeaiedc@gmail.com',
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        await transporter.sendMail(mailOptions);
        // console.log('Email sent successfully!');
    } catch (error) {
        console.log('Error sending email:', error);
    }
}

module.exports = { sendIEDCEmail };