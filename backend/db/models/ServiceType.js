import mongoose from 'mongoose';

const serviceTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  cost: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const ServiceType = mongoose.model('ServiceType', serviceTypeSchema);

export default ServiceType; 