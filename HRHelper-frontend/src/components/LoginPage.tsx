import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { login } from "../services/authService";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await login(username, password)
      onLogin();
      window.location.href = localStorage.getItem("role") === "HR" ? "/dashboard" : "/personal-panel";
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <Box sx={{width: '25rem', mx: "auto", mt: '10rem'}}>
      <Paper elevation={3} sx={{ padding: 4, mt: 10 }}>
        <Typography variant="h5" gutterBottom align="center">
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{
              // input: { color: "black" },
              // label: { color: "black" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "black" },
                "&:hover fieldset": { borderColor: "black" },
                "&.Mui-focused fieldset": { borderColor: "black" },
              },
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{
              // input: { color: "black" },
              // label: { color: "black" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "black" },
                "&:hover fieldset": { borderColor: "black" },
                "&.Mui-focused fieldset": { borderColor: "black" },
              },
            }}
          />
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Log In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
