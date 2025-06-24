import mongoose from 'mongoose';

const roomChangeRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  oldHostel: {
    type: String,
  },
  oldRoomNumber: {
    type: String,
  },
  newHostel: {
    type: String,
    required: true
  },
  newRoomNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const RoomChangeRequest = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);

export default RoomChangeRequest; 