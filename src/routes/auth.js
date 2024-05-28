const express = require('express');

const router = express.Router();

// Define the test route
// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }

        const { email, password, role } = req.body;
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Assign role (if necessary)
        if (role) {
            await admin.auth().setCustomUserClaims(userRecord.uid, { role });
        }

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login endpoint
router.post('/api/login', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }
        console.log(req.body)
        const { email, password } = req.body;
        const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({
            message: 'Unauthorized '
        });
    }
});

module.exports = router;