import express from 'express';
import Room from '../db/models/Room.js';
import Student from '../db/models/Student.js';

const router = express.Router();


const updateRoomOccupancy = async (roomNumber, hostelName) => {
  const room = await Room.findOne({ roomNumber, hostel: hostelName });
  if (!room) {
    throw new Error('Room not found');
  }

  const occupiedCount = await Student.countDocuments({
    roomNumber: room.roomNumber,
    hostel: room.hostel,
  });

  room.currentOccupancy = occupiedCount;
  if (occupiedCount === room.capacity) {
    room.status = 'Occupied';
  } else if (occupiedCount > 0) {
    room.status = 'Partially Occupied';
  } else {
    room.status = 'Available';
  }
  await room.save();
  return room;
};


router.post('/', async (req, res) => {
  try {
    const { roomNumber, hostel, capacity } = req.body;
    const existingRoom = await Room.findOne({ roomNumber, hostel });
    if (existingRoom) {
      return res.status(409).json({ message: 'Room already exists in this hostel.' });
    }

    const newRoom = new Room({
      roomNumber,
      hostel,
      capacity,
      currentOccupancy: 0, 
      status: 'Available'
    });
    await newRoom.save();
    res.status(201).json({ message: 'Room added successfully', room: newRoom });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    let rooms = await Room.find();

    
    const updatedRooms = [];
    for (const room of rooms) {
      const occupiedCount = await Student.countDocuments({
        roomNumber: room.roomNumber,
        hostel: room.hostel,
      });

      let status = 'Available';
      if (occupiedCount === room.capacity) {
        status = 'Occupied';
      } else if (occupiedCount > 0) {
        status = 'Partially Occupied';
      } else {
        status = 'Available';
      }
      
      
      if (room.currentOccupancy !== occupiedCount || room.status !== status) {
        room.currentOccupancy = occupiedCount;
        room.status = status;
        await room.save();
      }
      updatedRooms.push(room);
    }

    res.json(updatedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { roomNumber, hostel, capacity, currentOccupancy, status } = req.body;

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, hostel, capacity, currentOccupancy, status },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    
    await updateRoomOccupancy(updatedRoom.roomNumber, updatedRoom.hostel);

    res.json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { updateRoomOccupancy };
export default router; 