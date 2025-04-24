import { useState, useEffect } from "react";
import {
  TextField, Button, Typography, Container, Paper, CssBaseline
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8000/reset-password", {
        token, new_password: newPassword, confirm_password: confirmPassword,
      });

      alert("Password reset successful!");
      navigate("/login");
    } catch (error) {
      console.error("Reset error:", error);
      setErrorMessage("Error resetting password.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/landing");
  }, [token, navigate]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 5, mt: 8, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Reset Password
          </Typography>
          <form onSubmit={handleResetPassword}>
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errorMessage && (
              <Typography color="error" mt={1}>
                {errorMessage}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default ResetPassword;
