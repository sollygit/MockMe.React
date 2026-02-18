import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

export function Home() {
  return (
      <>
          <AuthenticatedTemplate>
          </AuthenticatedTemplate>

          <UnauthenticatedTemplate>
          </UnauthenticatedTemplate>
      </>
  );
}
