import React, { useState } from 'react';
import './Logout.css';

const LogoutPage = ({ onLogout, userName = "User" }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);
  
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate API call for logout
    setTimeout(() => {
      // Clear user data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('studentId');
      
      setIsLoggingOut(false);
      setShowConfirmation(false);
      setLogoutSuccess(true);
      
      // Call the parent component's logout handler
      if (onLogout) onLogout();
      
      // Redirect to login page after successful logout
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    }, 1500);
  };

  const handleCancel = () => {
    window.history.back();
  };
  
  return (
    <div className="logout-container">
      <div className={`logout-card ${logoutSuccess ? 'success-state' : ''}`}>
        {showConfirmation && (
          <div className="confirmation-view">
            <div className="logout-illustration">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="logout-title">Ready to leave, {userName}?</h2>
            <p className="logout-message">
              You'll need to sign in again to access your account. 
              Are you sure you want to log out?
            </p>
            <div className="button-group">
              <button 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="logout-button"
              >
                {isLoggingOut ? (
                  <>
                    <span className="button-spinner"></span>
                    Logging out...
                  </>
                ) : 'Log Out'}
              </button>
              <button 
                onClick={handleCancel}
                disabled={isLoggingOut}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {logoutSuccess && (
          <div className="success-view">
            <div className="success-animation">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 className="success-title">Logged Out Successfully</h2>
            <p className="success-message">
              You've been securely logged out of your account.
              <br />
              Redirecting to login page...
            </p>
            <div className="redirect-loader">
              <div className="loader-bar"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;