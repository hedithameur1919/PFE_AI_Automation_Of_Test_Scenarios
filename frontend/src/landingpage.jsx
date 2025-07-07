import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';

import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import FAQ from './components/FAQ';
export default function LandingPage() {
  const navigate = useNavigate();

  /* React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]); */

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AppAppBar
        action={{
          type: 'button',
          label: 'Sign In',
          onClick: () => navigate('/login'),
        }}
      />
      <Hero />

      <div>
        <Divider />
        <Highlights />
        <Divider />
        <FAQ />
        <Divider />
      </div>
    </AppTheme>
  );
}
