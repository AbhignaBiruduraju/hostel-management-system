import { useState, useEffect } from "react";
import axios from "axios";
import "./Mess.css";

const mealIcons = {
  breakfast: '🍳',
  lunch: '🍛',
  snacks: '🥪',
  dinner: '🍽️',
};

const MessSection = () => {
  const [todayMenu, setTodayMenu] = useState(null); // State to store today's menu
  const [isLoadingMenu, setIsLoadingMenu] = useState(true); // Loading state for menu
  const [menuError, setMenuError] = useState(null); // Error state for menu

  // Function to fetch today's menu
  const fetchTodayMenu = async () => {
    try {
      setIsLoadingMenu(true);
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const res = await axios.get(`http://localhost:5000/api/mess/date/${formattedToday}`);
      setTodayMenu(res.data);
      setMenuError(null);
    } catch (err) {
      console.error("Failed to fetch today's menu:", err);
      setMenuError("Failed to load today's menu. Please try again later.");
      setTodayMenu(null); // Clear menu on error
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const handleSuggestDish = () => {
    alert('Thank you for your suggestion! (Feature coming soon)');
  };

  useEffect(() => {
    fetchTodayMenu();
  }, []); // Fetch menu on component mount

  return (
    <div className="mess-container center-content">
      {/* Header Section */}
      <div className="mess-header">
        <h1>Mess Services</h1>
      </div>
      <div className="mess-content">
        <div>
          <div className="section-header">
            <h2>Today's Menu</h2>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {isLoadingMenu ? (
            <div className="menu-loading">
              <span className="spinner"></span>
              <p>Loading menu...</p>
            </div>
          ) : menuError ? (
            <div className="menu-error">
              <div className="error-icon">!</div>
              <p>{menuError}</p>
              <button className="retry-btn" onClick={fetchTodayMenu}>Retry</button>
            </div>
          ) : todayMenu ? (
            <div className="meals-grid">
              {todayMenu.breakfast && (
                <div className="meal-card">
                  <div className="meal-header">
                    <span className="meal-icon">{mealIcons.breakfast}</span>
                    <h3>Breakfast</h3>
                    <span className="meal-time">7:30 AM - 9:30 AM</span>
                  </div>
                  <div className="meal-items">
                    {todayMenu.breakfast.split(', ').map((item, index) => (
                      <span key={index} className="meal-item chip">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {todayMenu.lunch && (
                <div className="meal-card">
                  <div className="meal-header">
                    <span className="meal-icon">{mealIcons.lunch}</span>
                    <h3>Lunch</h3>
                    <span className="meal-time">12:30 PM - 2:30 PM</span>
                  </div>
                  <div className="meal-items">
                    {todayMenu.lunch.split(', ').map((item, index) => (
                      <span key={index} className="meal-item chip">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {todayMenu.snacks && (
                <div className="meal-card">
                  <div className="meal-header">
                    <span className="meal-icon">{mealIcons.snacks}</span>
                    <h3>Snacks</h3>
                    <span className="meal-time">4:30 PM - 6:00 PM</span>
                  </div>
                  <div className="meal-items">
                    {todayMenu.snacks.split(', ').map((item, index) => (
                      <span key={index} className="meal-item chip">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {todayMenu.dinner && (
                <div className="meal-card">
                  <div className="meal-header">
                    <span className="meal-icon">{mealIcons.dinner}</span>
                    <h3>Dinner</h3>
                    <span className="meal-time">8:00 PM - 10:00 PM</span>
                  </div>
                  <div className="meal-items">
                    {todayMenu.dinner.split(', ').map((item, index) => (
                      <span key={index} className="meal-item chip">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No menu available for today. Please check back later.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessSection;