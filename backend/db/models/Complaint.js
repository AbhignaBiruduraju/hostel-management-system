import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: false
  },
  complaintText: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  response: {
    type: String
  }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint; 