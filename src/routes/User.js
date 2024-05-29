const express = require('express');
const admin = require('firebase-admin');
const validator = require('validator');
const router = express.Router();

// Create a new user
router.post('/create-user', async (req, res) => {
    const { email, password, role, name, category, Head_name, status } = req.body;
    // console.log(req.body);

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password format (e.g., at least 6 characters)
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if all required fields are present
    if (!email || !password || !role || !name || !category || !Head_name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Create the user using the Firebase Admin SDK
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password
        });

        // Assign custom claims to the user
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

        // Create a document in Firestore for the user
        const db = admin.firestore();
        await db.collection('users').doc(userRecord.uid).set({
            email: email,
            role: role,
            name: name,
            category: category,
            Head_name: Head_name,
            status: status || true,
            events: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Return success response
        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        // Return error response
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a user
router.delete('/delete-user/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        // Delete the user using the Firebase Admin SDK
        await admin.auth().deleteUser(uid);

        // Delete the user document in Firestore
        const db = admin.firestore();
        await db.collection('users').doc(uid).delete();

        // Return success response
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        // Return error response
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

module.exports = router;
