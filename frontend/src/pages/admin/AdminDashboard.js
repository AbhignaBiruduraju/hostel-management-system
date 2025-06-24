import { useState } from "react";
import "./AdminDashboard.css";
import Logout from "./Logout";
import AdminOverview from "./AdminOverview";
import Payments from "./Payments"; 
import ManageStudents from "./ManageStudents";
import ManageRooms from "./ManageRooms";

import Complaints from "./AdminComplaints"; 
import AdminMess from "./AdminMess";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li onClick={() => setActiveTab("overview")} className={activeTab === "overview" ? "active" : ""}>Overview</li>
          <li onClick={() => setActiveTab("ManageStudents")} className={activeTab === "ManageStudents" ? "active" : ""}>Manage Students</li>
          <li onClick={() => setActiveTab("ManageRooms")} className={activeTab === "ManageRooms" ? "active" : ""}>Manage Rooms</li>
          <li onClick={() => setActiveTab("Payments")} className={activeTab === "Payments" ? "active" : ""}>Payments</li>
          <li onClick={() => setActiveTab("complaints")} className={activeTab === "complaints" ? "active" : ""}>Complaints</li>
          <li onClick={() => setActiveTab("mess")} className={activeTab === "mess" ? "active" : ""}>Manage Mess</li>
          <li onClick={() => setActiveTab("logout")} className={activeTab === "logout" ? "active" : ""}>Logout</li>
        </ul>
      </div>

      <div className="content">
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "ManageStudents" && <ManageStudents />}
        {activeTab === "ManageRooms" && <ManageRooms />}
        {activeTab === "Payments" && <Payments />}
        {activeTab === "complaints" && <Complaints />} 
        {activeTab === "mess" && <AdminMess />}
        {activeTab === "logout" && <Logout />}
      </div>
    </div>
  );
};

export default AdminDashboard;
