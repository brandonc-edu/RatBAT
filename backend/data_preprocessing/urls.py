from django.urls import path
from .views import ListDataFilesView

urlpatterns = [
    path('data-files/', ListDataFilesView.as_view(), name='list_data_files'),
]