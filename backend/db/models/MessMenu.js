import mongoose from 'mongoose';

const messMenuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true, // Only one menu per day
  },
  breakfast: {
    type: String,
    default: ''
  },
  lunch: {
    type: String,
    default: ''
  },
  snacks: {
    type: String,
    default: ''
  },
  dinner: {
    type: String,
    default: ''
  },
}, {
  timestamps: true
});

const MessMenu = mongoose.model('MessMenu', messMenuSchema);

export default MessMenu; 