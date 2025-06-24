import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  hostel: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentOccupancy: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Partially Occupied', 'Under Maintenance'],
    default: 'Available'
  }
}, { timestamps: true });

// Add a compound unique index on roomNumber and hostel
roomSchema.index({ roomNumber: 1, hostel: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

export default Room; 