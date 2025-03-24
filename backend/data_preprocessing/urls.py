from django.urls import path
from .views import ListDataFilesView, PreprocessDataView

urlpatterns = [
    path('data-files/', ListDataFilesView.as_view(), name='list_data_files'),
    path('preprocess/', PreprocessDataView.as_view(), name='preprocess_data'),
]