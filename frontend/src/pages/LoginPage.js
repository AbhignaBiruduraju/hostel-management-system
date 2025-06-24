import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setError("");
    setPhone("");
    setRollNumber("");
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
    setError("");
    setIsRegistering(false);
  };

  const handleRegisterClick = () => {
    setIsRegistering(true);
    setError("");
    setUsername("");
    setPassword("");
    setFullName("");
    setRegEmail("");
    setRegPassword("");
    setPhone("");
    setRollNumber("");
  };

  const handleSignInClick = () => {
    setIsRegistering(false);
    setError("");
    setUsername("");
    setPassword("");
    setFullName("");
    setRegEmail("");
    setRegPassword("");
    setPhone("");
    setRollNumber("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: selectedRole }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userData", JSON.stringify(data.user));
        if (data.user.role === "student") {
          localStorage.setItem("studentId", data.user.id);
        }
        navigate(`/dashboard/${selectedRole}`);
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!fullName.trim() || !regEmail.trim() || !regPassword.trim() || !phone.trim() || !rollNumber.trim()) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: regEmail,
          password: regPassword,
          phone,
          rollNumber
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setIsRegistering(false);
        setUsername(regEmail);
        setPassword("");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="login-page"
      style={{
        backgroundImage: `url('/illustration.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="login-container">
        <header className="login-header">
          <h1>Welcome Back!</h1>
        </header>

        {!selectedRole ? (
          <div className="role-selection">
            <button className="role-btn student" onClick={() => handleRoleSelection("student")}>
              <div className="role-icon">🎓</div>
              <span>Student</span>
            </button>
            <button className="role-btn admin" onClick={() => handleRoleSelection("admin")}>
              <div className="role-icon">👨‍💼</div>
              <span>Admin</span>
            </button>
          </div>
        ) : (
          <>
            {isRegistering ? (
              <form className="login-form" onSubmit={handleRegister}>
                <h2>Register New Account</h2>

                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email (Username)</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rollNumber">Roll Number</label>
                  <input
                    id="rollNumber"
                    type="text"
                    placeholder="Enter your roll number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? <span className="spinner"></span> : "Register"}
                  </button>
                </div>
                <p className="link-text">
                  Already have an account?{" "}
                  <span className="link" onClick={handleSignInClick}>Sign In</span>
                </p>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleLogin}>
                <h2>{selectedRole === "student" ? "Student Portal" : "Admin Dashboard"}</h2>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? <span className="spinner"></span> : "Login"}
                  </button>
                </div>
                <p className="link-text">
                  Don't have an account?{" "}
                  <span className="link" onClick={handleRegisterClick}>Register here</span>
                </p>

                {selectedRole && (
                  <p className="link-text">
                    <span className="link" onClick={handleBack}>Back to Role Selection</span>
                  </p>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
