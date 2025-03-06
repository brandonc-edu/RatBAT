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
            data_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'SummaryMeasures')
            data_files_directory = os.path.abspath(data_files_directory)
            data_files = [f for f in os.listdir(data_files_directory) if os.path.isfile(os.path.join(data_files_directory, f)) and f.endswith('.xlsx')]
            return Response(data_files, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ComputeSummaryMeasuresView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data_file_paths = request.data.get('data_file_paths')
            summary_measures = request.data.get('summary_measures')
            environment = request.data.get('environment', 'common')

            if not data_file_paths or not summary_measures:
                return Response({"error": "Data file paths and summary measures are required."}, status=status.HTTP_400_BAD_REQUEST)

            results = {}
            for data_file_path in data_file_paths:
                try:
                    # Load the data file
                    data_file_full_path = os.path.join(os.path.dirname(__file__), '..', '..', 'SummaryMeasures', data_file_path)
                    data_file_full_path = os.path.abspath(data_file_full_path)
                    print(f"Data file full path: {data_file_full_path}")

                    data = pd.read_excel(data_file_full_path).to_numpy()
                    commander = Commander(data, environment)
                    reordered_measures, data_dependencies = Karpov.ResolveDependencies(summary_measures)
                    calculated_measures = commander.CalculateSummaryMeasures(data, reordered_measures, data_dependencies)
                    results[data_file_path] = calculated_measures
                except Exception as e:
                    return Response({"error": f"Error processing file {data_file_path}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)