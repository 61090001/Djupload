from django.urls import path

from . import views

urlpatterns = [
    path('', views.Home.as_view(), name='home'),
    path('genuploadurl', views.gensigneduploadurl),
    path('genreadurl', views.gensignedreadurl),
]
