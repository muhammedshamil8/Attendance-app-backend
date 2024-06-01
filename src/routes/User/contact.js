const express = require('express');
const { sendEmail } = require('../../services/email');
const router = express.Router();

// Define the test route
router.post('/', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }
        const { email, message, subject, } = req.body;

        const to = 'emeaiedc@gmail.com'
        const html = `<p>${message}</p><p>From: ${email}</p>`;
        await sendEmail(to, subject, message, html, email);

        res.status(200).json({
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;