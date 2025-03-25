# filepath: /home/yadavi1/RatBAT/backend/data_preprocessing/urls.py
from django.urls import path
from .views import PreprocessDataView, DownloadFileView

urlpatterns = [
    path('preprocess/', PreprocessDataView.as_view(), name='preprocess_data'),
    path('download/<str:filename>/', DownloadFileView.as_view(), name='download_file'),
]