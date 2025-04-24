import { useState } from "react";
import {
  TextField, Button, Typography, Container, Paper, CssBaseline
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8000/forgot-password", { email, username });
      alert("Password reset link sent!");
      navigate("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      alert("Error sending reset link.");
    }
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 5, mt: 8, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your email and username to receive reset instructions.
          </Typography>
          <form onSubmit={handleResetPassword}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
              Send Reset Link
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default ForgotPassword;
