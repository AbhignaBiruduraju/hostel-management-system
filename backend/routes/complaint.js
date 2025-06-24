import express from 'express';
import Complaint from '../db/models/Complaint.js';
import Student from '../db/models/Student.js';

const router = express.Router();

// Student submits a new complaint
router.post('/', async (req, res) => {
  try {
    const { studentId, complaintText } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newComplaint = new Complaint({
      studentId: student._id,
      studentName: student.name,
      roomNumber: student.roomNumber,
      complaintText,
    });

    await newComplaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Failed to submit complaint' });
  }
});

// Student gets their complaints
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const complaints = await Complaint.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching student complaints:', error);
    res.status(500).json({ message: 'Failed to fetch student complaints' });
  }
});


router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('studentId').sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});


router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body; 

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'resolved';
    complaint.response = response || 'Resolved by admin'; 
    await complaint.save();

    res.status(200).json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Failed to resolve complaint' });
  }
});

export default router; 