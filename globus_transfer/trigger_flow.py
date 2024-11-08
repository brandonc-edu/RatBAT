import sys
import os
import time
import json
import uuid
import pickle
import base64

import globus_sdk
import globus_sdk.scopes
from flows_service import create_flows_client
from watch import FileTrigger, translate_local_path_to_globus_path

CLIENT_ID = 'eed121e9-a8d4-4db2-9be5-ec9bccaee3b0'



my_collaborators = "9be7b742-9cbd-11ef-9cd3-076e3444c5ff"  # "OCD Data Platform - Capstone Group" group



def run_flow(event_file):
    # TODO: Specify the flow to run when triggered
    flow_id = "REPLACE_WITH_FLOW_ID"
    fc = create_flows_client(flow_id=flow_id)

    # TODO: Set a label for the flow run
    # Default includes the file name that triggered the run
    flow_label = f"Trigger transfer: {os.path.basename(event_file)}"


    # Source collection must be on the endpoint where this trigger code is running
    source_id = "c1ed357d-e294-4cba-9617-4b56890c42ae"  # "FRDR-DFDR-Prod-C-11 - Szechtman Lab Collection"
    destination_id = "e4d2d806-98c1-11ef-b8cc-45f0422a3ca5"  # "Daniel Locke - Test Collection"

    # TODO: Modify destination collection path
    # Update path to include your user name e.g. /automate-tutorial/dev1/
    destination_base_path = "./test123/"

    # Get the Globus-compatible directory name where the triggering file is stored.
    event_folder = os.path.dirname(event_file)
    source_path = translate_local_path_to_globus_path(event_folder)

    # Get name of monitored folder to use as destination path
    # and for setting permissions
    event_folder_name = os.path.basename(event_folder)

    # Add a trailing '/' to meet Transfer requirements for directory transfer
    destination_path = os.path.join(destination_base_path, event_folder_name, "")
    # Convert Windows path separators to forward slashes.
    destination_path = destination_path.replace("\\", "/")

    # Inputs to the flow
    flow_input = {
        "input": {
            "source": {
                "id": source_id,
                "path": source_path,
            },
            "destination": {
                "id": destination_id,
                "path": destination_path,
            },
            "recursive_tx": True,
        }
    }

    flow_run_request = fc.run_flow(
        body=flow_input,
        label=flow_label,
        tags=["Trigger_Test"],
    )
    print(f"Transferring: {event_folder_name}")
    print(f"https://app.globus.org/runs/{flow_run_request['run_id']}")