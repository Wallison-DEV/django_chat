from django.contrib.auth.decorators import login_required
from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from chat.views import MessageListView, MessageDetailView, UserListView, SignUp

router = DefaultRouter()
router.register(r'message', MessageListView, basename='message-api')
router.register(r'user', UserListView, basename='user-api')

urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('message/<int:pk>/', MessageDetailView.as_view(actions={'get': 'retrieve'}), name='message-detail-api'),
    path('', login_required(TemplateView.as_view(template_name='chat/chat.html')), name='home'),
    path('register/', SignUp.as_view(), name='register')
]
