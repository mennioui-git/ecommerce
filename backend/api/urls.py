from django.urls import path

from userauths import views as userauths_views
from store import views as store_views

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('user/token/', userauths_views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('user/register/', userauths_views.RegisterView.as_view(), name='user_register'),
    path('user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/password-reset/<email>/', userauths_views.PasswordRestEmailVerify.as_view(), name='user_verify'),
    path('user/password-change/', userauths_views.PasswordChangeView.as_view(), name='password_change'),

    # Store API endpoints
    path('category/', store_views.CategoryListApiView.as_view(), name='category_list'),
    path('products/', store_views.ProductListApiView.as_view(), name='product_list'),
    path('products/<int:slug>/', store_views.ProductDetailApiView.as_view(), name='product_detail'),
]
