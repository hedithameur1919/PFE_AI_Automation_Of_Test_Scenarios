import { Box, Container, Typography, Stack, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/X';

export default function HomeFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        px: 2,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TestAutoMate — Built for smarter QA.
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton href="https://github.com/" target="_blank">
              <GitHubIcon />
            </IconButton>
            <IconButton href="https://linkedin.com/" target="_blank">
              <LinkedInIcon />
            </IconButton>
            <IconButton href="https://x.com/" target="_blank">
              <TwitterIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
