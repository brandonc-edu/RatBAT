from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import pandas as pd
import numpy as np
import requests
from preprocessing.Preprocessor import Preprocessor
from django.http import FileResponse
from preprocessing.Preprocessor import LOG_TRANSFORM_FUNCTIONS

class DownloadFileView(APIView):
    def get(self, request, filename, *args, **kwargs):
        # Define the directory where preprocessed files are stored
        file_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing', 'preprocessed')
        file_path = os.path.join(file_directory, filename)

        # Check if the file exists
        if os.path.exists(file_path):
            # Return the file as a response
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        else:
            # Return a 404 response if the file is not found
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
          
class PreprocessDataView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Log the incoming request data
            print("Request data:", request.data)

            # Get the parameters and selected trials from the request
            parameters = request.data.get('parameters', {})
            determine_k_automatically = request.data.get('determineKAutomatically', False)
            selected_trials = request.data.get('selectedTrials', [])
            selected_trials = [int(trial) for trial in selected_trials]  # Convert to integers

            # Ensure selectedTrials is provided
            if not selected_trials:
                return Response({"error": "No trials provided in the request."}, status=status.HTTP_400_BAD_REQUEST)

            print(f"Using provided trial IDs: {selected_trials}")

            def convert_parameters(params):
                for method, method_params in params.items():
                    for key, value in method_params.items():
                        # Convert to int if possible, otherwise to float
                        if isinstance(value, str):
                            if value.isdigit():
                                params[method][key] = int(value)
                            else:
                                try:
                                    params[method][key] = float(value)
                                except ValueError:
                                    pass

                        # Validate RRM parameters
                        if method == "RRM":
                            if key == "min_arr" and (value < 1 or value > 1000):
                                params[method][key] = 5  # Default value
                            if key == "tol" and (value <= 0 or value > 100):
                                params[method][key] = 0.000001  # Default value

                        # Validate EM parameters
                        if method == "EM":
                            if key == "k" and value is None:
                                params[method][key] = 2  # Default value if not set
                            if key == "log_transform" and value not in LOG_TRANSFORM_FUNCTIONS.keys():
                                params[method][key] = "cbrt"  # Default to "cbrt" if invalid

                return params

            parameters = convert_parameters(parameters)

            # Handle "Determine k Automatically"
            if determine_k_automatically:
                parameters["EM"]["k"] = None

            # Ensure log_transform is a valid string
            if "log_transform" in parameters["EM"] and parameters["EM"]["log_transform"] not in LOG_TRANSFORM_FUNCTIONS.keys():
                parameters["EM"]["log_transform"] = "cbrt"  # Default to "cbrt"

            # Debug: Print the parameters to verify that "k" is set to None and log_transform is mapped
            print("Updated parameters after handling 'Determine k Automatically' and 'log_transform':", parameters)

            # Query the time series data for the provided trials
            timeseries_url = "http://ratbat.cas.mcmaster.ca/api/frdr-query/get-timeseries/"
            response = requests.get(timeseries_url, params={"trials": ",".join(map(str, selected_trials))})

            if response.status_code != 200:
                return Response({"error": f"Failed to fetch time series data: {response.text}"}, status=response.status_code)

            timeseries_data = response.json()
            print(f"Fetched time series data for trials: {selected_trials}")

            # Directory paths
            output_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing', 'preprocessed')
            os.makedirs(output_directory, exist_ok=True)

            # Initialize the preprocessor with the converted parameters
            preprocessor = Preprocessor(function_params=parameters)

            # Process each trial's time series data
            preprocessed_files = []
            for trial_id, trial_data in timeseries_data.items():
                print(f"Processing trial: {trial_id}")

                # Extract required columns: sample_id, x, y
                if {'sample_id', 'x', 'y'}.issubset(trial_data):
                    data = pd.DataFrame({
                        'frame': trial_data['sample_id'],
                        'x': trial_data['x'],
                        'y': trial_data['y']
                    })

                    # Drop rows with invalid (NaN) values
                    data = data.dropna(subset=['frame', 'x', 'y'])

                    formatted_data = data[['frame', 'x', 'y']].to_numpy()
                else:
                    return Response({"error": f"Trial {trial_id} does not have the required columns: sample_id, x, y"}, status=status.HTTP_400_BAD_REQUEST)

                # Preprocess the data
                preprocessed_data = preprocessor.preprocess_data(formatted_data)

                # Save the preprocessed data to a new CSV file
                output_file_name = f"preprocessed_trial_{trial_id}.csv"
                output_file_path = os.path.join(output_directory, output_file_name)
                pd.DataFrame(preprocessed_data, columns=['frame', 'x', 'y', 'velocity', 'segment_type']).to_csv(output_file_path, index=False)
                preprocessed_files.append(output_file_name)

            return Response(preprocessed_files, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error during preprocessing:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)