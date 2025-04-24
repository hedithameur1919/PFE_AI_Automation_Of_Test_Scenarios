import {
  Button, Box, Typography, Container, AppBar, Toolbar, CssBaseline, useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSignIn = () => navigate("/login");

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>
            AI Squash
          </Typography>
          <Button color="primary" onClick={handleSignIn}>Sign In</Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "#fff",
          textAlign: "center",
          p: 5,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={800} gutterBottom>
            AI-Powered Scenario Automation
          </Typography>
          <Typography variant="h6" mb={4}>
            Accelerate test scenario creation with smart AI-driven Gherkin generators.
          </Typography>
          <Button variant="contained" size="large" sx={{ px: 4, py: 1.5 }} onClick={handleSignIn}>
            Get Started
          </Button>
        </Container>
      </Box>

      <Box sx={{ py: 3, textAlign: "center", bgcolor: "background.paper" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} AI Squash. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}

export default LandingPage;
