import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import './ManageRooms.css';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    hostel: '',
    capacity: '',
    currentOccupancy: '',
    status: 'Available'
  });
  const [isEditing, setIsEditing] = useState(null);
  const [roomRequests, setRoomRequests] = useState([]); // New state for room requests
  const [requestsLoading, setRequestsLoading] = useState(true); // New state for loading requests
  const [requestsError, setRequestsError] = useState(null); // New state for request errors

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/room');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let data = await response.json();

      if (data.length === 0) {
        console.log('No rooms found, generating initial rooms...');
        const generatedRooms = [];
        const blocks = ['Block 1', 'Block 2', 'Block 3'];
        const roomCapacity = 4;

        blocks.forEach(blockName => {
          let blockRoomNumbers = [];
          if (blockName === 'Block 1') {
            // Generate Block 1 rooms (2 floors, 4 rooms per floor)
            for (let floor = 1; floor <= 2; floor++) {
              for (let room = 1; room <= 4; room++) {
                blockRoomNumbers.push(`${floor}${room < 10 ? '0' : ''}${room}`);
              }
            }
          } else if (blockName === 'Block 2') {
            blockRoomNumbers = ['101', '102', '103', '201', '202', '203'];
          } else if (blockName === 'Block 3') {
            blockRoomNumbers = ['101', '102', '103'];
          }

          blockRoomNumbers.forEach(roomNum => {
            generatedRooms.push({
              roomNumber: roomNum,
              hostel: blockName,
              capacity: roomCapacity,
              currentOccupancy: 0,
              status: 'Available'
            });
          });
        });
        
        // Send generated rooms to the backend
        for (const room of generatedRooms) {
          try {
            const postResponse = await fetch('http://localhost:5000/api/room', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(room)
            });

            if (!postResponse.ok) {
              const errorData = await postResponse.json();
              if (postResponse.status === 409) {
                console.warn(`Room ${room.roomNumber} in ${room.hostel} already exists: ${errorData.message}`);
              } else {
                throw new Error(`HTTP error! status: ${postResponse.status}, message: ${errorData.message || 'Unknown error'}`);
              }
            }
          } catch (postError) {
            console.error(`Error posting room ${room.roomNumber} for ${room.hostel}:`, postError);
          }
        }

        // Refetch all rooms after generation
        const updatedResponse = await fetch('http://localhost:5000/api/room');
        if (!updatedResponse.ok) {
          throw new Error(`HTTP error! status: ${updatedResponse.status}`);
        }
        data = await updatedResponse.json();
      }

      setRooms(data);
    } catch (error) {
      console.error('Error fetching or generating rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomRequests(); // Fetch room requests when component mounts
  }, []);

  const fetchRoomRequests = async (statusFilter = 'pending') => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await axios.get('http://localhost:5000/api/admin/room-requests', { params });
      setRoomRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch room change requests:", err);
      setRequestsError("Failed to load room change requests. Please try again later.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestAction = async (requestId, actionType) => {
    if (!window.confirm(`Are you sure you want to ${actionType} this request?`)) {
      return;
    }
    try {
      setRequestsLoading(true);
      let url = `http://localhost:5000/api/admin/room-requests/${requestId}/${actionType}`;
      let res;
      if (actionType === 'reject') {
        const adminNotes = prompt("Optional: Enter reason for rejection:");
        res = await axios.patch(url, { adminNotes });
      } else {
        res = await axios.patch(url);
      }

      if (res.status === 200) {
        alert(`Request ${actionType}ed successfully!`);
        fetchRoomRequests(); // Re-fetch requests to update the list
        fetchRooms(); // Also refresh rooms as occupancy might change
      } else {
        throw new Error(res.data.message || `Failed to ${actionType} request`);
      }
    } catch (err) {
      console.error(`Error ${actionType}ing request:`, err);
      alert(`Error ${actionType}ing request: ` + (err.response?.data?.message || 'Server error'));
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.hostel || !newRoom.capacity) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomNumber: newRoom.roomNumber,
          hostel: newRoom.hostel,
          capacity: parseInt(newRoom.capacity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchRooms(); // Refresh the room list
        setNewRoom({
          roomNumber: '',
          hostel: '',
          capacity: '',
          currentOccupancy: '',
          status: 'Available'
        });
      } else {
        alert(`Error adding room: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Error adding room. Please try again.');
    }
  };

  const handleEditRoom = (room) => {
    setIsEditing(room._id);
    setNewRoom(room);
  };

  const handleUpdateRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.hostel || !newRoom.capacity) {
      alert('Please fill all required fields');
      return;
    }
    if (!isEditing) return;

    try {
      const response = await fetch(`http://localhost:5000/api/room/${isEditing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomNumber: newRoom.roomNumber,
          hostel: newRoom.hostel,
          capacity: parseInt(newRoom.capacity),
          currentOccupancy: parseInt(newRoom.currentOccupancy),
          status: newRoom.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchRooms(); // Refresh the room list
        setIsEditing(null);
        setNewRoom({
          roomNumber: '',
          hostel: '',
          capacity: '',
          currentOccupancy: '',
          status: 'Available'
        });
      } else {
        alert(`Error updating room: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Error updating room. Please try again.');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/room/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          fetchRooms(); // Refresh the room list
        } else {
          alert(`Error deleting room: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Error deleting room. Please try again.');
      }
    }
  };

  const filteredRooms = rooms.filter(room =>
    (room.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.hostel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-rooms-container">
      <div className="header-section">
        <h2>Manage Rooms</h2>
        <p>Allocate and manage hostel rooms.</p>
      </div>

      {/* Room Change Requests Section */}
      <div className="room-requests-section">
        <h3>Student Room Change Requests</h3>
        <div className="filter-buttons">
          <button 
            className="filter-btn active"
            onClick={() => fetchRoomRequests('pending')}
          >
            Pending
          </button>
          <button 
            className="filter-btn"
            onClick={() => fetchRoomRequests('approved')}
          >
            Approved
          </button>
          <button 
            className="filter-btn"
            onClick={() => fetchRoomRequests('rejected')}
          >
            Rejected
          </button>
          <button 
            className="filter-btn"
            onClick={() => fetchRoomRequests('')}
          >
            All
          </button>
        </div>

        {requestsLoading ? (
          <div className="requests-loading-state">
            <div className="spinner"></div>
            <p>Loading room change requests...</p>
          </div>
        ) : requestsError ? (
          <div className="requests-error-state">
            <div className="error-icon">!</div>
            <p>{requestsError}</p>
            <button className="retry-btn" onClick={() => fetchRoomRequests()}>Retry</button>
          </div>
        ) : (
          <div className="room-requests-table-container">
            <table className="room-requests-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No.</th>
                  <th>Old Room</th>
                  <th>New Room</th>
                  <th>Status</th>
                  <th>Requested On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomRequests.length > 0 ? (
                  roomRequests.map(request => (
                    <tr key={request._id}>
                      <td>{request.studentId?.name || 'N/A'}</td>
                      <td>{request.studentId?.rollNumber || 'N/A'}</td>
                      <td>{request.oldHostel && request.oldRoomNumber ? `${request.oldHostel} - ${request.oldRoomNumber}` : 'N/A'}</td>
                      <td>{`${request.newHostel} - ${request.newRoomNumber}`}</td>
                      <td>
                        <span className={`status-badge ${request.status}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              className="approve-btn"
                              onClick={() => handleRequestAction(request._id, 'approve')}
                            >
                              Approve
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleRequestAction(request._id, 'reject')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No room change requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="search-add-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <button 
          className="add-btn"
          onClick={() => setIsEditing(null)}
        >
          + Add New Room
        </button>
      </div>

      {(isEditing === null || isEditing) && (
        <div className="room-form">
          <h3>{isEditing ? 'Edit Room' : 'Add New Room'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Room Number*</label>
              <input
                type="text"
                name="roomNumber"
                value={newRoom.roomNumber}
                onChange={handleInputChange}
                placeholder="Enter room number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hostel">Block*</label>
              <input
                type="text"
                id="hostel"
                name="hostel"
                value={newRoom.hostel}
                onChange={handleInputChange}
                placeholder="Enter block name"
                required
              />
            </div>
            <div className="form-group">
              <label>Capacity*</label>
              <input
                type="number"
                name="capacity"
                value={newRoom.capacity}
                onChange={handleInputChange}
                placeholder="Enter capacity"
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Current Occupancy</label>
              <input
                type="number"
                name="currentOccupancy"
                value={newRoom.currentOccupancy}
                onChange={handleInputChange}
                placeholder="Enter current occupancy"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={newRoom.status}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="submit-btn"
              onClick={isEditing ? handleUpdateRoom : handleAddRoom}
            >
              {isEditing ? 'Update Room' : 'Add Room'}
            </button>
            {isEditing && (
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(null);
                  setNewRoom({
                    roomNumber: '',
                    hostel: '',
                    capacity: '',
                    currentOccupancy: '',
                    status: 'Available'
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rooms-table-container">
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Block</th>
              <th>Capacity</th>
              <th>Occupancy</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <tr key={room._id}>
                  <td>{room.roomNumber}</td>
                  <td>Block: {room.hostel}</td>
                  <td>{room.capacity}</td>
                  <td>{room.currentOccupancy}/{room.capacity}</td>
                  <td>
                    <span className={`status-badge ${room.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditRoom(room)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteRoom(room._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No rooms found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRooms;