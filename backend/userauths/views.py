from django.shortcuts import render

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
import shortuuid

import json
from userauths.models import User, Profile
from userauths.serializer import MyTokenObtainPairSerializer, ProfileSerializer, RegisterSerializer, UserSerializer


# Create your views here.
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

def generate_otp():
    uuid_key = shortuuid.uuid()
    otp = uuid_key[:6]
    return otp

class PasswordRestEmailVerify(generics.RetrieveAPIView):
    permission_classes = (AllowAny, )
    serializer_class = UserSerializer

    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.get(email=email)

        print("user ====", user)

        if user:
            user.otp = generate_otp()
            user.save()

            uidb64 = user.pk
            otp = user.otp

            link = f"http:localhost:5173/create-new-password?otp={otp}&uidb64={uidb64}"

            print("link == ", link)

        return user
    
class PasswordChangeView(generics.CreateAPIView):
    permission_classes = [AllowAny, ]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data

        otp = payload['otp']
        uidb64 = payload['uidb64']
        reset_token = payload['reset_token']
        password = payload['password']

        user = User.objects.get(id=uidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp = ""
            user.reset_token = ""
            user.save()

            return Response({"message": "Password changed successfully."}, status=200)
        else:
            return Response({"error": "Invalid OTP or User ID."}, status=400)
        

@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/',
        '/api/test/'
    ]
    return Response(routes)

class ProfileView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ProfileSerializer

    def get_object(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
        return profile

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    # Check if the HTTP request method is GET.
    if request.method == 'GET':
        # If it is a GET request, it constructs a response message including the username.
        data = f"Congratulations {request.user}, your API just responded to a GET request."
        # It returns a DRF Response object with the response data and an HTTP status code of 200 (OK).
        return Response({'response': data}, status=status.HTTP_200_OK)
    # Check if the HTTP request method is POST.
    elif request.method == 'POST':
        try:
            # If it's a POST request, it attempts to decode the request body from UTF-8 and load it as JSON.
            body = request.body.decode('utf-8')
            data = json.loads(body)
            # Check if the 'text' key exists in the JSON data.
            if 'text' not in data:
                # If 'text' is not present, it returns a response with an error message and an HTTP status of 400 (Bad Request).
                return Response("Invalid JSON data", status=status.HTTP_400_BAD_REQUEST)
            text = data.get('text')
            # If 'text' exists, it constructs a response message including the received text.
            data = f'Congratulations, your API just responded to a POST request with text: {text}'
            # It returns a DRF Response object with the response data and an HTTP status code of 200 (OK).
            return Response({'response': data}, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            # If there's an error decoding the JSON data, it returns a response with an error message and an HTTP status of 400 (Bad Request).
            return Response("Invalid JSON data", status=status.HTTP_400_BAD_REQUEST)
    # If the request method is neither GET nor POST, it returns a response with an error message and an HTTP status of 400 (Bad Request).
    return Response("Invalid JSON data", status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
