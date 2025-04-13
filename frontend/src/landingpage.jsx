import { Button, Box, Typography, Container, AppBar, Toolbar, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSignIn = () => navigate("/login");
  const handleSignUp = () => navigate("/signup");

  return (
    <>
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Squash
          </Typography>
          <Box>
            <Button color="primary" onClick={handleSignIn}>Sign In</Button>
            <Button variant="contained" sx={{ ml: 2 }} onClick={handleSignUp}>Sign Up</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(120deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          textAlign: "center",
          padding: 5,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.contrastText }}>
            Welcome to AI Automation in Squash
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText, mt: 2 }}>
            Boost your productivity with AI-generated Gherkin scenarios. Smart. Fast. Reliable.
          </Typography>
          <Box sx={{ marginTop: 4 }}>
            <Button variant="contained" size="large" sx={{ marginRight: 2 }} onClick={handleSignIn}>
              Get Started
            </Button>
            <Button variant="outlined" size="large" onClick={handleSignUp}>
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, textAlign: "center", bgcolor: "background.paper" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} AI Squash. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}

export default LandingPage;
