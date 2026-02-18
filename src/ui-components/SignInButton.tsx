import { useMsal } from "@azure/msal-react";
import Button from "@mui/material/Button";
import LoginIcon from "@mui/icons-material/Login";
import { loginRequest } from "../authConfig";

export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    }

    return (
        <Button
            onClick={handleLogin}
            startIcon={<LoginIcon />}
            sx={{ color: 'white' }}
        >
            Login
        </Button>
    )
};