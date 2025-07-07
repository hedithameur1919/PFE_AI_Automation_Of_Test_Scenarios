import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'AI-Powered Scenario Generation',
    description:
      'Instantly convert user requirements into accurate Gherkin test scenarios using advanced AI models.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Seamless Squash TM Integration',
    description:
      'Automatically sync test cases and steps with your Squash TM project, saving time and reducing manual effort.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Requirement Traceability',
    description:
      'Track requirements and link them directly with test scenarios and feedback to ensure full QA coverage.',
  },
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Customizable AI Behavior',
    description:
      'Tune AI settings to match your project’s tone, test depth, and preferred scenario structure.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Human-in-the-Loop Feedback',
    description:
      'Rate and refine generated scenarios to improve quality and relevance with every interaction.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Fast, Secure, and Scalable',
    description:
      'Built for speed and reliability, your data is secured while the app scales to enterprise-level needs.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Discover the key features that make TestAutoMate your go-to tool for intelligent QA:
            from AI-powered Gherkin scenario generation to full integration with Squash TM.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
