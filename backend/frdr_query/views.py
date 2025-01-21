from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.apps import apps

from FRDRQuery.query import frdr_request, get_frdr_urls


import db_connector.models as models
import os

class QueryDataView(APIView):
    def post(self, request, *args, **kwargs):

        try:        
            filters   = request.query_params.get('filters')
            cache_path = request.query_params.get('cache_path')
            save      = request.query_params.get('save')
            print(f"Received filters: {filters}")
            print(f"Received cache_path: {cache_path}")
            print(f"Received save: {save}")
            
            full_cache_path = os.path.join(os.path.dirname(__file__), '..', '..', cache_path)
            full_cache_path = os.path.abspath(full_cache_path)

            if not filters or not cache_path:
                return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)
            
            frdr_urls = get_frdr_urls()

            frdr_request(frdr_urls, full_cache_path, models.TimeSeries, save)

            
            return Response({"message":f"All files saved successfully in {cache_path}"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)