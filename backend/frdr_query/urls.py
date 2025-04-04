from django.urls import path
from frdr_query.views import FRDRQueryView, GetFieldsView, QueryDataView, GetTimeSeriesView, FRDRQueryPreprocessedView

urlpatterns = [
    path('get-fields/', GetFieldsView.as_view(), name='get_fields'),
    path('frdr-query/', FRDRQueryView.as_view(), name='frdr_query'),
    path('query-data/', QueryDataView.as_view(), name='query_data'),
    path('get-timeseries/', GetTimeSeriesView.as_view(), name='get_timeseries'),
    path('frdr-query-preprocessed/', FRDRQueryPreprocessedView.as_view(), name='frdr_query_preprocessed'),
]