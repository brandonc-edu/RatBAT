from django.urls import path
from frdr_query.views import FRDRQueryView, GetFieldsView, QueryDataView, GetTimeSeriesView

urlpatterns = [
    path('api/get-fields/', GetFieldsView.as_view(), name='get_fields'),
    path('api/frdr-query/', FRDRQueryView.as_view(), name='frdr_query'),
    path('api/query-data/', QueryDataView.as_view(), name='query_data'),
    path('api/get-timeseries/', GetTimeSeriesView.as_view(), name='get_timeseries'),
]