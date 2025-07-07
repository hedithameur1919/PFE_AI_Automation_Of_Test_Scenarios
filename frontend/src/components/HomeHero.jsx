import { Box, Typography, Container, Stack } from '@mui/material';

export default function HomeHero() {
  return (
    <Box
      sx={{
        width: '100%',
        py: 6,
        background: 'radial-gradient(circle at center, #e3f2fd, transparent 70%)',
      }}
    >
      <Container>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h3" color="primary" fontWeight="bold">
            Welcome to Your Test Automation Hub
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="md">
            Generate, manage, and export your Gherkin test scenarios with ease using the power of AI and Squash TM integration.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
