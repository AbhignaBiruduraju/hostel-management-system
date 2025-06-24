import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const images = [
  "/illustration.jpg",
  "/hostel 2 .jpg",
  "/hostel 3.jpg",
];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to Campus Connect</h1>
            <p className="hero-subtitle">Experience seamless campus living with our integrated services</p>
            <button 
              className="cta-button" 
              onClick={() => navigate('/login')}
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="hero-image">
            <img 
              src={images[currentImageIndex]} 
              alt="Students enjoying campus life" 
              className="hero-img" 
            />
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default HomePage;