import mongoose from 'mongoose';
import ServiceType from './models/ServiceType.js'; 
import Admin from './models/Admin.js'; 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/hms_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB database');

    
    await seedServiceTypes();

    
    await seedAdminUser();

    
    const serviceTypesInDb = await ServiceType.find({});
    console.log('Service Types currently in DB:', serviceTypesInDb);

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

const seedServiceTypes = async () => {
  try {
    const count = await ServiceType.countDocuments();
    if (count === 0) {
      console.log('Seeding default service types...');
      const defaultServiceTypes = [
        { name: 'Electrical', cost: 50 },
        { name: 'Plumber', cost: 75 },
        { name: 'Medical', cost: 80 },
        { name: 'Cleaning', cost: 45 },
        { name: 'Laundry', cost: 25 },
        { name: 'Maintenance', cost: 100 },
        { name: 'Internet', cost: 30 }
      ];
      await ServiceType.insertMany(defaultServiceTypes);
      console.log('Default service types seeded successfully!');
    } else {
      console.log('Service types already exist. No seeding needed.');
    }
  } catch (error) {
    console.error('Error seeding service types:', error.message);
  }
};

const seedAdminUser = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding default admin user...');
      const defaultAdmin = new Admin({
        username: 'admin@hms.com',
        password: 'admin123' 
      });
      await defaultAdmin.save();
      console.log('Default admin user seeded successfully!');
    } else {
      console.log('Admin user already exists. No seeding needed.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

export default connectDB;
