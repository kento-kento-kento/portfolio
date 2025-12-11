from django.urls import path
from . import views

urlpatterns = [
    path('blockpuzzle/', views.blockpuzzle, name='blockpuzzle'),
]