import { useState } from "react";
import StudentServices from "./Services";
import Mess from "./Mess"; 
import Profile from "./Profile"; 
import Logout from "./Logout"; 
import Payment from "./Payment"; 
import Complaints from "./Complaints"; 
import Rooms from "./Rooms";

import "./StudentDashboard.css"; 

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="dashboard-container">
      {/* Sidebar (Stays Fixed) */}
      <div className="sidebar">
        <h2>Student Dashboard</h2>
        <ul>
          <li onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? "active" : ""}>Profile</li>
          <li onClick={() => setActiveTab("payments")} className={activeTab === "payments" ? "active" : ""}>Payments</li>
          <li onClick={() => setActiveTab("services")} className={activeTab === "services" ? "active" : ""}>Services</li>
          <li onClick={() => setActiveTab("mess")} className={activeTab === "mess" ? "active" : ""}>Mess</li>
          <li onClick={() => setActiveTab("Complaints")} className={activeTab === "complaints" ? "active" : ""}>Complaints</li>
          <li onClick={() => setActiveTab("rooms")} className={activeTab === "rooms" ? "active" : ""}>Rooms</li>
          <li onClick={() => setActiveTab("logout")} className={activeTab === "logout" ? "active" : ""}>Logout</li>
        </ul>
      </div>
 {/* Content Section */}
 <div className="content">
        {activeTab === "profile" && <Profile />}
        {activeTab === "payments" && <Payment />}
        {activeTab === "services" && <StudentServices />}
        {activeTab === "mess" && <Mess />}
        {activeTab === "Complaints" && <Complaints />}
        {activeTab === "rooms" && <Rooms />}
        {activeTab === "logout" && <Logout />}
      </div>
    </div>
  );
};

export default StudentDashboard;

