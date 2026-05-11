# Restframework Packages
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework import status

# Serializers
from userauths.serializer import ProfileSerializer
from store.serializers import (
    NotificationSerializer,
    CartOrderSerializer, 
    WishlistSerializer,
)

# Models
from userauths.models import Profile, User 
from store.models import Notification, CartOrder, Product, Wishlist

class OrdersAPIView(generics.ListAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        orders = CartOrder.objects.filter(buyer=user, payment_status="paid")
        return orders

class OrdersDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = (AllowAny,)
    lookup_field = 'user_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        order_oid = self.kwargs['order_oid']

        user = User.objects.get(id=user_id)

        order = CartOrder.objects.get(buyer=user, payment_status="paid", oid=order_oid)
        return order
    
class WishlistCreateAPIView(generics.CreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (AllowAny, )

    def create(self, request):
        payload = request.data 

        product_id = payload['product_id']
        user_id = payload['user_id']

        product = Product.objects.get(id=product_id)
        user = User.objects.get(id=user_id)

        wishlist = Wishlist.objects.filter(product=product,user=user)
        if wishlist:
            wishlist.delete()
            return Response( {"message": "Removed From Wishlist"}, status=status.HTTP_200_OK)
        else:
            wishlist = Wishlist.objects.create(
                product=product,
                user=user,
            )
            return Response( {"message": "Added To Wishlist"}, status=status.HTTP_201_CREATED)

class WishlistAPIView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = (AllowAny, )

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        wishlist = Wishlist.objects.filter(user=user,)
        return wishlist

class CustomerNotificationView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (AllowAny, )

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Notification.objects.filter(user=user)

class CustomerUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (AllowAny, )

# ── Guest Wishlist (Redis) ─────────────────────────────────────────────────────
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from store.serializers import ProductSerializer

WISHLIST_TTL = getattr(settings, 'WISHLIST_GUEST_TTL', 60 * 60 * 24 * 30)

def guest_wishlist_key(guest_id):
    return f"wishlist:guest:{guest_id}"


class GuestWishlistView(APIView):
    """
    GET  /api/v1/guest/wishlist/          → list products in guest wishlist
    POST /api/v1/guest/wishlist/          → toggle (add/remove) a product
    """
    permission_classes = (AllowAny,)

    def _guest_id(self, request):
        return request.headers.get('X-Guest-ID') or request.data.get('guest_id') or request.GET.get('guest_id')

    def get(self, request):
        guest_id = self._guest_id(request)
        if not guest_id:
            return Response([])

        product_ids = cache.get(guest_wishlist_key(guest_id), [])
        products = Product.objects.filter(id__in=product_ids, status='published')
        return Response(ProductSerializer(products, many=True, context={'request': request}).data)

    def post(self, request):
        guest_id = self._guest_id(request)
        product_id = request.data.get('product_id')

        if not guest_id or not product_id:
            return Response({'error': 'guest_id and product_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product_id = int(product_id)
            Product.objects.get(id=product_id)
        except (ValueError, Product.DoesNotExist):
            return Response({'error': 'Invalid product'}, status=status.HTTP_404_NOT_FOUND)

        key = guest_wishlist_key(guest_id)
        product_ids = cache.get(key, [])

        if product_id in product_ids:
            product_ids.remove(product_id)
            message = 'Removed From Wishlist'
            added = False
        else:
            product_ids.append(product_id)
            message = 'Added To Wishlist'
            added = True

        cache.set(key, product_ids, WISHLIST_TTL)
        return Response({'message': message, 'added': added, 'count': len(product_ids)})


class MergeGuestWishlistView(APIView):
    """
    POST /api/v1/guest/wishlist/merge/
    Called right after login to move the Redis wishlist into the user's DB wishlist.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        guest_id = request.data.get('guest_id')
        user_id = request.data.get('user_id')

        if not guest_id or not user_id:
            return Response({'message': 'Nothing to merge'})

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        key = guest_wishlist_key(guest_id)
        product_ids = cache.get(key, [])

        merged = 0
        for pid in product_ids:
            try:
                product = Product.objects.get(id=pid)
                Wishlist.objects.get_or_create(user=user, product=product)
                merged += 1
            except Product.DoesNotExist:
                pass

        cache.delete(key)
        return Response({'message': f'{merged} item(s) merged into your wishlist'})
