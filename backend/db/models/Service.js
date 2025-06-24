import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  student_name: {
    type: String,
    required: true
  },
  room_number: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  service_type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  cost: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service; 