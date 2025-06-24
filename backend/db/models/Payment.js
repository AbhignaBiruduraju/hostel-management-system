import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentType: {
    type: String,
    enum: ['hostel_fee', 'service_bill', 'other'],
    required: true,
  },
  billingMonth: {
    type: Number, // 1 for Jan, 12 for Dec
    min: 1,
    max: 12,
    required: function() { return this.paymentType === 'hostel_fee'; }
  },
  billingYear: {
    type: Number,
    required: function() { return this.paymentType === 'hostel_fee'; }
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 