import os, pathlib
import re
import json

import generate_tokens
import globus_sdk
from globus_sdk import TransferClient, TransferData

TYPE_REGEX = "/11/published/publication_[0-9]{3}/submitted_data/Q[0-9]{2}/"

def get_transfer_client():
    generate_tokens.gen_tokens()
    transf_token = os.getenv("GLOBUS_TRANSFER")

    transf_auth = globus_sdk.AccessTokenAuthorizer(transf_token)
    transf_client = TransferClient(authorizer= transf_auth)
    
    return transf_client

def transfer(transf_client: TransferClient, data_types, filters):

    source_id   = os.getenv("SOURCE_COLLECTION")
    dest_id     = os.getenv("DEST_COLLECTION")
    source_path = "/11/published/"
    dest_path   = "./test_transfer_loc/"

    test_path   = source_path + "publication_436/submitted_data/Q23/05_EthoVision_csvTrackFiles/"

    transf_data = TransferData(transf_client, source_id, dest_id)
    
    for item in transf_client.operation_ls(source_id, test_path, filter = "name:~*.csv"):
        transf_data.add_item(test_path + item["name"], dest_path + "/test/" + item['name'])

    transf_info = transf_client.submit_transfer(transf_data)
    print(f"Transfer submitted{transf_info['task']}")


"""
# ONLY ONE FILTER IS APPLIED TO ANY DATA SO EXCLUDES HAVE TO GO BEFORE THIS
# Data types is dictionary of form:
# {"VIDEO":(True|False), "TIME-SERIES":(True|False), "PLOT":(True|False)}
def type_filter(transfer_data: TransferData, data_types):
    (03_Videos_mpgFiles|05_EthoVision_csvTrackFiles|06_Pathplots_individual)
    filtered_type_regex = (TYPE_REGEX + "(" 
        + f"{"03_Videos_mpgFiles|" if data_types["VIDEO"] else ''}" 
        + f""
        + ")")

    transfer_data.add_filter_rule("include", filtered_type_regex, "dir")

"""

transf_client = get_transfer_client()
transfer(transf_client, None, None)