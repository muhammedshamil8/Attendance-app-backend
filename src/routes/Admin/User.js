const express = require('express');
const admin = require('firebase-admin');
const validator = require('validator');
const router = express.Router();
const { sendIEDCEmail } = require('../../services/iedcMail');

// Create a new user
router.post('/create-user', async (req, res) => {
    const { email, password, role, Nodal_Officer, team_name, status } = req.body;
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
    if (!email || !password || !role || !Nodal_Officer || !team_name) {
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
            team_name: team_name,
            Nodal_Officer: Nodal_Officer,
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
// router.delete('/delete-user/:uid', async (req, res) => {
//     const { uid } = req.params;

//     try {
//         // Delete the user using the Firebase Admin SDK
//         await admin.auth().deleteUser(uid);

//         // Delete the user document in Firestore
//         const db = admin.firestore();
//         await db.collection('users').doc(uid).delete();

//         // Return success response
//         res.status(200).json({ message: 'User deleted successfully' });
//     } catch (error) {
//         // Return error response
//         console.error('Error deleting user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }
// );

// Delete a user
router.delete('/delete-user/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const db = admin.firestore();

        // Fetch user's events
        const eventsSnapshot = await db.collection('events').where('userId', '==', uid).get();
        const batch = db.batch();

        // Log each event and delete them
        if (eventsSnapshot.empty) {
            console.log(`No events found for user ${uid}`);
        } else {
            eventsSnapshot.forEach((doc) => {
                console.log(`Deleting event:`, doc.data());
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`All events for user ${uid} have been deleted.`);
        }

        // Delete the user using the Firebase Admin SDK
        await admin.auth().deleteUser(uid);

        // Delete the user document in Firestore
        await db.collection('users').doc(uid).delete();

        // Return success response
        res.status(200).json({ message: 'User and associated events deleted successfully' });
    } catch (error) {
        // Return error response
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//  Update a user
router.put('/update-user/:uid', async (req, res) => {
    const { uid } = req.params;
    const { email, role, team_name, Nodal_Officer, status } = req.body;

    // Validate email format
    if (email && !validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!team_name || !Nodal_Officer) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Update the user document in Firestore
        const db = admin.firestore();
        await db.collection('users').doc(uid).set({
            email: email,
            role: role,
            team_name: team_name,
            Nodal_Officer: Nodal_Officer,
            status: status,
        }, { merge: true });

        // Return success response
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        // Return error response
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

// Verify and create a user and send an email to the user
router.post('/accept', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }
        console.log(req.body);
        const { email, team_name, Nodal_Officer, password, phone_number } = req.body;

        if (!email || !team_name || !Nodal_Officer || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        } else if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password is required and must be atleast 6 character' });
        }

        const db = admin.firestore();


        // Check if the email already exists
        let userExists;
        try {
            userExists = await admin.auth().getUserByEmail(email);
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error; // Rethrow unexpected errors
            }
        }

        if (userExists) {
            return res.status(400).json({ message: 'The email address is already in use by another account.' });
        }

        //  Accept the user account
        await db.collection('NewAccountReq').doc(email).set({
            Verification: 'Accepted',
        }, { merge: true });
        // Create a new user account
        const userRecord = await admin.auth().createUser({
            email,
            password: password
        });
        const role = 'user';

        // Assign the user a role
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

        // Create a document in Firestore for the user
        await db.collection('users').doc(userRecord.uid).set({
            email: email,
            role: role,
            team_name: team_name,
            Nodal_Officer,
            phone_number,
            status: true,
            events: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send the verification code to the user's email
        const subject = 'Your Account Request has been accepted';
        const link = 'https://attendance-collection.vercel.app/signin';
        const text = `Your account request has been accepted. You can now login to your account.`;
        const html = `<p>${text}</p><p>Click <a href="${link}">here</a> to login</p>`;
        await sendIEDCEmail(email, subject, text, html);
        res.status(200).json({
            message: 'user created successfully'
        });
    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

//  Reject and email to the user
router.post('/reject', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // console.log(req.body);
        const db = admin.firestore();
        //  Reject the user account
        await db.collection('NewAccountReq').doc(email).set({
            Verification: 'Rejected',
        }, { merge: true });

        // console.log(db.collection('NewAccountReq').doc(email).get());

        const message = `Your account request has been rejected. Please contact the admin for more information.`;
        // Send the rejection email to the user
        const subject = 'Your Account Request has been rejected';
        const link = 'https://attendance-collection.vercel.app/contact';
        const text = `Your account request has been rejected. Please contact the admin for more information.`;
        const html = `<p>${text}</p><p>Click <a href="${link}">here</a> to contact the admin</p>`;
        await sendIEDCEmail(email, subject, message, html);
        res.status(200).json({
            message: 'Rejection email sent successfully'
        });
    } catch (error) {
        console.error('Error sending rejection email:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

//  disable user
router.patch('/disable-user/:uid', async (req, res) => {
    const { uid } = req.params;
    try {

        const db = admin.firestore();
        await db.collection('users').doc(uid).set({
            status: false
        }, { merge: true });

        const userRecord = await admin.auth().updateUser(uid, {
            disabled: true
        });

        // Return success response
        res.status(200).json({ message: 'User disabled successfully' });
    } catch (error) {
        // Return error response
        console.error('Error disabling user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

//  enable user
router.patch('/enable-user/:uid', async (req, res) => {
    const { uid } = req.params;
    try {

        const db = admin.firestore();
        await db.collection('users').doc(uid).set({
            status: true
        }, { merge: true });

        const userRecord = await admin.auth().updateUser(uid, {
            disabled: false
        });

        // Return success response
        res.status(200).json({ message: 'User enabled successfully' });
    } catch (error) {
        // Return error response
        console.error('Error enabling user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);
module.exports = router;
