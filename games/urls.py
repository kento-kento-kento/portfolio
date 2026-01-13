from django.urls import path
from . import views

urlpatterns = [
    path('blockpuzzle/', views.blockpuzzle, name='blockpuzzle'),
    path("scores/",views.score_view,name ="scores"),
    path("billiard/",views.billiard,name="billiard"),
    path("breakout/",views.breakout,name="breakout"),
    
    #AI用
    path("blockpuzzle/analyze/",views.analyze_view, name="blockpuzzle_analyze"),
]