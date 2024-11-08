import os, pathlib
import generate_tokens
import globus_sdk
from globus_sdk import TransferClient, TransferData

def get_transfer_client():
    generate_tokens.gen_tokens()
    transfer_token = os.getenv("GLOBUS_TOKENS")["TRANSFER"]

    transfer_auth = globus_sdk.AccessTokenAuthorizer(transfer_token)
    transfer_client = TransferClient(authorizer= transfer_auth)
    
    return transfer_client

def transfer(client: TransferClient, data_types, filters):

    source_id   = os.getenv("SOURCE_COLLECTION")
    dest_id     = os.getenv("DEST_COLLECTION")
    source_path = pathlib.Path("/11/published/")
    dest_path   = pathlib.Path("./test_transfer_loc")
    
    transfer_object = TransferData(client, source_id, dest_id)

    for item in client.operation_ls(source_id, )

def filter(client, filter):