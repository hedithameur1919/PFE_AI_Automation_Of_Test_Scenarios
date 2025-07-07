//old code before template
/* import { useState } from "react";
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
 */

import { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  OutlinedInput,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/forgot-password", { email, username });
      alert("Password reset link sent!");
      handleClose(); // close modal
      navigate("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      alert("Error sending reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        "& .MuiPaper-root": {
          padding: 2,
          backgroundImage: "none",
          width: "100%",
          maxWidth: 500,
        },
      }}
    >
      <DialogTitle>Reset Password</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <DialogContentText>
          Enter your email and username. We’ll send you a reset link.
        </DialogContentText>

        <OutlinedInput
          autoFocus
          required
          id="username"
          name="username"
          placeholder="Username"
          type="text"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <OutlinedInput
          required
          id="email"
          name="email"
          placeholder="Email address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ForgotPassword;
