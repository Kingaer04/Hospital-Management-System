import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import { SettingsOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OtherHousesOutlinedIcon from '@mui/icons-material/OtherHousesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MainNavbar from './navbar';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useOpen } from '../components/openContext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SignOutModal from './SignOutModal.jsx';
import { useSelector } from 'react-redux'; // Import useSelector

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        },
      },
    ],
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#00A272',
  zIndex: 1,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function SideBar() {
  const theme = useTheme();
  const { open, setOpen, mainContentWidth } = useOpen();
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [signOutModalOpen, setSignOutModalOpen] = React.useState(false);

  const handleSignOutClick = () => {
    setSignOutModalOpen(true);
  };

  // Get the current user and admin from the Redux store
  const { currentUser } = useSelector((state) => state.user);
  const { currentAdmin } = useSelector((state) => state.admin);

  return (
    <Box sx={{ display: 'flex', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              { mr: 2, backgroundColor: "#00A272" },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <MainNavbar />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <div className='flex gap-3 blur-sm'>
            <img src="/Logo_Images/logoIcon.png" alt="" className='w-6' />
            <img src="/Logo_Images/logoName.png" alt="" className='h-5' />
          </div>
          <IconButton onClick={handleDrawerClose}>
            <DoubleArrowIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>

          {/* Always show Home and Appointment for all users */}
          {['Home', 'Appointment'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton component={Link} to={index % 2 === 0 ? '/home' : '/appointment'}>
                <ListItemIcon>
                  {index % 2 === 0 ? <OtherHousesOutlinedIcon /> : <CalendarMonthOutlinedIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['Patient'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton component={Link} to='/patient'>
                <ListItemIcon>
                  <Diversity1OutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
          {/* Show Staff link if the user is an Admin */}
          {currentAdmin?.role === "Admin" && (
            <ListItem key="Staff" disablePadding>
              <ListItemButton component={Link} to="/details">
                <ListItemIcon>
                  <Diversity1OutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Staff" />
              </ListItemButton>
            </ListItem>
          )}

          {/* Show Profile link for Receptionist or Doctor */}
          {(currentUser?.role === "Receptionist" || currentUser?.role === "Doctor") && (
            <ListItem key="Profile" disablePadding>
              <ListItemButton component={Link} to="/profile">
                <ListItemIcon>
                  <OtherHousesOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
        <Box sx={{ marginTop: 'auto' }}>
          <Divider sx={{ marginBottom: "10px" }}/>
          <Box display="flex" alignItems="center" gap="30px" padding="20px">
            {/* Show Settings link for Admin */}
            {currentAdmin?.role === "Admin" && (
              <>
                <SettingsOutlined sx={{ color: '#A9A9A9' }} />
                <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p>Settings</p>
                </Link>
              </>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap="30px" mt="10px" padding="20px" paddingTop="0px">
            <LogoutOutlinedIcon sx={{ color: '#A9A9A9' }} />
            <p onClick={handleSignOutClick} style={{ cursor: 'pointer' }}>
              Logout
            </p>
          </Box>
        </Box>
      </Drawer>
      <Main open={open} sx={{ width: mainContentWidth }}>
        <DrawerHeader />
        <Outlet />
      </Main>
      <SignOutModal open={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} />
    </Box>
  );
}