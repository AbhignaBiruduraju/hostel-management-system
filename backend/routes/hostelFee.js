import express from 'express';
import Payment from '../db/models/Payment.js';
import Student from '../db/models/Student.js';


const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { month, year } = req.body;
    const now = new Date();
    const billingMonth = month || (now.getMonth() + 1);
    const billingYear = year || now.getFullYear();

    
    const hostelFeeAmount = 5000; 

    const students = await Student.find({});
    let created = 0;
    

    for (const student of students) {
      
      const exists = await Payment.findOne({
        studentId: student._id,
        paymentType: 'hostel_fee',
        billingMonth,
        billingYear
      });

      if (!exists) {
        

        await Payment.create({
          studentId: student._id,
          amount: hostelFeeAmount,
          status: 'pending',
          paymentType: 'hostel_fee',
          billingMonth,
          billingYear
        });
        created++;
      }
    }
    res.json({ message: `Hostel fees generated for ${created} students for ${billingMonth}/${billingYear}.` }); 
  } catch (err) {
    console.error('Error generating hostel fees:', err);
    res.status(500).json({ message: 'Failed to generate hostel fees', error: err.message });
  }
});


router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    let query = {
      studentId,
      paymentType: 'hostel_fee'
    };

    if (month && year) {
      query.billingMonth = parseInt(month);
      query.billingYear = parseInt(year);
    }

    const payments = await Payment.find(query)
      .sort({ billingYear: -1, billingMonth: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching hostel fees:', error);
    res.status(500).json({ message: 'Error fetching hostel fees' });
  }
});

export default router; 