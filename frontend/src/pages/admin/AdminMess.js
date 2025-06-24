import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminMess.css"; 

const AdminMess = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [snacks, setSnacks] = useState("");
  const [dinner, setDinner] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const fetchMenuForDate = async () => {
      setIsLoading(true);
      setMessage(null);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/mess/date/${selectedDate}`);
        const menu = res.data;
        setBreakfast(menu.breakfast || '');
        setLunch(menu.lunch || '');
        setSnacks(menu.snacks || '');
        setDinner(menu.dinner || '');
      } catch (err) {
        console.error("Error fetching menu for date:", err);
        
        if (err.response && err.response.status === 404) {
          setBreakfast('');
          setLunch('');
          setSnacks('');
          setDinner('');
          setMessage("No menu found for this date. You can add a new one.");
        } else {
          setError("Failed to fetch menu. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuForDate();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/api/mess", {
        date: selectedDate,
        breakfast,
        lunch,
        snacks,
        dinner,
      });

      if (res.status === 200) {
        setMessage("Mess menu updated successfully!");
      } else {
        throw new Error(res.data.message || "Failed to update mess menu.");
      }
    } catch (err) {
      console.error("Error submitting mess menu:", err);
      setError("Failed to update mess menu. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-mess-container">
      <h1>Manage Mess Menu</h1>
      <p>Set daily menu for breakfast, lunch, snacks, and dinner.</p>

      <form onSubmit={handleSubmit} className="mess-form">
        <div className="form-group">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="breakfast">Breakfast Items (comma-separated):</label>
          <textarea
            id="breakfast"
            value={breakfast}
            onChange={(e) => setBreakfast(e.target.value)}
            rows="2"
            placeholder="e.g., Idli, Sambar, Chutney, Tea, Coffee"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="lunch">Lunch Items (comma-separated):</label>
          <textarea
            id="lunch"
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
            rows="2"
            placeholder="e.g., Rice, Dal, Veg Curry, Salad, Curd"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="snacks">Snacks Items (comma-separated):</label>
          <textarea
            id="snacks"
            value={snacks}
            onChange={(e) => setSnacks(e.target.value)}
            rows="2"
            placeholder="e.g., Samosa, Tea, Coffee, Biscuits"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="dinner">Dinner Items (comma-separated):</label>
          <textarea
            id="dinner"
            value={dinner}
            onChange={(e) => setDinner(e.target.value)}
            rows="2"
            placeholder="e.g., Chapati, Paneer, Dal, Rice, Dessert"
          ></textarea>
        </div>

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Saving..." : "Save Mess Menu"}
        </button>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default AdminMess; 