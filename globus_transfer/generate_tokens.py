import os, dotenv
import globus_sdk
def gen_tokens():
    dotenv.load_dotenv()

    if os.getenv("GLOBUS_TOKENS") == None:

        APP_CLIENT_ID = "eed121e9-a8d4-4db2-9be5-ec9bccaee3b0"
        APP_CLIENT_SECRET = os.getenv("TRANSFER_SECRET_KEY")

        # Client object for application.
        client_application = globus_sdk.ConfidentialAppAuthClient(APP_CLIENT_ID, APP_CLIENT_SECRET)

        # Request tokens from Globus. 
        token_response = client_application.oauth2_client_credentials_tokens()

        """
            globus_auth_data/globus_transfer_data:
            {
                "scope" : "..."
                "access_token": "..."
                "refresh_token": "..." (null in this case)
                "token_type": "..."
                "expires_at_seconds": "..."
                "resource_server": "..."
            }  
        """
        globus_auth_data = token_response.by_resource_server["auth.globus.org"]
        globus_transfer_data = token_response.by_resource_server["transfer.api.globus.org"]

        # Store globus tokens as environmental variables. 
        os.environ["GLOBUS_TOKENS"] = {"AUTH": globus_auth_data["access_token"], "TRANSFER": globus_transfer_data["access_token"]}

