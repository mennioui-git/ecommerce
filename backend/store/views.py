from django.shortcuts import render

from store.models import Category, Product
from store.serializers import CategorySerializer, ProductSerializer

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.
class CategoryListApiView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductListApiView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

class ProductDetailApiView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        slug = self.kwargs.get('slug')
        return Product.objects.get(slug=slug)
