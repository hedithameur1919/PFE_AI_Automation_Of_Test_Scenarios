import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField, Button, Typography, Container, Paper, Link, CssBaseline
} from "@mui/material";

function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", {
        email, username, password,
      });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      if (response.data.role === "admin") navigate("/admin");
      else if (response.data.role === "user") navigate("/home");
      else alert("Unknown role");

    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials");
    }
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 5, mt: 8, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Sign In to AI Squash
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Access your AI-powered Gherkin generation platform.
          </Typography>
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
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
              Sign In
            </Button>
          </form>
          <Link onClick={handleForgotPassword} sx={{ mt: 3, display: "block", cursor: "pointer" }}>
            Forgot Password?
          </Link>
        </Paper>
      </Container>
    </>
  );
}

export default Login;
