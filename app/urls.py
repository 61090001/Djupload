from django.urls import path

from . import views

urlpatterns = [
    path('', views.Home.as_view(), name='home'),
    path('list/page/<int:page>/', views.ListFiles.as_view(), name='list'),
    path('download/file/<int:file_id>', views.download, name='download'),
    path('delete/file/<int:file_id>', views.delete, name='delete'),
    path('upload/', views.upload, name='upload'),
]
