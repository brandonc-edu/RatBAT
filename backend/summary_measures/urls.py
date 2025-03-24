from django.urls import path
from summary_measures.views import ComputeSummaryMeasuresView, ListDataFilesView, ListSummaryMeasuresView

urlpatterns = [
    path('compute-summary-measures/', ComputeSummaryMeasuresView.as_view(), name='compute_summary_measures'),
    path('data-files/', ListDataFilesView.as_view(), name='list_data_files'),
    path('summary-measures/', ListSummaryMeasuresView.as_view(), name='list_summary_measures'),
]