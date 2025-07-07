import {
  Box, CssBaseline, Typography, Stack, Card as MuiCard,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Sitemark from '../SitemarkIcon';

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  background:
    "radial-gradient(circle, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  alignItems: "center",
  justifyContent: "center",
}));

// eslint-disable-next-line react/prop-types
export default function SignInLayout({ children }) {
  return (
    <>
      <CssBaseline />
      <SignInContainer>
        <Card elevation={6}>
          <Box display="flex" justifyContent="center">
            <Sitemark />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">
            Welcome to TestAutoMate
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" mb={2}>
            AI-powered platform for Gherkin scenario automation.
          </Typography>
          <Box component="div">{children}</Box>
        </Card>
      </SignInContainer>
    </>
  );
}
