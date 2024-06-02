const express = require('express');
const admin = require('firebase-admin');
const validator = require('validator');
const router = express.Router();


// create student and add to event 
router.post('/create-student/add-to-event', async (req, res) => {
    const { event_id, name, admissionNo, rollNo, department, section, joinedYear, createdAt, updatedAt, active } = req.body;
    if (!event_id || !name || !admissionNo || !rollNo || !department || !section || !joinedYear || !createdAt || !updatedAt || !active) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const db = admin.firestore();

        // Check if the student with the given admissionNo already exists
        const studentRef = db.collection('students').doc(admissionNo);
        // const studentDoc = await studentRef.get();
        // if (studentDoc.exists) {
        //     return res.status(400).json({ message: 'Student with this admission number already exists' });
        // }

        // Check if the student is already added to the event
        const eventRef = db.collection('events').doc(event_id);
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const eventData = eventDoc.data();
        if (eventData.attendees && eventData.attendees.includes(admissionNo)) {
            return res.status(400).json({ message: 'Student already added to the event' });
        }

        // Create a new student document in Firestore with admissionNo as the document ID
        await studentRef.set({
            name: name,
            admissionNo: admissionNo,
            rollNo: rollNo,
            department: department,
            section: section,
            joinedYear: joinedYear,
            createdAt: createdAt,
            updatedAt: updatedAt,
            active: active,
            id : admissionNo
        });
        // console.log('Student created with admissionNo:', admissionNo);

        // Add the student to the event
        await eventRef.update({
            attendees: admin.firestore.FieldValue.arrayUnion(admissionNo)
        });

        // Return success response
        res.status(200).json({ message: 'Student added to event successfully' });
    } catch (error) {
        // Return error response
        console.error('Error adding student to event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
