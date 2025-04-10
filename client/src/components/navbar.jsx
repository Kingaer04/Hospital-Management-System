import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SignOutModal from './SignOutModal';
import { useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function MainNavBar() {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = React.useState(false);
  const { currentAdmin } = useSelector((state) => state.admin);
  const { currentUser } = useSelector((state) => state.user);
  const [unRead, setUnRead] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(0);
  const [lastFetchTime, setLastFetchTime] = React.useState(0);
  const [lastMessageFetchTime, setLastMessageFetchTime] = React.useState(0);

  const fetchUnreadMessages = useCallback(async () => {
    if (!currentUser?._id) return;
    
    try {
      const res = await fetch(`http://localhost:3000/notification/get-unread-notifications/${currentUser._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setUnRead(data);
      setUnreadCount(data.length);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.log('Error fetching unread messages: ', error);
    }
  }, [currentUser?._id]);

  const fetchUnreadChats = useCallback(async () => {
    if (!currentUser?._id) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/chat/unread`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });
      const data = await res.json();
      
      // Calculate total unread messages
      const totalUnread = data.reduce((total, item) => total + item.count, 0);
      
      setUnreadMessages(data);
      setUnreadMessagesCount(totalUnread);
      setLastMessageFetchTime(Date.now());
    } catch (error) {
      console.log('Error fetching unread chats: ', error);
    }
  }, [currentUser?._id]);

  // Fetch notifications and messages immediately when the component mounts or user changes
  useEffect(() => {
    if (currentUser?._id) {
      fetchUnreadMessages();
      fetchUnreadChats();
    }
  }, [currentUser?._id, fetchUnreadMessages, fetchUnreadChats]);

  // Set up frequent polling (every 10 seconds)
  useEffect(() => {
    const notificationIntervalId = setInterval(fetchUnreadMessages, 10000);
    const messageIntervalId = setInterval(fetchUnreadChats, 10000);
    
    return () => {
      clearInterval(notificationIntervalId);
      clearInterval(messageIntervalId);
    };
  }, [fetchUnreadMessages, fetchUnreadChats]);

  // Fetch when the window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only fetch if the last fetch was more than 2 seconds ago
        const now = Date.now();
        if (now - lastFetchTime > 2000) {
          fetchUnreadMessages();
        }
        if (now - lastMessageFetchTime > 2000) {
          fetchUnreadChats();
        }
      }
    };

    // Refresh when the tab becomes active again
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh when user returns to the app
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchUnreadMessages, fetchUnreadChats, lastFetchTime, lastMessageFetchTime]);

  // Handle socket.io message events
  useEffect(() => {
    // If you have a socket instance in your app context or redux store
    // You can listen for 'receive_message' events and update counts
    if (window.socket && currentUser?._id) {
      const handleNewMessage = (data) => {
        if (data.receiverId === currentUser._id) {
          // Increment unread count immediately without full refetch
          setUnreadMessagesCount(prev => prev + 1);
          // Then refetch for accuracy after a small delay
          setTimeout(fetchUnreadChats, 500);
        }
      };
      
      window.socket.on('receive_message', handleNewMessage);
      
      return () => {
        window.socket.off('receive_message', handleNewMessage);
      };
    }
  }, [currentUser?._id, fetchUnreadChats]);

  const handleSignOutClick = () => {
    setSignOutModalOpen(true);
  };

  const toggleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen((prev) => !prev);
  };

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => {
        handleMenuClose();
        navigate('/settings');
      }}>Profile</MenuItem>
      <MenuItem onClick={() => {
        handleMenuClose();
        handleSignOutClick();
      }}>LogOut</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <Link to="/message" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <IconButton size="large" aria-label="show unread messages" color="inherit">
            <Badge badgeContent={unreadMessagesCount} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          <p>Messages</p>
        </Link>
      </MenuItem>
      <MenuItem>
        <Link to="/notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="large"
            aria-label="show new notifications"
            color="inherit"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>  
          <p>Notifications</p>
        </Link>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: "none", paddingRight: "15px", zIndex: 1200 }}>
      <Toolbar>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-start' }}>
          <Link to="/message" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton 
              size="large" 
              aria-label="show unread messages" 
              color="inherit"
              onClick={fetchUnreadChats} // Refresh message counts when clicked
            >
              <Badge badgeContent={unreadMessagesCount} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Link>
          <Link to="/notifications" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              onClick={fetchUnreadMessages} // Refresh notifications when icon is clicked
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Link>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={toggleMenu}
            color="inherit"
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '48px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0px',
              },
            }}
          >
            <AccountCircle sx={{ height: '30px', width: 'auto' }} />
            <Box sx={{ marginLeft: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: 50 }}>
              <Typography variant="body2" sx={{ fontSize: "10px", fontWeight: "bold", textTransform: 'uppercase', marginLeft: 0 }}>
                {(() => {
                  const name = currentAdmin?.hospital_Representative || currentUser?.name;
                  if (name) {
                    const words = name.split(' ');
                    return (words[0].toLowerCase() === 'dr' || words[0].toLowerCase() === 'dr.') ? words[1] : words[0];
                  }
                  return '';
                })()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ marginLeft: 0, fontSize: "10px" }}>
                {currentAdmin?.role || currentUser?.role}
              </Typography>
            </Box>
            {menuOpen ? <ExpandLess sx={{ marginLeft: 1 }} /> : <ExpandMore sx={{ marginLeft: 1 }} />}
          </IconButton>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {renderMobileMenu}
      {renderMenu}
      <SignOutModal open={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} />
    </AppBar>
  );
}
