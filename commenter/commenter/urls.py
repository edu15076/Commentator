"""commenter URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.views.generic.base import TemplateView
from app_commenter.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('user/', ListProfiles.as_view(), name='profiles'),
    path('user/<str:profile>/', RenderUser.as_view(), name='user'),
    path('sign_up/<str:fail>/', SignUp.as_view(), kwargs={'fail': 'error'}, name='sign_up_err'),
    path('sign_up/', SignUp.as_view(), name='sign_up'),
    path('sign_in/<str:fail>/', SignIn.as_view(), kwargs={'fail': 'error'}, name='sign_in_err'),
    path('sign_in/', SignIn.as_view(), name='sign_in'),
    path('sign_out/<str:username>/', SignOut.as_view(), name='sign_out'),
    path('delete_account/<str:username>/', DeleteAccount.as_view(), name='delete_account'),
    path('is_sign/', Signed.as_view(), name='is_sign'),  # AJAX. Get username and name for js
    path('validate_email/', validate_email_get, name='validate_email'),  # AJAX. Verify if email is unique
    path('username_in_use/', validate_username_get, name='username_in_use'),  # AJAX. Verify if username is valid
    path('validate_password/', validate_password_post, name='validate_password'),  # AJAX. Verify if password is valid
    path('user/<str:profile>/comment/', post_comment, name='post_comment'),  # AJAX. Post comment
    path('user/self/att_bio/', att_bio, name='att_bio'),  # AJAX. Update the bio
    path('user/self/att_info/', att_info, name='att_info'),  # AJAX. Update the user
    path('validate_github/', validate_github, name='validate_github'),  # AJAX. Verify a url
    path('delete_comment/<int:pk>/', delete_comment, name='validate_github'),  # AJAX. Delete a comment
]
