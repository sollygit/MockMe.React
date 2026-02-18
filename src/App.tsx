import { Routes, Route, useNavigate } from "react-router-dom";
import { Container } from "@mui/material";

// MSAL imports
import { MsalProvider } from "@azure/msal-react";
import { IPublicClientApplication } from "@azure/msal-browser";
import { CustomNavigationClient } from "./utils/NavigationClient";

// Sample app imports
import { PageLayout } from "./ui-components/PageLayout";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";

type AppProps = {
    pca: IPublicClientApplication;
};

function App({ pca }: AppProps) {
    // The next 3 lines are optional. This is how you configure MSAL to take advantage of the router's navigate functions when MSAL redirects between pages in your app
    const navigate = useNavigate();
    const navigationClient = new CustomNavigationClient(navigate);
    pca.setNavigationClient(navigationClient);

    return (
        <MsalProvider instance={pca}>
            <PageLayout>
                <Container maxWidth="md" sx={{ p: 2 }}>
                    <Pages />
                </Container>
            </PageLayout>
        </MsalProvider>
    );
}

function Pages() {
    return (
        <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Home />} />
        </Routes>
    );
}

export default App;