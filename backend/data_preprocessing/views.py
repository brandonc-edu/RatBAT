from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import pandas as pd
from preprocessing.Preprocessor import Preprocessor

class ListDataFilesView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            data_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing')
            data_files_directory = os.path.abspath(data_files_directory)
            data_files = [f for f in os.listdir(data_files_directory) if os.path.isfile(os.path.join(data_files_directory, f)) and f.endswith('.csv')]
            return Response(data_files, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PreprocessDataView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Log the incoming request data
            print("Request data:", request.data)

            # Get the selected data files and parameters from the request
            selected_files = request.data.get('selectedFiles', [])
            parameters = request.data.get('parameters', {})

            if not selected_files or not parameters:
                return Response({"error": "Missing selectedFiles or parameters"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert parameters to the correct types
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
                return params

            parameters = convert_parameters(parameters)

            # Directory paths
            data_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing')
            output_directory = os.path.join(data_files_directory, 'preprocessed')
            os.makedirs(output_directory, exist_ok=True)

            # Initialize the preprocessor with the converted parameters
            preprocessor = Preprocessor(function_params=parameters)

            # Process each selected file
            preprocessed_files = []
            for file_name in selected_files:
                file_path = os.path.join(data_files_directory, file_name)
                print(f"Processing file: {file_path}")
                if not os.path.exists(file_path):
                    print(f"File not found: {file_path}")
                    return Response({"error": f"File {file_name} not found"}, status=status.HTTP_400_BAD_REQUEST)

                # Load the data
                data = pd.read_csv(file_path)
                print(f"Loaded data from {file_name}:\n", data.head())
                print(f"Columns in {file_name}: {data.columns.tolist()}")

                # Ensure the data is in the required format: [frame, x-coordinates, y-coordinates]
                if {'Sample no.', 'X', 'Y'}.issubset(data.columns):
                    # Convert columns to numeric types
                    data['Sample no.'] = pd.to_numeric(data['Sample no.'], errors='coerce')
                    data['X'] = pd.to_numeric(data['X'], errors='coerce')
                    data['Y'] = pd.to_numeric(data['Y'], errors='coerce')

                    # Drop rows with invalid (NaN) values
                    data = data.dropna(subset=['Sample no.', 'X', 'Y'])

                    formatted_data = data[['Sample no.', 'X', 'Y']].rename(
                        columns={'Sample no.': 'frame', 'X': 'x', 'Y': 'y'}
                    ).to_numpy()
                else:
                    return Response({"error": f"File {file_name} does not have the required columns: Sample no., X, Y"}, status=status.HTTP_400_BAD_REQUEST)

                # Preprocess the data
                preprocessed_data = preprocessor.preprocess_data(formatted_data)

                # Save the preprocessed data to a new CSV file
                output_file_name = f"preprocessed_{file_name}"
                output_file_path = os.path.join(output_directory, output_file_name)
                pd.DataFrame(preprocessed_data, columns=['frame', 'x', 'y', 'velocity', 'segment_type']).to_csv(output_file_path, index=False)
                preprocessed_files.append(output_file_name)

            return Response(preprocessed_files, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error during preprocessing:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)