import mongoose from 'mongoose';

const messOffSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }]
}, { timestamps: true });

const MessOff = mongoose.model('MessOff', messOffSchema);
export default MessOff; 