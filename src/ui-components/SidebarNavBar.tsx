import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import WelcomeName from "./WelcomeName";
import SignInSignOutButton from "./SignInSignOutButton";

const SidebarNavBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const menuItems = [
        { label: "Home", icon: <HomeIcon />, path: "/" },
        { label: "Profile", icon: <PersonIcon />, path: "/profile" },
    ];

    return (
        <>
            {/* Top AppBar */}
            <AppBar position="fixed" sx={{ backgroundColor: '#3f51b5', zIndex: 1301 }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ mr: 2, color: 'white' }}
                    >
                        <MenuIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            color: 'white',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.8,
                            },
                        }}
                    >
                        MockMe App
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WelcomeName />
                        <SignInSignOutButton />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Hamburger Menu Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box
                    sx={{
                        width: 250,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            p: 1,
                            backgroundColor: '#3f51b5',
                        }}
                    >
                        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <List sx={{ pt: 2 }}>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.path}
                                component={RouterLink}
                                to={item.path}
                                onClick={() => setDrawerOpen(false)}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(63, 81, 181, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: '#3f51b5', minWidth: 'auto' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    sx={{
                                        m: 0,
                                        '& .MuiTypography-root': {
                                            color: '#3f51b5',
                                            fontWeight: 500,
                                            fontSize: '0.9rem',
                                        },
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default SidebarNavBar;
