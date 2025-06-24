import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Payments.css';

function GenerateHostelFeeButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.post("http://localhost:5000/api/hostel-fee/generate", {
        // The amount is now determined by the backend based on room capacity
        // No need to send it from here.
      });
      setMsg(res.data.message);
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || "Failed to generate fees"));
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: "1.5em 0" }}>
      <button className="generate-fee-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Monthly Hostel Fees"}
      </button>
      {msg && <div style={{ marginTop: 10, color: msg.startsWith('Error') ? 'red' : 'green' }}>{msg}</div>}
    </div>
  );
}

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('hostel'); // 'hostel' or 'service'

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        status: filterStatus,
        studentId: searchTerm,
      };

      const res = await axios.get('http://localhost:5000/api/payment', { params });
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError("Failed to load payments. Please try again later.");
    }
    finally{
      setIsLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMarkAsPaid = async (payment) => {
    if (window.confirm('Mark this payment as completed?')) {
      try {
        setIsLoading(true);
        const res = await axios.patch(`http://localhost:5000/api/payment/${payment._id}/complete`);
        if (res.status === 200) {
          alert('Payment marked as completed successfully!');
          fetchPayments();
        } else {
          throw new Error(res.data.message || 'Failed to mark payment as completed');
        }
      } catch (err) {
        console.error("Error marking payment as paid:", err);
        alert("Error marking payment as paid. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'completed': { background: 'rgba(40, 167, 69, 0.2)', color: '#28a745' },
      'pending': { background: 'rgba(255, 193, 7, 0.2)', color: '#d39e00' },
    };
    
    return (
      <span className="status-badge" style={statusStyles[status] || {}}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter payments by type
  const hostelPayments = payments.filter(p => p.paymentType === 'hostel_fee');
  const servicePayments = payments.filter(p => p.paymentType !== 'hostel_fee');

  if (isLoading) return (
    <div className="payments-loading">
      <div className="spinner"></div>
      <p>Loading payments...</p>
    </div>
  );

  if (error) return (
    <div className="payments-error">
      <div className="error-icon">!</div>
      <p>{error}</p>
      <button className="retry-btn" onClick={fetchPayments}>Retry</button>
    </div>
  );

  return (
    <div className="payments-container">
      <div className="header-section">
        <h2>Payments Management</h2>
        <p>View and manage student payments and dues</p>
      </div>
      <GenerateHostelFeeButton />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1em', marginBottom: '1.5em' }}>
        <button
          className={activeTab === 'hostel' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveTab('hostel')}
        >
          Hostel Fees
        </button>
        <button
          className={activeTab === 'service' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveTab('service')}
        >
          Service Fees
        </button>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Student Name or Roll No."
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="filter-buttons">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="payments-table-container">
        {activeTab === 'hostel' ? (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No.</th>
                <th>Hostel</th>
                <th>Room No.</th>
                <th>Month</th>
                <th>Year</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostelPayments.length > 0 ? (
                hostelPayments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.studentId?.name || 'N/A'}</td>
                    <td>{payment.studentId?.rollNumber || 'N/A'}</td>
                    <td>{payment.studentId?.hostel || 'N/A'}</td>
                    <td>{payment.studentId?.roomNumber || 'N/A'}</td>
                    <td>{getMonthName(payment.billingMonth)}</td>
                    <td>{payment.billingYear}</td>
                    <td>₹{payment.amount?.toLocaleString() || 'N/A'}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      {payment.status === 'pending' && (
                        <button 
                          className="mark-paid-btn"
                          onClick={() => handleMarkAsPaid(payment)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    No hostel fee payments found based on current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No.</th>
                <th>Hostel</th>
                <th>Room No.</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicePayments.length > 0 ? (
                servicePayments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.studentId?.name || 'N/A'}</td>
                    <td>{payment.studentId?.rollNumber || 'N/A'}</td>
                    <td>{payment.studentId?.hostel || 'N/A'}</td>
                    <td>{payment.studentId?.roomNumber || 'N/A'}</td>
                    <td>{payment.serviceId?.name || payment.paymentType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Service'}</td>
                    <td>₹{payment.amount?.toLocaleString() || 'N/A'}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      {payment.status === 'pending' && (
                        <button 
                          className="mark-paid-btn"
                          onClick={() => handleMarkAsPaid(payment)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No service fee payments found based on current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Payments;