import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Box, Container } from "@mui/material"; // Import MUI components

function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,  // Send email
        username,  // Send username
        password,  // Send password
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/home"); // Navigate to the home page
    } catch (error) {
      console.error("Login error:", error); // Now 'error' is used
      alert("Invalid credentials");
    }
  };

  const handleForgotPassword = () => {
    // Navigate to the forgot password page
    navigate("/forgot-password");
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
            Login
          </Button>
        </form>
        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </Button>
      </Box>
    </Container>
  );
}

export default Login;
