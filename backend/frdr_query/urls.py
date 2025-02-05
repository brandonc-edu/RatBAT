from django.urls import path
from frdr_query.views import QueryDataView

urlpatterns = [
    path('api/query-data/', QueryDataView.as_view(), name='query_data')
]