import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import connectDB from './db/index.js';
import serviceRoutes from './routes/service.js';
import paymentRoutes from './routes/payment.js';
import complaintRoutes from './routes/complaint.js';
import messRoutes from './routes/mess.js';
import roomRoutes from './routes/roomRoutes.js';
import hostelFeeRoutes from './routes/hostelFee.js';
import adminRoomRequests from './routes/adminRoomRequests.js';

const app = express();
const PORT = 5000;

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/service', serviceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', authRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/hostel-fee', hostelFeeRoutes);
app.use('/api/admin/room-requests', adminRoomRequests);

app.get('/', (req, res) => {
  res.send('🏠 HMS Backend is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is live at http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
