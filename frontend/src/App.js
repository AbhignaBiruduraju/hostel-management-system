import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Location from "./pages/Location";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Layout from "./components/Layout"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="dashboard/student" element={<StudentDashboard />} />
          <Route path="dashboard/admin" element={<AdminDashboard />} />
          <Route path="location" element={<Location />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
