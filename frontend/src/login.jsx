import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Link,
} from "@mui/material";
import SignInLayout from "./components/layouts/SignInLayout";
import ForgotPassword from "./components/forgotpassword"; 

function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
  event.preventDefault();
  try {
    const response = await axios.post("http://localhost:8000/login", {
      email,
      username,
      password,
    });
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("username", response.data.username);  // <-- store username here

    if (response.data.role === "admin") navigate("/admin");
    else if (response.data.role === "user") navigate("/home");
    else alert("Unknown role");
  } catch (error) {
    console.error("Login error:", error);
    alert("Invalid credentials");
    }
  };

  return (
    <SignInLayout>
      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
        >
          Sign In
        </Button>
        <Link
          onClick={() => setOpenForgotPassword(true)}
          sx={{ mt: 2, display: "block", cursor: "pointer", textAlign: "center" }}
        >
          Forgot Password?
        </Link>
        <Link
          onClick={() => navigate("/landing")}
          sx={{ mt: 1, display: "block", cursor: "pointer", textAlign: "center", color: "primary.main" }}
          >
          Back to Landing Page
        </Link>
      </form>

      {/* Forgot Password Dialog */}
      <ForgotPassword
        open={openForgotPassword}
        handleClose={() => setOpenForgotPassword(false)}
      />
    </SignInLayout>
  );
}

export default Login;

