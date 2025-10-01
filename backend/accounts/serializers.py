from rest_framework import serializers
from .models import User, UserGamification

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para criar novos usuários. A senha é write-only.
    """
    class Meta:
        model = User
        # Campos que virão do frontend no registro
        fields = ('id', 'email', 'password', 'first_name', 'birth_date', 'educational_level', 'profession', 'focus', 'terms_accepted')
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
        }

    def create(self, validated_data):
        # O AbstractUser espera 'username', vamos usar o email para isso também
        # O campo 'first_name' do model vai receber o 'name' do frontend
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            birth_date=validated_data.get('birth_date'),
            educational_level=validated_data.get('educational_level', ''),
            profession=validated_data.get('profession', ''),
            focus=validated_data.get('focus', ''),
            terms_accepted=validated_data.get('terms_accepted', False)
        )
        # Cria o perfil de gamificação associado
        UserGamification.objects.create(user=user)
        return user

class UserGamificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGamification
        fields = ('level', 'xp', 'streak', 'quiz_completed')

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para visualizar e atualizar o perfil do usuário.
    """
    gamification = UserGamificationSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'birth_date', 
            'educational_level', 'profession', 'focus', 'photo_url', 
            'date_joined', 'gamification'
        )
        read_only_fields = ('email', 'date_joined', 'gamification')
