import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Payment.css";

const Payment = () => {
  const studentId = localStorage.getItem("studentId");
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(""); // 'pending', 'completed', 'failed', or empty for all
  const [activeTab, setActiveTab] = useState('hostel'); // 'hostel' or 'service'

  const fetchPayments = useCallback(async () => {
    console.log('Fetching payments...');
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        status: filterStatus,
      };

      const res = await axios.get(`http://localhost:5000/api/payment/${studentId}`, { params });
      console.log('Fetched payments data:', res.data);
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError("Failed to load payment data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [studentId, filterStatus]);

  useEffect(() => {
    if (!studentId) {
      setError("No student ID found. Please login again.");
      setIsLoading(false);
      return;
    }

    fetchPayments();
  }, [studentId, fetchPayments]);

  const handlePayNow = async (paymentId) => {
    console.log('Attempting to process payment for ID:', paymentId);
    try {
      setIsLoading(true);
      const response = await axios.patch(`http://localhost:5000/api/payment/${paymentId}/complete`);
      console.log('Patch response status:', response.status);
      if (response.status === 200) {
        console.log('Payment status updated to completed on backend.');
        alert('Payment completed successfully!');
        console.log('Re-fetching payments...');
        await fetchPayments();
        console.log('Payments re-fetched.');
      } else {
        const errorData = response.data;
        console.error('Backend update error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error processing payment in frontend:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  // Filter payments by type
  const hostelPayments = payments.filter(p => p.paymentType === 'hostel_fee');
  const servicePayments = payments.filter(p => p.paymentType !== 'hostel_fee');
  const pendingHostelPayments = hostelPayments.filter(pay => pay.status === 'pending');
  const pendingServicePayments = servicePayments.filter(pay => pay.status === 'pending');
  const hasPendingPayments = pendingHostelPayments.length > 0 || pendingServicePayments.length > 0;

  if (isLoading) return (
    <div className="payment-loading">
      <div className="spinner"></div>
      <p>Loading your payments...</p>
    </div>
  );

  if (error) return (
    <div className="payment-error">
      <div className="error-icon">!</div>
      <p>{error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="payment-container">
      <h2>My Payments</h2>

      {/* Pending Payments Notification Banner */}
      {hasPendingPayments && (
        <div className="pending-payments-banner">
          <span role="img" aria-label="warning" style={{fontSize: '1.5em', marginRight: '0.5em'}}>⚠️</span>
          You have pending payments! Please pay your dues as soon as possible.
        </div>
      )}

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

      <div className="payment-filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Hostel Fees Tab */}
      {activeTab === 'hostel' && (
        <>
          {pendingHostelPayments.length > 0 && (
            <div className="pending-payments-section">
              <h3>Amount to be Paid (Hostel Fees)</h3>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingHostelPayments.map(pay => (
                    <tr key={pay._id}>
                      <td>{getMonthName(pay.billingMonth)}</td>
                      <td>{pay.billingYear}</td>
                      <td>₹{pay.amount}</td>
                      <td>
                        <button className="pay-now-btn hostel-pay-btn" onClick={() => handlePayNow(pay._id)}>
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="all-payments-section">
            <h3>Hostel Fee Payment History</h3>
            {hostelPayments.length === 0 ? (
              <p>No hostel fee payment history available based on current filters.</p>
            ) : (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hostelPayments.map(pay => (
                    <tr key={pay._id}>
                      <td>{getMonthName(pay.billingMonth)}</td>
                      <td>{pay.billingYear}</td>
                      <td>₹{pay.amount}</td>
                      <td>{pay.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Service Fees Tab */}
      {activeTab === 'service' && (
        <>
          {/* Pending Service Payments */}
          {servicePayments.filter(pay => pay.status === 'pending').length > 0 && (
            <div className="pending-payments-section">
              <h3>Amount to be Paid (Service Fees)</h3>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {servicePayments.filter(pay => pay.status === 'pending').map(pay => (
                    <tr key={pay._id}>
                      <td>{pay.serviceId?.name || pay.paymentType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Service'}</td>
                      <td>₹{pay.amount}</td>
                      <td>
                        <button className="pay-now-btn service-pay-btn" onClick={() => handlePayNow(pay._id)}>
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Service Fee Payment History */}
          <div className="all-payments-section">
            <h3>Service Fee Payment History</h3>
            {servicePayments.length === 0 ? (
              <p>No service fee payment history available based on current filters.</p>
            ) : (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {servicePayments.map(pay => (
                    <tr key={pay._id}>
                      <td>{pay.serviceId?.name || pay.paymentType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Service'}</td>
                      <td>₹{pay.amount}</td>
                      <td>{pay.status}</td>
                      <td>{new Date(pay.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Payment;
