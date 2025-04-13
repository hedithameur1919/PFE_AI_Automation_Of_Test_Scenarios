import { useState } from "react"; 
import { TextField, Button, Typography, Box, Container } from "@mui/material"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      // Make the POST request to reset the password
        await axios.post("http://localhost:8000/forgot-password", { email });
        alert("Password reset link sent to your email!");
      navigate("/login"); // Redirect back to login page after successful reset request
    } catch (error) {
        console.error("Password reset error:", error);
        alert("Error sending password reset email!");
    }
    };

return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h5" gutterBottom>Forgot Password</Typography>
        <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
        <TextField
            label="Enter your email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
            Send Reset Link
        </Button>
        </form>
    </Box>
    </Container>
);
}

export default ForgotPassword;
