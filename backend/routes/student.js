import express from 'express';
import Student from '../db/models/Student.js';
import { updateRoomOccupancy } from './roomRoutes.js';
import Room from '../db/models/Room.js';
import RoomChangeRequest from '../db/models/RoomChangeRequest.js';
import Payment from '../db/models/Payment.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Add a new student (admin pre-registration - deprecated with new flow)
router.post('/', async (req, res) => {
  try {
    const { name, username, phone, rollNumber, hostel, roomNumber } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ username }, { rollNumber }] });
    if (existingStudent) {
      return res.status(409).json({ message: 'Student with this email or roll number already exists' });
    }

    const newStudent = new Student({
      name,
      username,
      phone,
      rollNumber,
      hostel,
      roomNumber,
      status: 'approved', 
    });

    await newStudent.save();
    
    
    if (newStudent.roomNumber && newStudent.hostel) {
      await updateRoomOccupancy(newStudent.roomNumber, newStudent.hostel);
    }

    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin update student status (approve/reject registration requests)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    student.status = status;

    // If approving, set a temporary password if none exists
    if (status === 'approved' && !student.password) {
      const tempPassword = '123456'; // Using the user's preferred temporary password
      student.password = tempPassword;
      console.log(`Assigned temporary password for ${student.username}: ${tempPassword}`);
    } else if (status === 'rejected') {
      // If student is rejected, delete all their payments
      await Payment.deleteMany({ studentId: student._id });
      console.log(`Deleted all payments for rejected student ID: ${student._id}`);
    }

    try {
      await student.save();
      console.log(`Student ${student.username} saved successfully with status ${student.status}.`);
    } catch (saveError) {
      console.error(`Error saving student ${student.username}:`, saveError);
      return res.status(500).json({ message: 'Failed to save student data after status update.', error: saveError.message });
    }

    res.status(200).json({ message: `Student status updated to ${status}.`, student: student });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign or change a student's room (now submits a request for admin approval)
router.patch('/:id/assignRoom', async (req, res) => {
  try {
    const { id: studentId } = req.params; // studentId
    const { hostel, roomNumber } = req.body;

    if (!hostel || !roomNumber) {
      return res.status(400).json({ message: 'Hostel and Room Number are required.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Check if the new room exists and has capacity
    const newRoom = await Room.findOne({ roomNumber, hostel });
    if (!newRoom) {
      return res.status(404).json({ message: 'Requested room not found.' });
    }
    if (newRoom.currentOccupancy >= newRoom.capacity) {
      return res.status(409).json({ message: 'Requested room is fully occupied.' });
    }

    // Check if the student is already assigned to this exact room
    if (student.roomNumber === roomNumber && student.hostel === hostel) {
      return res.status(400).json({ message: 'You are already assigned to this room.' });
    }

    // Check if there is an existing pending request for this student
    const existingPendingRequest = await RoomChangeRequest.findOne({
      studentId,
      status: 'pending'
    });

    if (existingPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending room change request. Please wait for it to be processed.' });
    }

    // Create a new room change request
    const roomChangeRequest = new RoomChangeRequest({
      studentId,
      oldHostel: student.hostel,
      oldRoomNumber: student.roomNumber,
      newHostel: hostel,
      newRoomNumber: roomNumber,
      status: 'pending'
    });

    await roomChangeRequest.save();

    res.status(200).json({ message: 'Room change request submitted for admin approval.', request: roomChangeRequest });
  } catch (error) {
    console.error('Error submitting room change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE student by ID
router.put('/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, username, phone, rollNumber, hostel, roomNumber } = req.body;
    const profilePicPath = req.file ? req.file.path.replace(/\\/g, '/') : req.body.profilePic;

    const oldStudent = await Student.findById(req.params.id);

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, username, phone, rollNumber, hostel, roomNumber, profilePic: profilePicPath },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    
    if (oldStudent && (oldStudent.roomNumber !== updatedStudent.roomNumber || oldStudent.hostel !== updatedStudent.hostel)) {
        
        if (oldStudent.roomNumber && oldStudent.hostel) {
            await updateRoomOccupancy(oldStudent.roomNumber, oldStudent.hostel);
        }
        
        if (updatedStudent.roomNumber && updatedStudent.hostel) {
            await updateRoomOccupancy(updatedStudent.roomNumber, updatedStudent.hostel);
        }
    }

    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    
    await Payment.deleteMany({ studentId: deletedStudent._id });
    console.log(`Deleted all payments for student ID: ${deletedStudent._id}`);

    // Update room occupancy after deleting a student
    if (deletedStudent.roomNumber && deletedStudent.hostel) {
      await updateRoomOccupancy(deletedStudent.roomNumber, deletedStudent.hostel);
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { updateRoomOccupancy };
export default router;
