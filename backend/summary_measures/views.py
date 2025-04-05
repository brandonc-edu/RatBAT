from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from SummaryMeasures.CommanderSM import Commander
from SummaryMeasures.DependenciesSM import Karpov
from SummaryMeasures.FunctionalSM import DATA_DEPENDENCIES

import pandas as pd
import os

class ListSummaryMeasuresView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            summary_measures = list(DATA_DEPENDENCIES.keys())
            # Ensure calc_homebases is included at the start
            if 'calc_homebases' in summary_measures:
                summary_measures.remove('calc_homebases')
            summary_measures.insert(0, 'calc_homebases')
            return Response(summary_measures, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ListDataFilesView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Directory where preprocessed files are stored
            preprocessed_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing', 'preprocessed')
            preprocessed_directory = os.path.abspath(preprocessed_directory)

            # Fetch all preprocessed files
            data_files = [
                {
                    "file_name": f,
                    "trial_id": int(f.split('_')[-1].split('.')[0])  # Extract trial ID from file name
                }
                for f in os.listdir(preprocessed_directory)
                if os.path.isfile(os.path.join(preprocessed_directory, f)) and f.startswith('preprocessed_trial_') and f.endswith('.csv')
            ]

            return Response(data_files, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ComputeSummaryMeasuresView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            trial_ids = request.data.get('trial_ids')  # Accept trial IDs from the request
            summary_measures = request.data.get('summary_measures')
            environment = request.data.get('environment', 'common')

            if not trial_ids or not summary_measures:
                return Response({"error": "Trial IDs and summary measures are required."}, status=status.HTTP_400_BAD_REQUEST)

            results = {}
            for trial_id in trial_ids:
                try:
                    # Locate the preprocessed file for the given trial ID
                    preprocessed_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing', 'preprocessed')
                    preprocessed_file_name = f"preprocessed_trial_{trial_id}.csv"
                    preprocessed_file_path = os.path.join(preprocessed_directory, preprocessed_file_name)

                    if not os.path.exists(preprocessed_file_path):
                        return Response({"error": f"Preprocessed file for trial {trial_id} not found."}, status=status.HTTP_404_NOT_FOUND)

                    # Load the preprocessed data
                    print(f"Loading preprocessed file: {preprocessed_file_path}")
                    data = pd.read_csv(preprocessed_file_path)

                    # Ensure the data is numeric and exclude non-numeric rows (like headers)
                    data = data.apply(pd.to_numeric, errors='coerce')  # Convert all columns to numeric, replacing invalid values with NaN
                    data = data.dropna()  # Drop rows with NaN values (e.g., if headers were mistakenly included)

                    # Convert to NumPy array
                    data = data.to_numpy()

                    # Log the shape of the data for debugging
                    print(f"Data shape for trial {trial_id}: {data.shape}")

                    # Compute summary measures
                    commander = Commander(data, environment)
                    reordered_measures, data_dependencies = Karpov.ResolveDependencies(summary_measures)
                    calculated_measures = commander.CalculateSummaryMeasures(data, reordered_measures, data_dependencies)
                    results[trial_id] = calculated_measures
                except Exception as e:
                    return Response({"error": f"Error processing trial {trial_id}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)