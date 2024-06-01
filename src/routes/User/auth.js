const express = require('express');
const { sendEmail } = require('../../services/email');
const router = express.Router();
const admin = require('firebase-admin');
const validator = require('validator');

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
        // console.log(req.body)
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

// Verify endpoint
router.post('/verify', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }

        const { email, message, subject, team_name, Nodal_Officer, password , Verification , phone_number , contact_number} = req.body;

        // Generate a random 6-digit verification code
        const verificationCode = generateVerificationCode();
        const db = admin.firestore();
        // Store the email and verification code in the NewAccountReq collection
        await db.collection('NewAccountReq').doc(email).set({
            email,
            message,
            subject,
            team_name,
            Nodal_Officer,
            password,
            Verification,
            verificationCode,
            phone_number,
            contact_number,
            status: 'pending'
        });

        // Send the verification email to the user
        const Csubject = 'Account Verification Code';
        const text = `Your verification code is: ${verificationCode}`;
        const html = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
        await sendEmail(email, Csubject, text, html);

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).send('Internal Server Error');
    }
});

//  Verify code endpoint
router.post('/verify-code', async (req, res) => {
    try {
        if (!req.body) {
            throw new Error('No request body provided');
        }
        const { email, verificationCode } = req.body;
        // console.log(`Email: ${email}, Verification Code: ${verificationCode}`);

        const db = admin.firestore();
        const doc = await db.collection('NewAccountReq').doc(email).get();

        if (!doc.exists) {
            res.status(404).json({ message: 'No such document' });
            return;
        }

        const data = doc.data();
        // console.log(`Stored Data: ${JSON.stringify(data)}`);
        // console.log(`Stored Verification Code: ${data.verificationCode}, Provided Verification Code: ${verificationCode}`);

        // Ensure both codes are strings and trim any whitespace
        if (data.verificationCode.toString().trim() !== verificationCode.toString().trim()) {
            res.status(400).json({ message: 'Invalid verification code' });
            return;
        }

        // Update the status of the NewAccountReq document
        await db.collection('NewAccountReq').doc(email).update({ status: 'verified' });

        res.status(200).json({ message: 'User account created successfully' });
    } catch (error) {
        console.error('Error creating user account:', error);
        res.status(500).send('Internal Server Error');
    }
}
);

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = router;