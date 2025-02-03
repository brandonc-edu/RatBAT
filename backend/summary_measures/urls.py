from django.urls import path
from summary_measures.views import ComputeSummaryMeasuresView, ListDataFilesView, ListSummaryMeasuresView

urlpatterns = [
    path('api/compute-summary-measures/', ComputeSummaryMeasuresView.as_view(), name='compute_summary_measures'),
    path('api/data-files/', ListDataFilesView.as_view(), name='list_data_files'),
    path('api/summary-measures/', ListSummaryMeasuresView.as_view(), name='list_summary_measures'),
]