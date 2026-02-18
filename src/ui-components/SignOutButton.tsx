import { useMsal } from "@azure/msal-react";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";

export const SignOutButton = () => {
    const { instance } = useMsal();

    const handleLogout = () => {
        instance.logoutRedirect();
    }

    return (
        <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ color: 'white' }}
        >
            Logout
        </Button>
    )
};