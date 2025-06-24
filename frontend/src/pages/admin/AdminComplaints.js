import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./AdminComplaints.css";

const AdminComplaints = () => {
  const [response, setResponse] = useState("");
  const [complaints, setComplaints] = useState([]); // Will store complaints fetched from backend
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // Stores the full complaint object
  const messagesEndRef = useRef(null);

  // Fetch complaints from backend
  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/complaint");
      setComplaints(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setError("Failed to load complaints. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedComplaint, response]); // Scroll when selected complaint or response changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendResponse = async () => {
    if (response.trim() === "") {
      alert("Please enter a valid response.");
      return;
    }
    if (!selectedComplaint) {
      alert("No complaint selected to respond to.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.patch(`http://localhost:5000/api/complaint/${selectedComplaint._id}/resolve`, {
        response: response,
      });

      if (res.status === 200) {
        setResponse("");
        // Update the complaints list with the resolved complaint
        const updatedComplaints = complaints.map(c =>
          c._id === res.data.complaint._id ? res.data.complaint : c
        );
        setComplaints(updatedComplaints);
        setSelectedComplaint(res.data.complaint); // Update selected complaint
        alert("Response sent and complaint resolved!");
      } else {
        throw new Error(res.data.message || "Failed to send response");
      }
    } catch (err) {
      console.error("Error sending response:", err);
      alert("Error sending response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendResponse();
    }
  };

  const updateComplaintStatus = async (complaintId, status) => {
    try {
      setIsLoading(true);
      const res = await axios.patch(`http://localhost:5000/api/complaint/${complaintId}/resolve`, {
        // If changing to pending, clear response
        response: status === 'pending' ? '' : selectedComplaint.response,
        status: status // Pass the new status
      });

      if (res.status === 200) {
        const updatedComplaints = complaints.map(c =>
          c._id === res.data.complaint._id ? res.data.complaint : c
        );
        setComplaints(updatedComplaints);
        setSelectedComplaint(res.data.complaint);
        alert(`Complaint status updated to ${status}!`);
      } else {
        throw new Error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating complaint status:", err);
      alert("Error updating complaint status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.response || ""); // Pre-fill response if it exists
  };

  if (isLoading) return (
    <div className="admin-complaints-loading">
      <div className="spinner"></div>
      <p>Loading complaints...</p>
    </div>
  );

  if (error) return (
    <div className="admin-complaints-error">
      <div className="error-icon">!</div>
      <p>{error}</p>
      <button className="retry-btn" onClick={fetchComplaints}>Retry</button>
    </div>
  );

  return (
    <div className="admin-complaints-container">
      <div className="admin-complaints-header">
        <h1>Admin Complaints Portal</h1>
        <p>Manage and respond to student complaints</p>
      </div>

      <div className="admin-complaints-layout">
        {/* Complaints List */}
        <div className="complaints-list">
          <h3>Recent Complaints</h3>
          <div className="complaints-filter">
            {/* These buttons will filter the displayed complaints based on status */}
            <button className="filter-btn" onClick={() => fetchComplaints()}>All</button>
            <button className="filter-btn" onClick={() => setComplaints(complaints.filter(c => c.status === 'pending'))}>Pending</button>
            <button className="filter-btn" onClick={() => setComplaints(complaints.filter(c => c.status === 'resolved'))}>Resolved</button>
          </div>
          <div className="complaints-items">
            {complaints.map((complaintItem) => (
              <div 
                key={complaintItem._id} 
                className={`complaint-item ${complaintItem.status} ${selectedComplaint?._id === complaintItem._id ? 'selected' : ''}`}
                onClick={() => handleComplaintClick(complaintItem)}
              >
                <div className="complaint-avatar">👨‍🎓</div> {/* Generic student avatar */}
                <div className="complaint-content">
                  <div className="complaint-header">
                    <span className="complaint-user">{complaintItem.studentName} ({complaintItem.roomNumber})</span>
                    <span className="complaint-time">{new Date(complaintItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`complaint-status ${complaintItem.status}`}>
                      {complaintItem.status}
                    </span>
                  </div>
                  <div className="complaint-preview">
                    {complaintItem.complaintText.length > 50 ? `${complaintItem.complaintText.substring(0, 50)}...` : complaintItem.complaintText}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Panel */}
        <div className="conversation-panel">
          {selectedComplaint ? (
            <>
              <div className="conversation-header">
                <h4>
                  Complaint from {selectedComplaint.studentName} ({selectedComplaint.roomNumber})
                  <span className={`status-badge ${selectedComplaint.status}`}>
                    {selectedComplaint.status}
                  </span>
                </h4>
                <div className="status-actions">
                  <button 
                    className={`status-btn ${selectedComplaint.status === 'pending' ? 'active' : ''}`}
                    onClick={() => updateComplaintStatus(selectedComplaint._id, 'pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className={`status-btn ${selectedComplaint.status === 'resolved' ? 'active' : ''}`}
                    onClick={() => updateComplaintStatus(selectedComplaint._id, 'resolved')}
                  >
                    Resolved
                  </button>
                </div>
              </div>
              
              <div className="messages-container">
                {/* Display original complaint */}
                <div className={`message received`}>
                  <div className="message-avatar">👨‍🎓</div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-user">{selectedComplaint.studentName}</span>
                      <span className="message-time">{new Date(selectedComplaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="message-bubble">
                      {selectedComplaint.complaintText}
                    </div>
                  </div>
                </div>

                {/* Display admin response if exists */}
                {selectedComplaint.response && (
                  <div className={`message sent`}>
                    <div className="message-avatar">👨‍💼</div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-user">@Admin</span>
                        {/* Assuming response has a timestamp, otherwise use complaint's updated time */}
                        <span className="message-time">{new Date(selectedComplaint.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="message-bubble">
                        {selectedComplaint.response}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="response-section">
                <div className="input-container">
                  <textarea
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="3"
                  />
                  <button 
                    onClick={handleSendResponse}
                    disabled={!response.trim() || isLoading}
                    className="send-button"
                  >
                    {isLoading ? (
                      <span className="spinner"></span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="no-complaint-selected">Select a complaint to view details and respond.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;