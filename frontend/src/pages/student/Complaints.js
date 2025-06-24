import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Complaints.css";

const Complaints = () => {
  const studentId = localStorage.getItem("studentId");
  const [complaint, setComplaint] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchComplaints = useCallback(async () => {
    if (!studentId) {
      setError("No student ID found. Please login again.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/complaint/student/${studentId}`
      );
      const formattedMessages = [];
      res.data.forEach(c => {
        // Student's complaint message
        formattedMessages.push({
          id: c._id + '-complaint', // Unique ID for complaint message
          user: c.studentName,
          text: c.complaintText,
          align: "right",
          time: new Date(c.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: c.status,
          avatar: "👤",
        });

        // Admin's response message (if exists)
        if (c.response) {
          formattedMessages.push({
            id: c._id + '-response', // Unique ID for response message
            user: "Admin",
            text: c.response,
            align: "left",
            time: new Date(c.updatedAt || c.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: c.status,
            avatar: "🛡️", // Admin avatar
          });
        }
      });
      setMessages(formattedMessages);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setError("Failed to load complaints. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchComplaints();
  }, [studentId, fetchComplaints]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (complaint.trim() === "") {
      alert("Please enter a valid complaint.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/complaint", {
        studentId,
        complaintText: complaint,
      });

      if (res.status === 201) {
        setComplaint("");
        fetchComplaints();
        alert("Complaint submitted successfully!");
      } else {
        throw new Error(res.data.message || "Failed to send complaint");
      }
    } catch (err) {
      console.error("Error sending complaint:", err);
      alert("Error sending complaint. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading)
    return (
      <div className="complaints-loading">
        <div className="spinner"></div>
        <p>Loading complaints...</p>
      </div>
    );

  if (error)
    return (
      <div className="complaints-error">
        <div className="error-icon">!</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchComplaints}>
          Retry
        </button>
      </div>
    );

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <h1>Complaints Portal</h1>
        <p>Report issues and communicate with administration</p>
      </div>

      <div className="complaints-box">
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`message ${msg.align === "right" ? "sent" : "received"}`}
            >
              <div className="message-avatar">{msg.avatar}</div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-user">{msg.user}</span>
                  <span className="message-time">{msg.time}</span>
                </div>
                <div className="message-bubble">
                  {msg.text}
                  <span className={`status-badge ${msg.status}`}>{msg.status}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-section">
          <div className="input-container">
            <textarea
              placeholder="Type your complaint here..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
            />
            <button
              onClick={handleSend}
              disabled={!complaint.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default Complaints;