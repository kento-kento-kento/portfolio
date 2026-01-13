from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'memoapp'

urlpatterns = [
    path('', views.memo_home, name='memo_home'),
    path('memo/', views.add_memo, name='add_memo'),
    path('memo/delete/<int:pk>/', views.delete_memo, name='delete_memo'),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('signup/', views.signup, name='signup'),
]

