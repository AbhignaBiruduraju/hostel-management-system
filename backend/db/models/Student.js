import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  hostel: {
    type: String,
    required: false
  },
  roomNumber: {
    type: String,
    required: false
  },
  profilePic: {
    type: String,
    default: 'default-user.png'
  },
  password: {
    type: String,
    required: false, // Password is not required initially, set by student later
    select: true // Ensure password field is always selected by default
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student; 