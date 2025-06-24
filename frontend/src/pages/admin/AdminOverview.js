import { useEffect, useState } from "react";
import "./AdminOverview.css";

const AdminOverview = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    fetch("http://localhost:5000/api/service")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("Error fetching service requests:", err));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id, studentEmail) => {
    try {
      console.log('Accepting request for ID:', id, 'with studentEmail:', studentEmail);
      
      if (!id || !studentEmail) {
        console.error('Missing required data:', { id, studentEmail });
        alert('Error: Missing required data');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/service/${id}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentEmail }),
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log('Request accepted successfully:', data);
        alert('Request accepted.');
        fetchRequests();
      } else {
        console.error('Error response:', data);
        alert(`Error accepting request: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Exception in handleAccept:', error);
      alert('Error accepting request. Please try again.');
    }
  };
  
  const handleCancel = async (id) => {
    const res = await fetch(`http://localhost:5000/api/service/${id}/cancel`, {
      method: 'PATCH'
    });

    if (res.ok) {
      alert('Request cancelled.');
      fetchRequests();
    } else {
      alert('Error cancelling request.');
    }
  };

  return (
    <div className="admin-overview-container">
      <h2>Service Requests</h2>
      {requests.length === 0 ? (
        <p>No service requests available</p>
      ) : (
        <table className="admin-requests-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Room</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.student_name}</td>
                <td>{req.room_number}</td>
                <td>{req.service_type}</td>
                <td>{req.description}</td>
                <td>{req.status}</td>
                <td>{req.cost ? `₹${req.cost}` : "-"}</td>
                <td>
                  {req.status === "Pending" ? (
                    <>
                      <button className="accept-btn" onClick={() => handleAccept(req._id, req.student_id)}>Accept</button>
                      <button className="cancel-btn" onClick={() => handleCancel(req._id)}>Cancel</button>
                    </>
                  ) : (
                    <span>{req.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOverview;
