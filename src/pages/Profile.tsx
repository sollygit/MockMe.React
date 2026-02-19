import { useEffect, useState } from "react";

// Msal imports
import { MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { InteractionStatus, InteractionType, InteractionRequiredAuthError, AccountInfo } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";

// Sample app imports
import { GraphData } from "../ui-components/ProfileData";
import { Loading } from "../ui-components/Loading";
import { ErrorComponent } from "../ui-components/ErrorComponent";
import { callMsGraph, callMsGraphPhoto } from "../utils/MsGraphApiCall";

// Material-ui imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const ProfileContent = () => {
    const { instance, inProgress } = useMsal();
    const [graphData, setGraphData] = useState<null|GraphData>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!graphData && inProgress === InteractionStatus.None) {
            callMsGraph().then(response => setGraphData(response)).catch((e) => {
                if (e instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenRedirect({
                        ...loginRequest,
                        account: instance.getActiveAccount() as AccountInfo
                    });
                }
            });
        }
        if (!photoUrl && inProgress === InteractionStatus.None) {
            callMsGraphPhoto().then(response => setPhotoUrl(response)).catch((e) => {
                if (e instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenRedirect({
                        ...loginRequest,
                        account: instance.getActiveAccount() as AccountInfo
                    });
                }
            });
        }
    }, [inProgress, graphData, photoUrl, instance]);
  
    return (
        <Card>
            {graphData ? (
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Profile Information
                    </Typography>
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Profile"
                            width={64}
                            height={64}
                            style={{ display: "block", borderRadius: "50%", marginBottom: 12 }}
                        />
                    ) : null}
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {JSON.stringify(graphData, null, 2)}
                    </pre>
                </CardContent>
            ) : null}
        </Card>
    );
};

export function Profile() {
    const authRequest = {
        ...loginRequest
    };

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Redirect} 
            authenticationRequest={authRequest} 
            errorComponent={ErrorComponent} 
            loadingComponent={Loading}
        >
            <ProfileContent />
        </MsalAuthenticationTemplate>
      )
};