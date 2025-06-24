import { useEffect, useState } from "react";
import "./Services.css";

const serviceTypes = [
  { name: "Electrical", icon: "⚡", color: "#FFD700" },
  { name: "Plumber", icon: "🚰", color: "#1E90FF" },
  { name: "Medical", icon: "🏥", color: "#FF6347" },
  { name: "Cleaning", icon: "🧹", color: "#32CD32" },
  { name: "Laundry", icon: "🧺", color: "#9370DB" },
  { name: "Maintenance", icon: "🔧", color: "#FFA500" },
  { name: "Internet", icon: "🌐", color: "#00BFFF" },
];

const ServiceRequest = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [studentId] = useState(() => localStorage.getItem("studentId"));
  const [studentName] = useState(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    return userData?.name || "";
  });
  const [roomNumber] = useState(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    return userData?.roomNumber || "";
  });
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (studentId) {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/service/student/id/${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Service history data fetched:", data);
          setRequests(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch service history:", err);
          setError("Failed to load service history");
        })
        .finally(() => setIsLoading(false));
    }
  }, [studentId, submitted]);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setSubmitted(false);
    setError(null);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please provide a description of your issue");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
          room_number: roomNumber,
          description,
          service_type: selectedService,
        }),
      });

      if (response.ok) {
        setDescription("");
        setSubmitted(true);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Backend error response:', response.status, errorData);
        throw new Error(errorData.message || "Request failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Error submitting request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: { background: "#FFD700", color: "#000" },
      Completed: { background: "#32CD32", color: "#fff" },
      Rejected: { background: "#FF6347", color: "#fff" },
      "In Progress": { background: "#1E90FF", color: "#fff" },
    };
    
    return (
      <span className="status-badge" style={statusStyles[status] || {}}>
        {status}
      </span>
    );
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Service Request Portal</h1>
        <p>Select a service type and describe your issue in detail</p>
      </div>

      <div className="services-content">
        <div className="service-selection">
          <h2>Available Services</h2>
          <div className="service-grid">
            {serviceTypes.map(({ name, icon, color }) => (
              <button
                key={name}
                className={`service-card ${selectedService === name ? "active" : ""}`}
                onClick={() => handleServiceClick(name)}
                style={{ "--service-color": color }}
              >
                <span className="service-icon">{icon}</span>
                <span className="service-name">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedService && (
          <div className="request-form-container">
            <div className="request-form">
              <div className="form-header">
                <h2>{selectedService} Service Request</h2>
                <p>Please provide details about your issue</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any special necessities?"
                    rows={5}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>

              {submitted && (
                <div className="success-message">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                  Your {selectedService} request has been submitted successfully!
                </div>
              )}
            </div>
          </div>
        )}

        <div className="request-history">
          <h2>My Service History</h2>
          <div className="date-filter">
            <label htmlFor="filterDate">Filter by Date:</label>
            <input
              type="date"
              id="filterDate"
              className="date-input-field"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          
          {isLoading && requests.length === 0 ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading your service history...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              {error} <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : requests.length > 0 ? (
            <div className="service-history-table-wrapper">
              <table className="service-history-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const serviceInfo = serviceTypes.find(s => s.name === request.service_type);
                    return (
                      <tr key={request._id}>
                        <td>
                          <span className="service-type-cell">
                            {serviceInfo?.icon && <span className="service-icon-small" style={{ color: serviceInfo.color }}>{serviceInfo.icon}</span>}
                            {request.service_type}
                          </span>
                        </td>
                        <td className="description-cell">{request.description}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{request.cost ? `₹${request.cost}` : 'N/A'}</td>
                        <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" fill="currentColor"/>
              </svg>
              <p>No service requests found for this date. Try selecting a different date or submit a new request above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequest;