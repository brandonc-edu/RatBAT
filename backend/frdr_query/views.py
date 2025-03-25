from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from FRDRQuery.query import frdr_request, get_frdr_urls, get_timeseries, get_data

from django.apps import apps
import django
import db_connector.models as models
import os

class GetFieldsView(APIView):
    """An api view used to access all db fields.
    
    ForeignKey fields, reverse_related fields, and auto fields are excluded as they simply reference other tables or auto generated values.
    """
    def get(self, request, *args, **kwargs):
        try:
            fields = {}        
            # Collect all fields from all tables (excluding foreign keys).
            for model in apps.get_app_config('db_connector').get_models():
                
                if not model.__name__ in fields.keys():
                    fields[model.__name__] = []

                for field in model._meta.get_fields():
                    if not (isinstance(field,django.db.models.fields.related.ForeignKey) 
                            or isinstance(field,django.db.models.fields.reverse_related.ManyToOneRel)
                            or isinstance(field,django.db.models.fields.AutoField)):
                        fields[model.__name__].append(field.name)
            
            fields = {model:fields[model] for model in fields.keys() if not fields[model] == []}
            
            return Response(fields, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class QueryDataView(APIView):
    """An api view used for general database querying. 
    
    Input a list of filters and fields and get data for requested fields that falls within the filters.
    """
    def post(self, request, *args, **kwargs):
        try:        
            filters    = request.data.get('filters')
            fields     = request.data.get('fields')

            print(f"Received filters: {filters}")
            print(f"Received fields: {fields}")

            if not filters or not fields:
                return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

            data = get_data(filters, models.trial, fields)
            
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetTimeSeriesView(APIView):
    """An api view used to access time series data for given trials. 
    """
    def get(self, request, *args, **kwargs):
        try:        
            trials = request.GET.getlist("trials",request.session.get("filtered_trials",[]))
            print(trials)
            trials = [int(trial) for trial in trials]

            print(f"Received trials: {trials}")

            data = get_timeseries(trials, models.trial)
            
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FRDRQueryView(APIView):
    """An api view used to submit filters and fetch all data covered under those filters from the frdr.
    
    Any data already stored in the database will not be refetched from the frdr. 
    """
    def post(self, request, *args, **kwargs):

        try:        
            filters    = request.data.get('filters')
            cache_path = request.data.get('cache_path')
            dtypes     = request.data.get('dtypes','a')

            print(f"Received filters: {filters}")
            print(f"Received cache_path: {cache_path}")
            print(f"Received dtypes: {dtypes}")
            
            if not filters or not cache_path:
                return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

            full_cache_path = os.path.join(os.path.dirname(__file__), '..', '..', cache_path)
            full_cache_path = os.path.abspath(full_cache_path)

            print(f"Full save path {full_cache_path}")

            frdr_urls = get_frdr_urls(filters,models.trial,dtypes)
            print(f"Fetching the following URLs from the FRDR: {frdr_urls}")

            failed_downloads = frdr_request(frdr_urls, full_cache_path, models.timeseries)
            
            filters_ts = filters.copy()
            filters_ts.append({"field":"timeseries","lookup":"isnull","value":False})

            trial_ids = set([list(trial.values())[0] for trial in get_data(filters_ts, models.trial, ["trial_id"])])
            print()
            failed_trial_ids = set([trial[0] for trial in failed_downloads])
            trial_ids = list(trial_ids.difference(failed_trial_ids))

            request.session["filtered_trials"] = trial_ids
            request.session.modified = True
            
            if len(failed_downloads) == 0:
                return Response({"message":f"All files successfully saved for trials: {trial_ids}"}, status=status.HTTP_200_OK)
            else:
                return Response({"message":f"One or more files failed to download.","failed downloads":failed_downloads}, status=status.HTTP_207_MULTI_STATUS)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)