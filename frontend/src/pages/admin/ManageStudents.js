import React, { useState, useEffect, useCallback } from 'react';
import './ManageStudents.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNumber: '',
    email: '',
    roomNumber: '',
    hostel: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('approved');

  const fetchStudents = useCallback(async () => {
    try {
      let url = 'http://localhost:5000/api/student';
      if (filterStatus !== 'all') {
        url = `http://localhost:5000/api/student?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchStudents();
  }, [filterStatus, fetchStudents]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.rollNumber || !newStudent.email || !newStudent.phone) {
      alert('Please fill all required fields: Full Name, Roll Number, Email, Phone');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudent.name,
          username: newStudent.email,
          phone: newStudent.phone,
          rollNumber: newStudent.rollNumber,
          hostel: newStudent.hostel,
          roomNumber: newStudent.roomNumber,
          status: 'approved'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchStudents();
        setNewStudent({
          name: '',
          rollNumber: '',
          email: '',
          roomNumber: '',
          hostel: '',
          phone: ''
        });
      } else {
        alert(`Error adding student: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student. Please try again.');
    }
  };

  const handleApproveReject = async (studentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchStudents();
      } else {
        alert(`Error updating student status: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Error updating student status. Please try again.');
    }
  };

  const handleEditStudent = (student) => {
    setIsEditing(student._id);
    setNewStudent(student);
  };

  const handleUpdateStudent = async () => {
    if (!newStudent.name || !newStudent.rollNumber || !newStudent.email || !newStudent.phone) {
      alert('Please fill all required fields: Full Name, Roll Number, Email, Phone');
      return;
    }
    if (!isEditing) return;

    try {
      const response = await fetch(`http://localhost:5000/api/student/${isEditing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudent.name,
          username: newStudent.email,
          phone: newStudent.phone,
          rollNumber: newStudent.rollNumber,
          hostel: newStudent.hostel,
          roomNumber: newStudent.roomNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchStudents();
        setIsEditing(null);
        setNewStudent({
          name: '',
          rollNumber: '',
          email: '',
          roomNumber: '',
          hostel: '',
          phone: ''
        });
      } else {
        alert(`Error updating student: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student. Please try again.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/student/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          fetchStudents();
        } else {
          alert(`Error deleting student: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student. Please try again.');
      }
    }
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-students-container">
      <div className="header-section">
        <h2>Manage Students</h2>
        <p>View, add, or manage student accounts and registration requests.</p>
      </div>

      <div className="search-add-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="filter-dropdown">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button 
          className="add-btn"
          onClick={() => {
            setIsEditing(null);
            setNewStudent({
              name: '',
              rollNumber: '',
              email: '',
              roomNumber: '',
              hostel: '',
              phone: ''
            });
          }}
        >
          + Add New Student
        </button>
      </div>

      {(isEditing === null || isEditing) && (
        <div className="student-form">
          <h3>{isEditing ? 'Edit Student' : 'Add New Student'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name*</label>
              <input
                type="text"
                name="name"
                value={newStudent.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Roll Number*</label>
              <input
                type="text"
                name="rollNumber"
                value={newStudent.rollNumber}
                onChange={handleInputChange}
                placeholder="Enter roll number"
              />
            </div>
            <div className="form-group">
              <label>Email (Username)*</label>
              <input
                type="email"
                name="email"
                value={newStudent.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </div>
            <div className="form-group">
              <label>Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={newStudent.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Block</label>
              <input
                type="text"
                name="hostel"
                value={newStudent.hostel}
                onChange={handleInputChange}
                placeholder="Enter block"
              />
            </div>
            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={newStudent.roomNumber}
                onChange={handleInputChange}
                placeholder="Enter room number"
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="submit-btn"
              onClick={isEditing ? handleUpdateStudent : handleAddStudent}
            >
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(null);
                  setNewStudent({
                    name: '',
                    rollNumber: '',
                    email: '',
                    roomNumber: '',
                    hostel: '',
                    phone: ''
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Roll No.</th>
              <th>Email</th>
              <th>Block</th>
              <th>Room No.</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.username}</td>
                  <td>{student.hostel ? student.hostel.replace("Hostel", "Block") : 'N/A'}</td>
                  <td>{student.roomNumber}</td>
                  <td>{student.phone}</td>
                  <td>
                    <span className={`status-badge ${student.status}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {student.status === 'pending' ? (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleApproveReject(student._id, 'approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleApproveReject(student._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditStudent(student)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteStudent(student._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No students found based on current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudents;