from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from FRDRQuery.query import frdr_request, get_frdr_urls, db_request, get_local_trials

import db_connector.models as models
import os

class QueryDataView(APIView):
    def post(self, request, *args, **kwargs):

        try:        
            filters    = request.data.get('filters')
            cache_path = request.data.get('cache_path')
            dtypes     = request.data.get('dtypes','a')
            save       = request.data.get('save',False)

            print(f"Received filters: {filters}")
            print(f"Received cache_path: {cache_path}")
            print(f"Received dtypes: {dtypes}")
            print(f"Received save: {save}")
            
            if not filters or not cache_path:
                return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

            full_cache_path = os.path.join(os.path.dirname(__file__), '..', '..', cache_path)
            full_cache_path = os.path.abspath(full_cache_path)

            print(f"Full save path {full_cache_path}")

            frdr_urls = get_frdr_urls(filters,models.trial,dtypes)
            print(f"Fetching the following URLs from the FRDR: {frdr_urls}")

            local_trials = get_local_trials(filters,models.trial,dtypes)
            print(f"Fetching the following trials from the DB: {local_trials}")

            frdr_request(frdr_urls, full_cache_path, models.timeseries, save)
            db_request(local_trials, full_cache_path, models.timeseries)
            
            return Response({"message":f"All files saved successfully in {cache_path}"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)