from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os



class ListDataFilesView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            data_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'preprocessing')
            data_files_directory = os.path.abspath(data_files_directory)
            data_files = [f for f in os.listdir(data_files_directory) if os.path.isfile(os.path.join(data_files_directory, f)) and f.endswith('.csv')]
            return Response(data_files, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
