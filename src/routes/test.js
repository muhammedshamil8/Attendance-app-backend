const express = require('express');
const { sendEmail } = require('../services/email');
const router = express.Router();

// Define the test route
router.get('/', async (req, res) => {

    await sendEmail('shamilzamil007@gmail.com', 'New User Added', `A new user has been added: ${new Date()}`, `
    <h1 style="color: blue;">Welcome to Our Service</h1>
    <p>Thank you for joining us! Here are some resources to get you started:</p>
    <ul>
        <li><a href="https://example.com/start" style="color: green;">Getting Started Guide</a></li>
        <li><a href="https://example.com/docs" style="color: green;">Documentation</a></li>
        <li><a href="https://example.com/support" style="color: green;">Support</a></li>
    </ul>
    <p>If you have any questions, feel free to <a href="mailto:support@example.com" style="color: green;">contact our support team</a>.</p>
    <p>Best regards,<br>Your Company Name</p>
`);
    res.send('This is a test API route');
});

module.exports = router;