import os, dotenv
import globus_sdk

def gen_tokens():
    dotenv.load_dotenv()

    if os.getenv("GLOBUS_TOKENS") == None:

        APP_CLIENT_ID = "eed121e9-a8d4-4db2-9be5-ec9bccaee3b0"
        APP_CLIENT_SECRET = os.getenv("TRANSFER_SECRET_KEY")

        source_id   = os.getenv("SOURCE_COLLECTION")
        dest_id     = os.getenv("DEST_COLLECTION")

        source_data_access = globus_sdk.scopes.GCSCollectionScopeBuilder(source_id).data_access
        dest_data_access   = globus_sdk.scopes.GCSCollectionScopeBuilder(dest_id).data_access

        transfer_scope = globus_sdk.scopes.TransferScopes.make_mutable("all")
        transfer_scope.add_dependency(source_data_access)
        transfer_scope.add_dependency(dest_data_access)

        print(transfer_scope)

        #dest_manage_collections = globus_sdk.scopes.GCSCollectionScopeBuilder(dest_id).make_mutable("manage_collections")
        #dest_manage_collections.add_dependency(dest_data_access)

        #requested_scopes = [transfer_scope, dest_manage_collections]
        requested_scopes = [transfer_scope]

        # Client object for application.
        client_application = globus_sdk.ConfidentialAppAuthClient(APP_CLIENT_ID, APP_CLIENT_SECRET)

        client_application.add_scope_reqirements(requested_scopes)
        # Request tokens from Globus. 
        tokens = client_application.oauth2_client_credentials_tokens()
        print(tokens)
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
        
        globus_transfer_token = tokens["transfer.api.globus.org"]["access_token"]
        #globus_dest_token     = tokens[dest_id]["access_token"]

        # Store globus tokens as environmental variables.        

        os.environ["GLOBUS_TRANSFER"] = globus_transfer_token
        #os.environ["GLOBUS_EP_TOKEN"] = globus_dest_token

'''
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
        os.environ["GLOBUS_AUTH"] = globus_auth_data["access_token"]
        os.environ["GLOBUS_TRANSFER"] = globus_transfer_data["access_token"]
'''