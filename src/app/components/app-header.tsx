import { AppBar, Box, Link, Stack, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const AppHeader = () => {
  return (
    <AppBar
      component="header"
      position="static"
    >
      <Toolbar sx={{ my: 1 }}>
        <Typography variant="h1">Fellowpick</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" sx={{ gap: 2 }}>
          <Link
            component={RouterLink}
            sx={{
              color: 'white'
            }}
            to="/login"
          >
            Login
          </Link>
          <Link
            component={RouterLink}
            sx={{
              color: 'white'
            }}
            to="/register"
          >
            Register
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
