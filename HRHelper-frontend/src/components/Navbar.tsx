import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("employeeId");
    localStorage.removeItem("role");
    navigate("/login");
    onLogout();
  };

  const role = localStorage.getItem("role");

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ gap: 4, justifyContent: 'space-between' }}>
        {/* Left side */}
        <Box display="flex" alignItems="center" gap={4}>
          <Typography variant="h6">HRHelper</Typography>
          <Button color="inherit" component={RouterLink} to={role === "HR" ? "/dashboard" : "/personal-panel"}>
            Dashboard
          </Button>
          {role === "HR" && (
            <>
              <Button color="inherit" component={RouterLink} to="/employees">
                Pracownicy
              </Button>
              <Button color="inherit" component={RouterLink} to="/leaves">
                Urlopy
              </Button>
              <Button color="inherit" component={RouterLink} to="/attendance">
                Obecność
              </Button>
            </>
          )}
        </Box>

        {/* Right side */}
        <Box>
          <Tooltip title="Wyloguj">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
