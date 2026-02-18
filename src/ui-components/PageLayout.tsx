import { Box } from "@mui/material";
import SidebarNavBar from "./SidebarNavBar";

type Props = {
    children?: React.ReactNode;
};

export const PageLayout: React.FC<Props> = ({children}) => {
    return (
        <>
            <SidebarNavBar />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100vh - 64px)",
                    marginTop: '64px',
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        p: 0,
                        overflowY: "auto",
                    }}
                >
                    {children}
                </Box>
            </Box>
        </>
    );
};