import { useNavigate } from "react-router-dom";

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goToLogin = () => navigate("/login");
  const goToStudentDashboard = () => navigate("/dashboard/student");
  const goToAdminDashboard = () => navigate("/dashboard/admin");

  return { goToLogin, goToStudentDashboard, goToAdminDashboard };
};
