import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Box, Container } from "@mui/material"; // Import MUI components

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    try {
      await axios.post("http://localhost:8000/register", {
        username,
        password,
      });
      alert("User registered successfully");
      navigate("/login");
    } catch (error) {
      console.error("Sigup error:", error); // Now 'error' is used
      alert("Error registering user");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h5" gutterBottom>Sign Up</Typography>
        <form onSubmit={handleSignUp} style={{ width: "100%" }}>
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
            Sign Up
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default SignUp;
