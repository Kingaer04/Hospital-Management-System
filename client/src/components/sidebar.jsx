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
import {SettingsOutlined} from '@mui/icons-material'
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
import { useOpen } from '../components/openContext'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SignOutModal from './SignOutModal.jsx';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    // padding: theme.spacing(3),
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

// Styled component to rotate the icon
const RotatedDoubleArrowIcon = styled(DoubleArrowIcon)(({ theme }) => ({
  transform: theme.direction === 'ltr' ? 'rotate(180deg)' : 'none',
}));

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
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function SideBar() {
  const theme = useTheme();
  const {open, setOpen, mainContentWidth} = useOpen()
  const location = useLocation()

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const isHomePage = location.pathname === "/Home"


  const [signOutModalOpen, setSignOutModalOpen] = React.useState(false);

  const handleSignOutClick = () => {
    setSignOutModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', maxWidth: '1440px', width:'100%', margin: '0 auto' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
                backgroundColor: "#00A272"
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <MainNavbar/>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <div className='flex gap-3 blur-sm'>
            <img src="../../public/Logo_Images/logoIcon.png" alt="" className='w-6'/>
            <img src="../../public/Logo_Images/logoName.png" alt="" className='h-5' />
          </div>
          <IconButton onClick={handleDrawerClose}>
            <RotatedDoubleArrowIcon/>
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
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
          {['Patient', 'Staff'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton component={Link} to={index % 2 === 0 ? '/patient': '/staff'}>
                <ListItemIcon>
                  {index % 2 === 0 ? <Diversity1OutlinedIcon /> : <img src="/Icons/StaffIcon.png"/>}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box mt="100%">
          <Divider/>
          <Box p="20px">
            <Box display="flex" alignItems="center" gap="30px">
              <SettingsOutlined sx={{ color: '#A9A9A9' }}/>
              <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p>
                  Settings
                </p>
              </Link>
            </Box>
            <Box display="flex" alignItems="center" gap="30px" mt="10px">
              <LogoutOutlinedIcon sx={{ color: '#A9A9A9' }}/>
              <p onClick={() => handleSignOutClick()} style={{ cursor: 'pointer' }}>
                Logout
              </p>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Main open={open} sx={{ width: mainContentWidth }}>
        <DrawerHeader />
        <Outlet/>
      </Main>
      <SignOutModal open={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} />
    </Box>
  );
}
