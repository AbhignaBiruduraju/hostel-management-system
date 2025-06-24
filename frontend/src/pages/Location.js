import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Location.css';

const Location = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
  };

  
  const center = {
    lat: 18.007202, 
    lng: 79.558296  
  };

  return (
    <div className="location-container">
      <h2>Our Campus Location</h2>
      <p>Find us and explore important locations around the campus</p>
      
      <div className="map-container">
        <LoadScript 
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} // Replace this!
          loadingElement={<div>Loading...</div>}
          errorElement={<div className="map-error">Error loading map. Please try again later.</div>}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={center}
            options={{
              streetViewControl: false,
              mapTypeControl: false
            }}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="location-info">
        <div className="info-card">
          <h3>KITSW Hostel Address</h3>
          <p>Hanamkonda Main Road, Koukonda, Warangal, Telangana 506015, India</p>
        </div>
        <div className="info-card">
          <h3>Contact Information</h3>
          <p>Phone: +91 80 1234 5678</p>
          <p>Email: hostel@university.edu</p>
        </div>
      </div>
    </div>
  );
};

export default Location;