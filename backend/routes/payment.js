import express from 'express';
import Payment from '../db/models/Payment.js';
import Service from '../db/models/Service.js';
import Student from '../db/models/Student.js';

const router = express.Router();

// Get student payment info with filters
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    console.log('Fetching payments for studentId:', studentId);

    let query = { studentId };

    // Apply status filter if provided
    if (status) {
      query.status = status;
    }

    console.log('Payment query:', query);

    const payments = await Payment.find(query)
      .populate('serviceId')
      .sort({ createdAt: -1 });

    console.log('Payments found for student:', JSON.stringify(payments, null, 2));

    res.json(payments);
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Get all payments (for admin) with filters
router.get('/', async (req, res) => {
  try {
    const { studentId, status, paymentType, billingMonth, billingYear } = req.query;

    let query = {};

    if (studentId) {
      query.studentId = studentId;
    }
    if (status) {
      query.status = status;
    }
    if (paymentType) {
      query.paymentType = paymentType;
    }
    if (billingMonth) {
      query.billingMonth = parseInt(billingMonth);
    }
    if (billingYear) {
      query.billingYear = parseInt(billingYear);
    }

    const payments = await Payment.find(query).populate('serviceId').populate('studentId').sort({ createdAt: -1 });
    console.log('Fetched payments with populated serviceId and studentId:', JSON.stringify(payments, null, 2));
    res.json(payments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Error fetching all payments' });
  }
});

// Get service requests by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const services = await Service.find({ student_id: req.params.studentId });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service requests' });
  }
});

// Add new payment (admin will use this)
router.post('/', async (req, res) => {
  try {
    const { studentId, serviceId, amount, status, paymentType, billingMonth, billingYear } = req.body;

    if (paymentType === 'hostel_fee' && (!billingMonth || !billingYear)) {
      return res.status(400).json({ message: 'Billing month and year are required for hostel fees.' });
    }

    const payment = new Payment({
      studentId,
      serviceId,
      amount,
      status,
      paymentType,
      billingMonth: paymentType === 'hostel_fee' ? billingMonth : undefined,
      billingYear: paymentType === 'hostel_fee' ? billingYear : undefined,
    });

    await payment.save();
    res.status(201).json({ message: 'Payment added successfully', payment });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Failed to add payment' });
  }
});

// Update payment status to 'completed' (formerly delete)
router.patch('/:id/complete', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.status = 'completed';
    await payment.save();
    res.status(200).json({ message: 'Payment status updated to completed', payment });
  } catch (error) {
    // Log the specific error for debugging
    console.error('Error updating payment status in backend:', error); 
    res.status(500).json({ message: 'Server error: Could not update payment status.' });
  }
});


router.delete('/clean-na', async (req, res) => {
  try {
    const result = await Payment.deleteMany({ serviceId: { $exists: false } });
    
    res.status(200).json({ message: `Successfully deleted ${result.deletedCount} payments with N/A service type.`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting N/A service type payments:', error);
    res.status(500).json({ message: 'Failed to delete N/A service type payments.' });
  }
});


router.delete('/clean-orphaned', async (req, res) => {
  try {
    
    const paymentsToDelete = await Payment.find({
      $or: [
        { studentId: null },
        { studentId: { $exists: true } } 
      ]
    });

    let deletedCount = 0;
    for (const payment of paymentsToDelete) {
      const studentExists = await Student.findById(payment.studentId);
      if (!studentExists) {
        await Payment.findByIdAndDelete(payment._id);
        deletedCount++;
      }
    }

    res.status(200).json({ message: `Successfully deleted ${deletedCount} orphaned payments.`, deletedCount });
  } catch (error) {
    console.error('Error deleting orphaned payments:', error);
    res.status(500).json({ message: 'Failed to delete orphaned payments.' });
  }
});

export default router;
