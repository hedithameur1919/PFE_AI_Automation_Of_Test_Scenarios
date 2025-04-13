import { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the token from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Send the reset password request with the token, new password, and confirm password
      await axios.post("http://localhost:8000/reset-password", {
        token, // JWT token
        new_password: newPassword, // New password
        confirm_password: confirmPassword, // Confirm new password
      });

      alert("Password reset successful!");
      navigate("/login"); // Redirect to login page after successful password reset
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("Error resetting password. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect to landing page if token is missing in the URL
    if (!token) {
      navigate("/landing");
    }
  }, [token, navigate]);

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h5" gutterBottom>Reset Password</Typography>
        <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
          <TextField
            label="New Password"
            variant="outlined"
            fullWidth
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
          {errorMessage && (
            <Typography color="error" sx={{ marginTop: 2 }}>
              {errorMessage}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default ResetPassword;
