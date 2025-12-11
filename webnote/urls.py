from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='webnote_index'),
    path('html/', views.html_page, name='webnote_html'),
    path('css/', views.css_page, name='webnote_css'),
    path('js/', views.js_page, name='webnote_js'),  # js_page に統一
]
