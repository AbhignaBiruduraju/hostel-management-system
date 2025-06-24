import mongoose from 'mongoose';
import ServiceType from './db/models/ServiceType.js';

const seedServiceTypes = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hms_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB database for seeding service types');

    const serviceTypesToSeed = [
      { name: 'Electrical', cost: 200 },
      { name: 'Plumber', cost: 300 },
      { name: 'Medical', cost: 500 },
      { name: 'Cleaning', cost: 150 },
      { name: 'Laundry', cost: 100 },
      { name: 'Maintenance', cost: 250 },
      { name: 'Internet', cost: 400 },
    ];

    for (const serviceTypeData of serviceTypesToSeed) {
      const existingServiceType = await ServiceType.findOne({ name: serviceTypeData.name });
      if (!existingServiceType) {
        await ServiceType.create(serviceTypeData);
        console.log(`✅ Service Type '${serviceTypeData.name}' added.`);
      } else {
        console.log(`❕ Service Type '${serviceTypeData.name}' already exists.`);
      }
    }

    console.log('🎉 Service types seeding complete.');
  } catch (error) {
    console.error('❌ Error seeding service types:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

seedServiceTypes(); 