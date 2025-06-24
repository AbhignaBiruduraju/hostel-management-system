// backend/routes/service.js
import express from "express";
import Service from "../db/models/Service.js";
import ServiceType from "../db/models/ServiceType.js";
import Student from "../db/models/Student.js";
import Payment from "../db/models/Payment.js";

const router = express.Router();

// Add a new service request
router.post('/', async (req, res) => {
  try {
    const { student_id, student_name, room_number, description, service_type } = req.body;
    console.log('Received service request data:', { student_id, student_name, room_number, description, service_type });

    // Get service cost
    const serviceType = await ServiceType.findOne({ name: service_type });
    console.log('Found serviceType in DB:', serviceType);
    if (!serviceType) {
      return res.status(500).json({ message: 'Service type not found' });
    }

    const service = new Service({
      student_id,
      student_name,
      room_number,
      description,
      service_type,
      cost: serviceType.cost
    });

    await service.save();
    res.status(200).json({ message: 'Service request submitted successfully', cost: serviceType.cost });
  } catch (error) {
    console.error('Error submitting service request:', error);
    res.status(500).json({ message: 'Failed to submit service request' });
  }
});

// Accept service request and add payment
router.patch('/:id/accept', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    const serviceType = await ServiceType.findOne({ name: service.service_type });
    if (!serviceType) {
      console.error('Service type not found for:', service.service_type);
      return res.status(500).json({ error: 'Failed to fetch service cost' });
    }

    service.status = 'Accepted';
    service.cost = serviceType.cost;
    await service.save();

    // Find student
    const student = await Student.findById(service.student_id);

    if (!student) {
      console.error('Student not found for accepting service:', service.student_name, service.room_number, service.student_id);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create payment
    const payment = await Payment.create({
      studentId: student._id,
      serviceId: service._id,
      amount: serviceType.cost,
      status: 'pending',
      paymentType: 'service_bill',
      billingMonth: new Date().getMonth() + 1,
      billingYear: new Date().getFullYear()
    });

    console.log('Payment created successfully:', payment);

    res.status(200).json({ message: 'Service accepted and payment added' });
  } catch (error) {
    console.error('Error accepting service request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a service request
router.patch('/:id/cancel', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    service.status = 'Cancelled';
    await service.save();

    res.status(200).json({ message: 'Service cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "DB error" });
  }
});

// Get service requests by student ID
router.get("/student/id/:studentId", async (req, res) => {
  try {
    const services = await Service.find({ student_id: req.params.studentId })
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
