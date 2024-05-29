const express = require('express');

const router = express.Router();

// Define the test route
router.get('/', (req, res) => {
    res.send('This is a test API route');
});

module.exports = router;