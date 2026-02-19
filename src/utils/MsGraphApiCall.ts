import { loginRequest, graphConfig } from "../authConfig";
import { msalInstance } from "../index";

export async function callMsGraph() {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account
    });

    const headers = new Headers();
    const bearer = `Bearer ${response.accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphMeEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

export async function callMsGraphPhoto() {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
    }

    const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account
    });

    const headers = new Headers();
    const bearer = `Bearer ${response.accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    const photoResponse = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", options);
    if (!photoResponse.ok) {
        return null;
    }

    const blob = await photoResponse.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}