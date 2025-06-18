import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Navbar = () => {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={{ gap: 4 }}>
          <Typography variant="h6">HRHelper</Typography>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/employees">
            Profiles
          </Button>
          <Button color="inherit" component={RouterLink} to="/costs">
            Costs
          </Button>
          <Button color="inherit" component={RouterLink} to="/payments">
            Payments
          </Button>
          <Button color="inherit" component={RouterLink} to="/leaves">
            Leaves
          </Button>
          <Button color="inherit" component={RouterLink} to="/attendance">
            Attendance
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Navbar;
