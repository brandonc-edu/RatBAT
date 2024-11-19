from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from SummaryMeasures.CommanderSM import Commander 
from SummaryMeasures.CommanderSM import SM_DEPENDENCIES

import pandas as pd

import os

class ListSummaryMeasuresView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            summary_measures = list(SM_DEPENDENCIES.keys())
            return Response(summary_measures, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
          
          
class ListDataFilesView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Correct directory where the data files are stored
            data_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'SummaryMeasures')
            data_files_directory = os.path.abspath(data_files_directory)
            print(f"Data files directory: {data_files_directory}")  # Log the directory path

            # List all files in the directory and filter for .xlsx files
            data_files = [f for f in os.listdir(data_files_directory) if os.path.isfile(os.path.join(data_files_directory, f)) and f.endswith('.xlsx')]
            print(f"Data files: {data_files}")  # Log the data files

            return Response(data_files, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error: {str(e)}")  # Log the error
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ComputeSummaryMeasuresView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data_file_path = request.data.get('data_file_path')
            summary_measures = request.data.get('summary_measures')
            environment = request.data.get('environment')

            print(f"Received data_file_path: {data_file_path}")
            print(f"Received summary_measures: {summary_measures}")
            print(f"Received environment: {environment}")

            if not data_file_path or not summary_measures or not environment:
                return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

            # Load the data file
            data_file_full_path = os.path.join(os.path.dirname(__file__), '..', '..', 'SummaryMeasures', data_file_path)
            data_file_full_path = os.path.abspath(data_file_full_path)
            print(f"Data file full path: {data_file_full_path}")

            data = pd.read_excel(data_file_full_path).to_numpy()
            print(f"Loaded data: {data[:5]}")  # Print the first 5 rows for debugging

            # Create Commander instance and calculate summary measures
            commander = Commander(data, environment)
            commander.CalculateSummaryMeasures(data, summary_measures)

            print(f"Calculated summary measures: {commander.calculatedSummaryMeasures}")

            return Response(commander.calculatedSummaryMeasures, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error: {str(e)}")  # Log the error
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)