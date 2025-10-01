from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, UserProfileSerializer

class RegisterView(generics.CreateAPIView):
    """
    Endpoint para registrar um novo usuário.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] # Qualquer um pode se registrar
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Gera o token JWT para o novo usuário
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para ver e atualizar o perfil do usuário logado.
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Apenas usuários logados

    def get_object(self):
        # Retorna o objeto do usuário que está fazendo a requisição
        return self.request.user