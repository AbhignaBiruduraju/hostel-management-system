import mongoose from 'mongoose';
import Student from './db/models/Student.js';
import Payment from './db/models/Payment.js';
import ServiceType from './db/models/ServiceType.js';

const seedPayments = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hms_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB database for seeding payments');

    const studentUsername = 'vinny@gmail.com';
    let student = await Student.findOne({ username: studentUsername });

    if (!student) {
      console.log(`Student with username ${studentUsername} not found, creating one...`);
      student = new Student({
        name: 'vinny',
        username: studentUsername,
        password: 'vinny123',
        phone: '8688082443',
        rollNumber: '123456',
        hostel: 'block 2',
        roomNumber: '101',
      });
      await student.save();
      console.log(`Student ${studentUsername} created.`);
    }

    const studentId = student._id;
    const currentYear = new Date().getFullYear();
    const annualHostelFee = 100000;
    const monthlyHostelFee = annualHostelFee / 12;

    console.log(`Seeding monthly hostel fees for ${studentUsername}...`);
    for (let i = 1; i <= 12; i++) {
      const existingHostelPayment = await Payment.findOne({
        studentId,
        paymentType: 'hostel_fee',
        billingMonth: i,
        billingYear: currentYear,
      });

      if (!existingHostelPayment) {
        const status = i <= 6 ? 'completed' : 'pending'; // First 6 months completed, rest pending
        const hostelPayment = new Payment({
          studentId,
          amount: monthlyHostelFee,
          status,
          paymentType: 'hostel_fee',
          billingMonth: i,
          billingYear: currentYear,
        });
        await hostelPayment.save();
        console.log(`Hostel fee for month ${i}/${currentYear} (${status}) added for ${studentUsername}.`);
      } else {
        console.log(`Hostel fee for month ${i}/${currentYear} already exists for ${studentUsername}.`);
      }
    }

    console.log(`Seeding sample service bills for ${studentUsername}...`);
    const medicalService = await ServiceType.findOne({ name: 'Medical' });
    const plumberService = await ServiceType.findOne({ name: 'Plumber' });

    if (medicalService) {
      const existingServicePayment = await Payment.findOne({
        studentId,
        serviceId: medicalService._id,
        paymentType: 'service_bill',
        status: 'completed',
        createdAt: { $gte: new Date(currentYear, 5, 10), $lt: new Date(currentYear, 5, 11) } // Assuming 6/10/2025
      });

      if (!existingServicePayment) {
        const servicePayment1 = new Payment({
          studentId,
          serviceId: medicalService._id,
          amount: 100,
          status: 'completed',
          paymentType: 'service_bill',
          createdAt: new Date(currentYear, 5, 10), // June 10, 2025
        });
        await servicePayment1.save();
        console.log('Completed Medical service bill added.');
      } else {
        console.log('Completed Medical service bill already exists.');
      }
    }

    if (plumberService) {
      const existingServicePayment = await Payment.findOne({
        studentId,
        serviceId: plumberService._id,
        paymentType: 'service_bill',
        status: 'completed',
        createdAt: { $gte: new Date(currentYear, 5, 10), $lt: new Date(currentYear, 5, 11) } // Assuming 6/10/2025
      });

      if (!existingServicePayment) {
        const servicePayment2 = new Payment({
          studentId,
          serviceId: plumberService._id,
          amount: 200,
          status: 'completed',
          paymentType: 'service_bill',
          createdAt: new Date(currentYear, 5, 10), // June 10, 2025
        });
        await servicePayment2.save();
        console.log('Completed Plumber service bill added.');
      } else {
        console.log('Completed Plumber service bill already exists.');
      }
    }

  } catch (error) {
    console.error('❌ Error seeding payments:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

seedPayments(); 