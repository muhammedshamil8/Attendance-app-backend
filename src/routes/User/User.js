const express = require('express');
const admin = require('firebase-admin');
const validator = require('validator');
const router = express.Router();
// const bcrypt = require('bcrypt');

// update user 
router.put('/update-profile', async (req, res) => {
    const { email, team_name, Nodal_Officer } = req.body;
    if (!email || !team_name || !Nodal_Officer) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const uid = req.user.uid;
    try {
        // Update the user document in Firestore
        const db = admin.firestore();
        await db.collection('users').doc(uid).update({
            email: email,
            team_name: team_name,
            Nodal_Officer: Nodal_Officer,
        });

        // Return success response
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        // Return error response
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

// update password 
router.put('/update-password', async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const uid = req.user.uid;
    try {
        //     // Get the user using the Firebase Admin SDK
        //     const userRecord = await admin.auth().getUser(uid);
        //    // Verify the old password
        //     const isPasswordCorrect = await bcrypt.compare(oldPassword, userRecord.password);
        //     if (!isPasswordCorrect) {
        //         return res.status(400).json({ message: 'Invalid old password' });
        //     }
        //     console.log(userRecord.password);
        //     console.log(isPasswordCorrect);
        //     console.log(oldPassword)
        //     console.log(newPassword)
        // Update the user using the Firebase Admin SDK 
        await admin.auth().updateUser(uid, {
            password: newPassword
        });
        // Return success response
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        // Return error response
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

module.exports = router;
