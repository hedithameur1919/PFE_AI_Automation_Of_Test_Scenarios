import Box from '@mui/material/Box';
import logo from '../assets/OfficialLogo.png'; 

export default function SitemarkIcon() {
  return (
    <Box
      component="img"
      src={logo}
      alt="TestAutoMate Logo"
      sx={{
        height: 70, // You can adjust height here
        width: 'auto',
        mr: 2,
      }}
    />
  );
}