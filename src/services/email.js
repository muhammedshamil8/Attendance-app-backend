const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iedcemeadeveloper@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendEmail(to, subject, text, html, from) {
    try {
        let mailOptions = {
            from: 'MARK !T <CTO@2024>',
            replyTo: from,
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

module.exports = { sendEmail };