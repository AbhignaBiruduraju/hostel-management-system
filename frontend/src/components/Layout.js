import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar"; 
import "./Layout.css"; 

const Layout = () => {
  const location = useLocation(); // Get current page URL
  const isDashboardPage = location.pathname.startsWith("/dashboard");

  return (
    <div className="layout">
      {!isDashboardPage && <Navbar />}
      <div className={`main-content ${isDashboardPage ? "dashboard-layout" : ""}`}>
        {isDashboardPage && <Sidebar />}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;