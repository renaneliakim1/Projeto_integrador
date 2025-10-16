from rest_framework import serializers
from rest_framework.exceptions import ValidationError

class UserSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    educational_level = serializers.CharField(required=False, allow_blank=True)
    profession = serializers.CharField(required=False, allow_blank=True)
    focus = serializers.CharField(required=False, allow_blank=True)
    terms_accepted = serializers.BooleanField(write_only=True)
    foto = serializers.ImageField(required=False, allow_null=True)

    def validate_terms_accepted(self, value):
        if not value:
            raise ValidationError("Você deve aceitar os termos e condições para se registrar.")
        return value