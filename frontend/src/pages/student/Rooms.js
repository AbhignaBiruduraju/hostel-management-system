import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Rooms.css'; // We will create this CSS file next

const Rooms = () => {
  const [studentId, setStudentId] = useState('');
  const [currentHostel, setCurrentHostel] = useState('');
  const [currentRoomNumber, setCurrentRoomNumber] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.id) {
      setStudentId(userData.id);
    } else {
      setError('Student data not found. Please log in again.');
      setIsLoading(false);
    }
  }, []);

  const fetchStudentRoomDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/student/${studentId}`);
      console.log('Student details fetched:', response.data); // Log the fetched data
      console.log('Fetched Hostel:', response.data.hostel);
      console.log('Fetched Room Number:', response.data.roomNumber);
      if (response.data) {
        setCurrentHostel(response.data.hostel || '');
        setCurrentRoomNumber(response.data.roomNumber || '');
        console.log('Current Hostel after update:', response.data.hostel || '');
        console.log('Current Room Number after update:', response.data.roomNumber || '');
        // Also update localStorage with the latest student data
        const updatedUserData = { ...JSON.parse(localStorage.getItem('userData')), ...response.data };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      }
    } catch (err) {
      console.error('Error fetching student room details:', err);
      // Don't set a major error here, just log, as other parts of the page might still load
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/room');
      // Filter for available or partially occupied rooms
      setAvailableRooms(response.data.filter(room => room.status === 'Available' || room.status === 'Partially Occupied'));
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load available rooms. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchStudentRoomDetails(); // Fetch student's current room details
      fetchRooms(); // Fetch available rooms
    }
  }, [studentId, fetchStudentRoomDetails, fetchRooms]);

  const handleAssignRoom = async (hostel, roomNumber) => {
    if (!studentId) {
      alert('Student ID not found. Cannot assign room.');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${currentRoomNumber ? 'change to' : 'book'} Room ${roomNumber} in ${hostel}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.patch(`http://localhost:5000/api/student/${studentId}/assignRoom`, {
        hostel,
        roomNumber
      });

      if (response.status === 200) {
        alert(response.data.message);
        // After assigning a room, refetch all student and room details to ensure consistency
        fetchStudentRoomDetails(); 
        fetchRooms(); 
      } else {
        throw new Error(response.data.message || 'Failed to assign room.');
      }
    } catch (err) {
      console.error('Error assigning room:', err);
      setError(err.response?.data?.message || 'Error assigning room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="rooms-loading">
      <div className="spinner"></div>
      <p>Loading rooms...</p>
    </div>
  );

  if (error) return (
    <div className="rooms-error">
      <div className="error-icon">!</div>
      <p>{error}</p>
      <button className="retry-btn" onClick={fetchRooms}>Retry</button>
    </div>
  );

  return (
    <div className="rooms-container">
      <div className="rooms-header">
        <h1>Room Management</h1>
        <p>View available rooms and manage your hostel assignment</p>
      </div>

      <div className="current-room-status">
        <h2>Your Current Room</h2>
        {currentHostel && currentRoomNumber ? (
          <p>You are currently assigned to: <strong>Room {currentRoomNumber} in {currentHostel.replace("Hostel", "Block")}</strong></p>
        ) : (
          <p>You are not currently assigned to a room.</p>
        )}
      </div>

      <div className="available-rooms-section">
        <h2>Available Rooms</h2>
        {availableRooms.length === 0 ? (
          <p>No available rooms at the moment.</p>
        ) : (
          <div className="room-grid">
            {availableRooms.map(room => {
              const roomImage = `/uploads/room_${room.capacity}_bed.jpg`; // Corrected to 'bed' (singular)
              return (
                <div key={room._id} className="room-card">
                  <img src={`http://localhost:5000${roomImage}`} alt={`Room with ${room.capacity} beds`} className="room-image" />
                  <h3>Room {room.roomNumber}</h3>
                  <p>Block: {room.hostel.replace("Hostel", "Block")}</p>
                  <p>Capacity: {room.capacity}</p>
                  <p>Occupancy: {room.currentOccupancy}/{room.capacity}</p>
                  <p className={`status ${room.status.toLowerCase().replace(' ', '-')}`}>Status: {room.status}</p>
                  <button
                    className="book-change-btn"
                    onClick={() => handleAssignRoom(room.hostel, room.roomNumber)}
                    disabled={room.currentOccupancy >= room.capacity}
                  >
                    {currentRoomNumber ? 'Change to This Room' : 'Book This Room'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms; 