import express from 'express';
import Student from '../db/models/Student.js';
import Admin from '../db/models/Admin.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    let user = null;
    if (role === 'student') {
      user = await Student.findOne({ username });
      if (user && user.status !== 'approved') {
        return res.status(403).json({ message: `Account ${user.status}. Please contact administration.` });
      }
    } else if (role === 'admin') {
      user = await Admin.findOne({ username });
    }

    if (!user) {
      console.log(`Login attempt for unknown user: ${username}`);
      return res.status(401).json({ message: 'Invalid username' });
    }

    console.log(`Login attempt: User ${username}, Role ${role}`);
    console.log(`Input password: ${password}`);
    console.log(`Stored password: ${user.password}`);

    
    if (user.password !== password) {
      console.log(`Password mismatch for user: ${username}`);
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role,
        name: user.name,
        roomNumber: user.roomNumber,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { fullName, email, password, phone, rollNumber, hostel, roomNumber } = req.body;

  console.log(`Register route received: Email=${email}, Password=${password}, FullName=${fullName}, Hostel=${hostel}, RoomNumber=${roomNumber}`);

  
  if (!fullName || !email || !phone || !rollNumber) {
    return res.status(400).json({ message: 'All required fields (Full Name, Email, Phone, Roll Number) are missing.' });
  }

  try {
    let student = await Student.findOne({ username: email });

    if (student) {
      
      if (student.password) {
        
        return res.status(409).json({ message: 'User with this email is already fully registered.' });
      } else {
        
        if (student.status === 'approved' && password) {
          
          student.name = fullName; 
          student.phone = phone;
          student.rollNumber = rollNumber;
          student.hostel = hostel;
          student.roomNumber = roomNumber;
          student.password = password; 
          console.log(`Setting password for approved student ${email}: ${password}`);
          console.log("Student object before save (approved user):");
          console.log(student);
          await student.save();
          console.log("Student object after save (approved user):");
          console.log(student);
          return res.status(200).json({ message: 'Registration successful! You can now login.', user: { id: student._id, username: student.username, role: 'student' } });
        } else if (student.status === 'pending') {
          return res.status(403).json({ message: 'Your registration is pending admin approval.' });
        } else if (student.status === 'rejected') {
          return res.status(403).json({ message: 'Your registration was rejected by admin. Please contact administration.' });
        } else {
          
          return res.status(400).json({ message: 'Invalid registration state. Please ensure you are approved and providing a password.' });
        }
      }
    } else {
      
      const newStudent = new Student({
        name: fullName,
        username: email,
        phone: phone,
        rollNumber: rollNumber,
        hostel: hostel,
        roomNumber: roomNumber,
        status: 'pending', 
      });
      console.log(`New pending registration request for ${email}.`);
      console.log("New student object before save (pending user):");
      console.log(newStudent);
      await newStudent.save();
      console.log("New student object after save (pending user):");
      console.log(newStudent);
      return res.status(201).json({ message: 'Registration request submitted. Awaiting admin approval.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
